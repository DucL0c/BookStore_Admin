import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.API_BASE_URL || "https://localhost:7061/api/",
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response.data,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      window.location.href = "/signin";
    }
    return Promise.reject(err);
  }
);

export default axiosClient;
