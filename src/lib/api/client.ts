import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import type { ApiEnvelope } from '@/types';

const rawBaseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';
export const baseURL = rawBaseURL.endsWith('/') ? rawBaseURL.slice(0, -1) : rawBaseURL;
const TOKEN_KEY = 'ieltsbf_access_token';

export const tokenStorage = {
  get: () => (typeof window === 'undefined' ? null : localStorage.getItem(TOKEN_KEY)),
  set: (token: string) => { if (typeof window !== 'undefined') localStorage.setItem(TOKEN_KEY, token); },
  clear: () => { if (typeof window !== 'undefined') localStorage.removeItem(TOKEN_KEY); },
};

export const http = axios.create({ baseURL, withCredentials: true, headers: { 'Content-Type': 'application/json' } });

http.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshPromise: Promise<string | null> | null = null;
const refreshToken = async () => {
  const res = await axios.post<ApiEnvelope<{ accessToken?: string }> | { accessToken?: string }>(`${baseURL}/auth/refresh`, {}, { withCredentials: true });
  const data = 'data' in res.data && (res.data as ApiEnvelope<{ accessToken?: string }>).success !== undefined
    ? (res.data as ApiEnvelope<{ accessToken?: string }>).data
    : (res.data as { accessToken?: string });
  const token = data?.accessToken || null;
  if (token) tokenStorage.set(token);
  return token;
};

http.interceptors.response.use((r) => r, async (error: AxiosError<any>) => {
  const original = error.config as AxiosRequestConfig & { _retry?: boolean };
  if (error.response?.status === 401 && original && !original._retry && !String(original.url).includes('/auth/login')) {
    original._retry = true;
    refreshPromise ||= refreshToken().finally(() => { refreshPromise = null; });
    const token = await refreshPromise.catch(() => null);
    if (token) return http(original);
    tokenStorage.clear();
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth')) window.location.href = '/auth/login';
  }
  const message = error.response?.data?.message || error.response?.data?.error || error.message || 'Có lỗi xảy ra';
  return Promise.reject(new Error(Array.isArray(message) ? message.join(', ') : message));
});

const unwrap = <T>(payload: ApiEnvelope<T> | T): T => {
  if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) return (payload as ApiEnvelope<T>).data;
  return payload as T;
};
const unwrapWithMeta = <T>(payload: ApiEnvelope<T> | T): { data: T; meta?: ApiEnvelope<T>['meta'] } => {
  if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
    const p = payload as ApiEnvelope<T>;
    return { data: p.data, meta: p.meta };
  }
  return { data: payload as T };
};

export const api = {
  get: async <T>(url: string, config?: AxiosRequestConfig) => unwrap<T>((await http.get<ApiEnvelope<T> | T>(url, config)).data),
  getWithMeta: async <T>(url: string, config?: AxiosRequestConfig) => unwrapWithMeta<T>((await http.get<ApiEnvelope<T> | T>(url, config)).data),
  post: async <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => unwrap<T>((await http.post<ApiEnvelope<T> | T>(url, data, config)).data),
  patch: async <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => unwrap<T>((await http.patch<ApiEnvelope<T> | T>(url, data, config)).data),
  put: async <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => unwrap<T>((await http.put<ApiEnvelope<T> | T>(url, data, config)).data),
  delete: async <T>(url: string, config?: AxiosRequestConfig) => unwrap<T>((await http.delete<ApiEnvelope<T> | T>(url, config)).data),
};
export const getErrorMessage = (error: unknown) => error instanceof Error ? error.message : 'Có lỗi xảy ra';
