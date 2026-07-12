"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import api from "@/lib/api";

interface User {
  sub: string;
  email: string;
  role: "ADMIN" | "USER";
  hasProfile?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async (): Promise<User | null> => {
    try {
      const res = await api.get<User>("/users/me");
      setUser(res.data);
      return res.data;
    } catch (error) {
      console.log("[AuthContext] Failed to fetch user");
      setUser(null);
      return null;
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      try {
        await fetchUser();
      } catch {
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    try {
      console.log("[AuthContext] Logging in...");
      const response = await api.post<{ user: User }>("/auth/signin", {
        email,
        password,
      });

      console.log("[AuthContext] Login response:", response.data);

      const userData = response.data.user;

      if (!userData) {
        throw new Error("No user data in signin response");
      }

      console.log("[AuthContext] User data received:", userData);
      setUser(userData);

      return userData;
    } catch (error) {
      console.error("[AuthContext] Login error:", error);

      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: { status?: number; data?: { message?: string } };
        };

        if (axiosError.response?.status === 403) {
          throw new Error(
            axiosError.response?.data?.message || "Invalid credentials",
          );
        }
        if (axiosError.response?.data?.message) {
          throw new Error(axiosError.response.data.message);
        }
      }

      throw new Error("Login failed. Please try again.");
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      console.log("[AuthContext] Logout failed but clearing user anyway");
    }
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
