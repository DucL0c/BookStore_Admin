import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { authStore } from '../auth/auth.store';
import { AuthService } from '../auth/auth.service';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'https://localhost:7061/api';

export const http: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null) => {
  pendingQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token ?? undefined)));
  pendingQueue = [];
};

http.interceptors.request.use((config) => {
  const token = authStore.getState().accessToken;
  if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;

    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // Đợi refresh xong rồi retry
        return new Promise((resolve, reject) => {
          pendingQueue.push({
            resolve: async () => {
              try {
                const token = authStore.getState().accessToken;
                if (token && originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                }
                resolve(await http(originalRequest));
              } catch (e) {
                reject(e);
              }
            },
            reject,
          });
        });
      }

      isRefreshing = true;
      try {
        const newToken = await AuthService.refreshToken();
        processQueue(null, newToken);
        if (originalRequest.headers && newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return http(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        AuthService.logout(); // xóa state + localStorage
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);
