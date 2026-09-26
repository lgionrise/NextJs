"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { authApi, SanitizedUser } from "./api";

interface Tokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthContextValue {
  user: SanitizedUser | null;
  tokens: Tokens | null;
  isLoading: boolean;
  setSession: (user: SanitizedUser, tokens: Tokens) => void;
  clearSession: () => void;
  refreshAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const STORAGE_KEY = "lgionrise_auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SanitizedUser | null>(null);
  const [tokens, setTokens] = useState<Tokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setUser(parsed.user);
        setTokens(parsed.tokens);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const setSession = useCallback((nextUser: SanitizedUser, nextTokens: Tokens) => {
    setUser(nextUser);
    setTokens(nextTokens);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: nextUser, tokens: nextTokens }));
  }, []);

  const clearSession = useCallback(() => {
    setUser(null);
    setTokens(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const refreshAccessToken = useCallback(async () => {
    if (!tokens?.refreshToken) return null;
    try {
      const result = await authApi.refresh(tokens.refreshToken);
      const nextTokens = { accessToken: result.accessToken, refreshToken: result.refreshToken };
      setTokens(nextTokens);
      if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, tokens: nextTokens }));
      }
      return result.accessToken;
    } catch {
      clearSession();
      return null;
    }
  }, [tokens, user, clearSession]);

  return (
    <AuthContext.Provider
      value={{ user, tokens, isLoading, setSession, clearSession, refreshAccessToken }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
