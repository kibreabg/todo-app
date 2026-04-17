export type AuthUser = {
  userId: string;
  email: string;
  userName: string;
  expiresAtUtc: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  email: string;
  password: string;
  userName?: string;
};
