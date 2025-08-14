export type LoginPayload = {
  email: string;
  password: string;
};

export type AuthUser = {
  email: string;
  fullName: string;
  role: string;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};
