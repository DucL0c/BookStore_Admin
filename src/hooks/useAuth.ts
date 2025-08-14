import { authStore } from '../auth/auth.store';
import { AuthService } from '../auth/auth.service';
import type { LoginPayload } from '../auth/auth.types';

export function useAuth() {
  const user = authStore((s) => s.user);
  const accessToken = authStore((s) => s.accessToken);

  const login = (payload: LoginPayload) => AuthService.login(payload);
  const logout = () => AuthService.logout();

  return { user, accessToken, login, logout, isAuthenticated: !!user && !!accessToken };
}
