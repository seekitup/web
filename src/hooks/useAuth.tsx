import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";

import { api } from "@/lib/api";
import { authStorage, AUTH_STORAGE_KEYS } from "@/lib/authStorage";
import { isNetworkError } from "@/lib/apiError";
import type {
  LoginDto,
  RegisterDto,
  RequestOtpDto,
  UserResponseDto,
  VerifyOtpDto,
} from "@/types/api";

import { useNetworkStatus } from "./useNetworkStatus";

interface AuthContextValue {
  user: UserResponseDto | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  /** True when a token exists locally but we couldn't verify it (offline / server down). */
  needsOnlineVerification: boolean;
  login: (data: LoginDto) => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
  requestOtp: (data: RequestOtpDto) => Promise<void>;
  verifyOtp: (data: VerifyOtpDto) => Promise<UserResponseDto>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (user: UserResponseDto | null) => void;
  retryAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponseDto | null>(() =>
    authStorage.getUser(),
  );
  const [isLoading, setIsLoading] = useState(true);
  const [needsOnlineVerification, setNeedsOnlineVerification] = useState(false);

  const { isConnected } = useNetworkStatus();
  const queryClient = useQueryClient();

  const clearAllCaches = useCallback(async () => {
    try {
      await queryClient.cancelQueries();
    } catch {
      // cancelQueries can reject with AbortError; ignore.
    }
    queryClient.clear();
  }, [queryClient]);

  const verifyAuth = useCallback(async (): Promise<boolean> => {
    const token = authStorage.getToken();
    if (!token) {
      setUser(null);
      setNeedsOnlineVerification(false);
      return false;
    }

    try {
      const currentUser = await api.auth.getCurrentUser();
      setUser(currentUser);
      authStorage.setUser(currentUser);
      setNeedsOnlineVerification(false);
      return true;
    } catch (error) {
      if (isNetworkError(error)) {
        const stored = authStorage.getUser();
        if (stored) {
          setUser(stored);
          setNeedsOnlineVerification(true);
          return false;
        }
      }

      const status = (error as AxiosError).response?.status;
      if (status === 401) {
        authStorage.clearAuth();
        await clearAllCaches();
        setUser(null);
        setNeedsOnlineVerification(false);
        return false;
      }

      const stored = authStorage.getUser();
      if (stored) {
        setUser(stored);
        setNeedsOnlineVerification(true);
        return false;
      }

      authStorage.clearAuth();
      await clearAllCaches();
      setUser(null);
      setNeedsOnlineVerification(false);
      return false;
    }
  }, [clearAllCaches]);

  // Initial verification on mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      await verifyAuth();
      if (!cancelled) setIsLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [verifyAuth]);

  // Retry verification when the network comes back.
  useEffect(() => {
    if (isConnected && needsOnlineVerification) {
      // verifyAuth is async — its setState calls happen after the promise resolves.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      verifyAuth();
    }
  }, [isConnected, needsOnlineVerification, verifyAuth]);

  // Cross-tab sync: respond to localStorage changes from other tabs.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (
        event.key !== AUTH_STORAGE_KEYS.ACCESS_TOKEN &&
        event.key !== AUTH_STORAGE_KEYS.USER &&
        event.key !== null
      ) {
        return;
      }
      const token = authStorage.getToken();
      if (!token) {
        setUser(null);
        setNeedsOnlineVerification(false);
        clearAllCaches();
      } else {
        const stored = authStorage.getUser();
        if (stored) setUser(stored);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [clearAllCaches]);

  // Safety net: if the user identity changes via any path that bypassed
  // logout()+login() (e.g. /auth/callback, manual storage edit), wipe caches.
  const previousUserIdRef = useRef<number | null>(user?.id ?? null);
  useEffect(() => {
    const prev = previousUserIdRef.current;
    const next = user?.id ?? null;
    if (prev != null && next != null && prev !== next) {
      clearAllCaches();
    }
    previousUserIdRef.current = next;
  }, [user?.id, clearAllCaches]);

  const retryAuth = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    const success = await verifyAuth();
    setIsLoading(false);
    return success;
  }, [verifyAuth]);

  const login = useCallback(async (data: LoginDto) => {
    const response = await api.auth.login(data);
    authStorage.saveAuthResponse(response);
    setUser(response.user);
    setNeedsOnlineVerification(false);
  }, []);

  const register = useCallback(async (data: RegisterDto) => {
    const response = await api.auth.register(data);
    authStorage.saveAuthResponse(response);
    setUser(response.user);
    setNeedsOnlineVerification(false);
  }, []);

  const requestOtp = useCallback(async (data: RequestOtpDto) => {
    await api.auth.requestOtp(data);
  }, []);

  const verifyOtp = useCallback(async (data: VerifyOtpDto) => {
    const response = await api.auth.verifyOtp(data);
    authStorage.saveAuthResponse(response);
    setUser(response.user);
    setNeedsOnlineVerification(false);
    return response.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.auth.logout();
    } catch {
      // even if the server call fails, we still want to clear locally.
    }
    authStorage.clearAuth();
    await clearAllCaches();
    setUser(null);
    setNeedsOnlineVerification(false);
  }, [clearAllCaches]);

  const refreshUser = useCallback(async () => {
    const currentUser = await api.auth.getCurrentUser();
    setUser(currentUser);
    authStorage.setUser(currentUser);
    setNeedsOnlineVerification(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        needsOnlineVerification,
        login,
        register,
        requestOtp,
        verifyOtp,
        logout,
        refreshUser,
        setUser,
        retryAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
