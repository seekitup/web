import type { AxiosError } from "axios";

interface ApiErrorBody {
  message?: string | string[];
  statusCode?: number;
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  const axiosErr = error as AxiosError<ApiErrorBody> | undefined;
  const data = axiosErr?.response?.data;
  const msg = data?.message;
  if (Array.isArray(msg)) return msg[0] ?? fallback;
  if (typeof msg === "string" && msg.length > 0) return msg;
  return fallback;
}

export function getApiErrorStatus(error: unknown): number | undefined {
  return (error as AxiosError | undefined)?.response?.status;
}

export function isNetworkError(error: unknown): boolean {
  const axiosErr = error as AxiosError | undefined;
  if (!axiosErr) return false;
  // No response means the request never reached the server (offline / DNS / CORS preflight)
  if (axiosErr.response) return false;
  if (axiosErr.code === "ERR_NETWORK") return true;
  if (axiosErr.code === "ECONNABORTED") return true;
  return axiosErr.message?.toLowerCase().includes("network") ?? false;
}
