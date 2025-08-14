import { http } from './http';
import type { LoginPayload, LoginResponse, AuthUser } from './auth.types';
import { authStore } from './auth.store';

export const AuthService = {
  async login(payload: LoginPayload): Promise<AuthUser> {
    const { data } = await http.post<LoginResponse>('/Auth/login', payload);
    const user: AuthUser = {
      fullName: data.user.fullName,
      email: data.user.email,
      role: data.user.role,
    };
    authStore.getState().setAuth(user, data.accessToken, data.refreshToken);
    return user;
  },

  async logout(): Promise<void> {
    try {
      await http.post('/Auth/logout'); 
    } catch (_) {
    } finally {
      authStore.getState().clearAuth();
    }
  },

  async refreshToken(): Promise<string | null> {
    const { data } = await http.post<{ accessToken: string, refreshToken: string }>('/Auth/refresh');
    const state = authStore.getState();
    if (data?.accessToken && state.user) {
      state.setAuth(state.user, data.accessToken, data.refreshToken);
      return data.accessToken;
    }
    return null;
  },
};
