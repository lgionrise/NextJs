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

function buildQuery(params: Record<string, string | undefined>): string {
  const filtered = Object.entries(params).filter(([, v]) => v !== undefined && v !== "");
  if (filtered.length === 0) return "";
  return "?" + new URLSearchParams(filtered as [string, string][]).toString();
}

export enum OtpPurpose {
  EMAIL_VERIFICATION = "EMAIL_VERIFICATION",
  PHONE_VERIFICATION = "PHONE_VERIFICATION",
  PASSWORD_RESET = "PASSWORD_RESET",
  TWO_FACTOR_AUTH = "TWO_FACTOR_AUTH",
}

export type UserRole = "STUDENT" | "TEACHER" | "ADMIN" | "SUPER_ADMIN";

export interface SanitizedUser {
  id: string;
  username: string | null;
  email: string | null;
  phone: string | null;
  role: UserRole;
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

export function redirectPathForRole(role: UserRole): string {
  if (role === "TEACHER") return "/teacher/dashboard";
  if (role === "ADMIN" || role === "SUPER_ADMIN") return "/admin/dashboard";
  return "/student/dashboard";
}

// ─── AUTH ─────────────────────────────────────────────────────────────

export const authApi = {
  register: (payload: { email?: string; phone?: string; password: string; role?: "STUDENT" | "TEACHER" }) =>
    request<SanitizedUser>("/auth/register", { method: "POST", body: JSON.stringify(payload) }),

  login: (payload: {
    email?: string;
    phone?: string;
    username?: string;
    password: string;
    deviceId?: string;
  }) => request<LoginResult>("/auth/login", { method: "POST", body: JSON.stringify(payload) }),

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
    request<{ message: string }>("/auth/verify-otp", { method: "POST", body: JSON.stringify(payload) }),

  forgotPassword: (payload: { email?: string; phone?: string }) =>
    request<{ message: string }>("/auth/forgot-password", { method: "POST", body: JSON.stringify(payload) }),

  resetPassword: (payload: { email?: string; phone?: string; otp: string; newPassword: string }) =>
    request<{ message: string }>("/auth/reset-password", { method: "POST", body: JSON.stringify(payload) }),

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
};

export const studentApi = {
  getDashboard: (accessToken: string) =>
    request<unknown>("/student/dashboard", { method: "GET", headers: authHeader(accessToken) }),
};

// ─── TEACHER ──────────────────────────────────────────────────────────

export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface TeacherProfileData {
  id: string;
  userId: string;
  fullName: string | null;
  photoUrl: string | null;
  bio: string | null;
  qualifications: string | null;
  experienceYears: number | null;
  subjects: string[];
  videoIntroUrl: string | null;
  youtubeUrl: string | null;
  linkedinUrl: string | null;
  approvalStatus: ApprovalStatus;
  rejectionReason: string | null;
  isVisible: boolean;
  createdAt: string;
  user?: { id: string; email: string | null; phone: string | null; createdAt: string };
}

export interface SubmitTeacherApplicationPayload {
  fullName: string;
  photoUrl?: string;
  bio: string;
  qualifications: string;
  experienceYears: number;
  subjects: string[];
  videoIntroUrl?: string;
  youtubeUrl?: string;
  linkedinUrl?: string;
}

export const teacherApi = {
  getMyProfile: (accessToken: string) =>
    request<TeacherProfileData>("/teacher/profile", { method: "GET", headers: authHeader(accessToken) }),

  submitApplication: (accessToken: string, payload: SubmitTeacherApplicationPayload) =>
    request<TeacherProfileData>("/teacher/profile/apply", {
      method: "POST",
      headers: authHeader(accessToken),
      body: JSON.stringify(payload),
    }),

  updateMyProfile: (accessToken: string, payload: Partial<SubmitTeacherApplicationPayload>) =>
    request<TeacherProfileData>("/teacher/profile", {
      method: "PATCH",
      headers: authHeader(accessToken),
      body: JSON.stringify(payload),
    }),

  updateVisibility: (accessToken: string, isVisible: boolean) =>
    request<TeacherProfileData>("/teacher/profile/visibility", {
      method: "PATCH",
      headers: authHeader(accessToken),
      body: JSON.stringify({ isVisible }),
    }),
};

export const adminTeacherApi = {
  listApplications: (accessToken: string, status?: ApprovalStatus) =>
    request<TeacherProfileData[]>(`/admin/teachers/applications${buildQuery({ status })}`, {
      method: "GET",
      headers: authHeader(accessToken),
    }),

  getApplication: (accessToken: string, id: string) =>
    request<TeacherProfileData>(`/admin/teachers/applications/${id}`, {
      method: "GET",
      headers: authHeader(accessToken),
    }),

  reviewApplication: (
    accessToken: string,
    id: string,
    payload: { status: "APPROVED" | "REJECTED"; rejectionReason?: string },
  ) =>
    request<TeacherProfileData>(`/admin/teachers/applications/${id}/review`, {
      method: "POST",
      headers: authHeader(accessToken),
      body: JSON.stringify(payload),
    }),
};

// ─── COURSES ──────────────────────────────────────────────────────────

export type TargetExam = "JEE_MAIN" | "JEE_ADVANCED" | "NEET" | "BOARDS_10" | "BOARDS_12" | "OTHER";
export type CourseStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface ChapterData {
  id: string;
  title: string;
  orderIndex: number;
  topics: string[];
}

export interface CourseData {
  id: string;
  title: string;
  slug: string;
  description: string;
  targetExam: TargetExam;
  className: string;
  status: CourseStatus;
  chapters?: ChapterData[];
  batches?: BatchData[];
  createdAt: string;
}

export const courseApi = {
  create: (accessToken: string, payload: { title: string; description: string; targetExam: TargetExam; className: string }) =>
    request<CourseData>("/courses", { method: "POST", headers: authHeader(accessToken), body: JSON.stringify(payload) }),

  list: (params?: { status?: CourseStatus; targetExam?: string }) =>
    request<CourseData[]>(`/courses${buildQuery(params ?? {})}`, { method: "GET" }),

  getOne: (id: string) => request<CourseData>(`/courses/${id}`, { method: "GET" }),

  update: (accessToken: string, id: string, payload: Partial<{ title: string; description: string; targetExam: TargetExam; className: string }>) =>
    request<CourseData>(`/courses/${id}`, { method: "PATCH", headers: authHeader(accessToken), body: JSON.stringify(payload) }),

  publish: (accessToken: string, id: string) =>
    request<CourseData>(`/courses/${id}/publish`, { method: "POST", headers: authHeader(accessToken) }),

  archive: (accessToken: string, id: string) =>
    request<CourseData>(`/courses/${id}/archive`, { method: "POST", headers: authHeader(accessToken) }),

  delete: (accessToken: string, id: string) =>
    request<{ message: string }>(`/courses/${id}`, { method: "DELETE", headers: authHeader(accessToken) }),

  addChapter: (accessToken: string, id: string, payload: { title: string; orderIndex: number; topics?: string[] }) =>
    request<ChapterData>(`/courses/${id}/chapters`, { method: "POST", headers: authHeader(accessToken), body: JSON.stringify(payload) }),

  removeChapter: (accessToken: string, id: string, chapterId: string) =>
    request<{ message: string }>(`/courses/${id}/chapters/${chapterId}`, {
      method: "DELETE",
      headers: authHeader(accessToken),
    }),
};

// ─── BATCHES ──────────────────────────────────────────────────────────

export type BatchStatus = "DRAFT" | "UPCOMING" | "ONGOING" | "COMPLETED" | "ARCHIVED";
export type WeekDay = "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY";
export type LanguageOption = "ENGLISH" | "HINDI" | "HINGLISH" | "REGIONAL";

export interface ScheduleEntry {
  dayOfWeek: WeekDay;
  startTime: string;
  endTime: string;
  subject?: string;
}

export interface BatchData {
  id: string;
  courseId: string;
  name: string;
  slug: string;
  description: string | null;
  teacherUserId: string;
  language: LanguageOption;
  status: BatchStatus;
  priceInPaise: number;
  discountedPriceInPaise: number | null;
  validityDays: number;
  startDate: string;
  endDate: string | null;
  maxStudents: number | null;
  schedules?: (ScheduleEntry & { id: string })[];
  course?: { id: string; title: string; targetExam: TargetExam };
  teacher?: { id: string; teacherProfile?: { fullName: string | null; photoUrl: string | null } };
  createdAt?: string;
}

export interface CreateBatchPayload {
  courseId: string;
  name: string;
  description?: string;
  teacherUserId: string;
  language?: LanguageOption;
  priceInPaise: number;
  discountedPriceInPaise?: number;
  validityDays: number;
  startDate: string;
  endDate?: string;
  maxStudents?: number;
  schedules: ScheduleEntry[];
}

export const batchApi = {
  create: (accessToken: string, payload: CreateBatchPayload) =>
    request<BatchData>("/batches", { method: "POST", headers: authHeader(accessToken), body: JSON.stringify(payload) }),

  list: (params?: { status?: BatchStatus; courseId?: string; teacherUserId?: string }) =>
    request<BatchData[]>(`/batches${buildQuery(params ?? {})}`, { method: "GET" }),

  getOne: (id: string) => request<BatchData>(`/batches/${id}`, { method: "GET" }),

  update: (accessToken: string, id: string, payload: Partial<Omit<CreateBatchPayload, "schedules" | "courseId" | "teacherUserId">>) =>
    request<BatchData>(`/batches/${id}`, { method: "PATCH", headers: authHeader(accessToken), body: JSON.stringify(payload) }),

  publish: (accessToken: string, id: string) =>
    request<BatchData>(`/batches/${id}/publish`, { method: "POST", headers: authHeader(accessToken) }),

  archive: (accessToken: string, id: string) =>
    request<BatchData>(`/batches/${id}/archive`, { method: "POST", headers: authHeader(accessToken) }),

  delete: (accessToken: string, id: string) =>
    request<{ message: string }>(`/batches/${id}`, { method: "DELETE", headers: authHeader(accessToken) }),
};
