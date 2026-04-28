import type { AuthResponseDto, UserResponseDto } from "@/types/api";

const ACCESS_TOKEN_KEY = "accessToken";
const USER_KEY = "user";
const REMEMBERED_EMAIL_KEY = "rememberedEmail";

const isBrowser = typeof window !== "undefined" && typeof localStorage !== "undefined";

function readString(key: string): string | null {
  if (!isBrowser) return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeString(key: string, value: string): void {
  if (!isBrowser) return;
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore quota / privacy mode errors
  }
}

function removeKey(key: string): void {
  if (!isBrowser) return;
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

function readJson<T>(key: string): T | null {
  const raw = readString(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJson<T>(key: string, value: T): void {
  writeString(key, JSON.stringify(value));
}

export const authStorage = {
  getToken: (): string | null => readString(ACCESS_TOKEN_KEY),
  setToken: (token: string): void => writeString(ACCESS_TOKEN_KEY, token),
  removeToken: (): void => removeKey(ACCESS_TOKEN_KEY),

  getUser: (): UserResponseDto | null => readJson<UserResponseDto>(USER_KEY),
  setUser: (user: UserResponseDto): void => writeJson(USER_KEY, user),
  removeUser: (): void => removeKey(USER_KEY),

  saveAuthResponse: (response: AuthResponseDto): void => {
    writeString(ACCESS_TOKEN_KEY, response.accessToken);
    writeJson(USER_KEY, response.user);
  },

  clearAuth: (): void => {
    removeKey(ACCESS_TOKEN_KEY);
    removeKey(USER_KEY);
  },

  isAuthenticated: (): boolean => !!readString(ACCESS_TOKEN_KEY),

  getRememberedEmail: (): string | null => readString(REMEMBERED_EMAIL_KEY),
  saveRememberedEmail: (email: string): void => writeString(REMEMBERED_EMAIL_KEY, email),
  clearRememberedEmail: (): void => removeKey(REMEMBERED_EMAIL_KEY),
};

export const AUTH_STORAGE_KEYS = {
  ACCESS_TOKEN: ACCESS_TOKEN_KEY,
  USER: USER_KEY,
  REMEMBERED_EMAIL: REMEMBERED_EMAIL_KEY,
} as const;
