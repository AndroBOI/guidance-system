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
  role: string;
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
      console.log("[AuthContext] Fetching user...");
      const res = await api.get<User>("/users/me");
      console.log("[AuthContext] User fetched:", res.data);
      setUser(res.data);
      return res.data;
    } catch (error) {
      console.log("[AuthContext] Failed to fetch user:", error);
      setUser(null);
      return null;
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      try {
        console.log("[AuthContext] Initial load - fetching user...");
        await fetchUser();
      } catch {
        console.log("[AuthContext] Initial fetch failed (user not logged in)");
      } finally {
        if (isMounted) {
          console.log("[AuthContext] Setting loading to false");
          setLoading(false);
        }
      }
    };

    loadUser();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    try {
      console.log("[AuthContext] Logging in...");
      const response = await api.post("/auth/signin", { email, password });

      console.log("[AuthContext] Login response:", response.data);

      // Get user data directly from signin response
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
    console.log("[AuthContext] Logging out...");
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
