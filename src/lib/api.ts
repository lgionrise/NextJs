const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api/v1";

export class ApiError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  message?: string | string[];
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  let body: ApiEnvelope<T> | undefined;
  try {
    body = await response.json();
  } catch {
    body = undefined;
  }

  if (!response.ok || !body?.success) {
    const rawMessage = body?.message ?? `Request failed with status ${response.status}`;
    const message = Array.isArray(rawMessage) ? rawMessage.join(", ") : rawMessage;
    throw new ApiError(message, response.status);
  }

  return body!.data as T;
}

function authHeader(accessToken?: string): HeadersInit {
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

export enum OtpPurpose {
  EMAIL_VERIFICATION = "EMAIL_VERIFICATION",
  PHONE_VERIFICATION = "PHONE_VERIFICATION",
  PASSWORD_RESET = "PASSWORD_RESET",
  TWO_FACTOR_AUTH = "TWO_FACTOR_AUTH",
}

export interface SanitizedUser {
  id: string;
  email: string | null;
  phone: string | null;
  role: "STUDENT" | "TEACHER" | "ADMIN" | "SUPER_ADMIN";
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
}

export type LoginResult =
  | { requiresTwoFactor: true; mfaToken: string; message: string }
  | {
      requiresTwoFactor: false;
      user: SanitizedUser;
      accessToken: string;
      refreshToken: string;
    };

export const authApi = {
  register: (payload: { email?: string; phone?: string; password: string }) =>
    request<SanitizedUser>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  login: (payload: { email?: string; phone?: string; password: string; deviceId?: string }) =>
    request<LoginResult>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  verifyTwoFactorLogin: (payload: { mfaToken: string; code: string }) =>
    request<{ user: SanitizedUser; accessToken: string; refreshToken: string }>(
      "/auth/2fa/verify-login",
      { method: "POST", body: JSON.stringify(payload) },
    ),

  sendOtp: (payload: { email?: string; phone?: string; purpose: OtpPurpose }) =>
    request<{ message: string; expiresInSeconds: number }>("/auth/send-otp", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  verifyOtp: (payload: { email?: string; phone?: string; purpose: OtpPurpose; otp: string }) =>
    request<{ message: string }>("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  forgotPassword: (payload: { email?: string; phone?: string }) =>
    request<{ message: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  resetPassword: (payload: { email?: string; phone?: string; otp: string; newPassword: string }) =>
    request<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  refresh: (refreshToken: string) =>
    request<{ accessToken: string; refreshToken: string }>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    }),

  logout: (accessToken: string, refreshToken: string) =>
    request<{ message: string }>("/auth/logout", {
      method: "POST",
      headers: authHeader(accessToken),
      body: JSON.stringify({ refreshToken }),
    }),

  me: (accessToken: string) =>
    request<SanitizedUser>("/auth/me", {
      method: "GET",
      headers: authHeader(accessToken),
    }),
};

export const studentApi = {
  getDashboard: (accessToken: string) =>
    request<unknown>("/student/dashboard", {
      method: "GET",
      headers: authHeader(accessToken),
    }),
};
