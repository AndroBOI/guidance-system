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
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>; // ✅ Added
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      console.log("📡 Fetching user...");
      const res = await api.get<User>("/users/me");
      console.log("✅ User fetched:", res.data);
      setUser(res.data);
    } catch (error) {
      console.log("❌ Failed to fetch user");
      setUser(null);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      await fetchUser();
      if (isMounted) {
        console.log("🏁 Initial load complete");
        setLoading(false);
      }
    };

    loadUser();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email: string, password: string) => {
    console.log("🔐 Logging in...");
    await api.post("/auth/signin", { email, password });
    console.log("✅ Login successful, fetching user...");
    await fetchUser();
    console.log("✅ User loaded");
  };

  const logout = async () => {
    console.log("🚪 Logging out...");
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.log("⚠️ Logout failed but clearing user anyway");
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
