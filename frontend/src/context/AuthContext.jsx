import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);
const STORAGE_KEY = "ecolog_user";

export function AuthProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  });

  const login = async (payload) => {
    try {
      const response = await api.post('/auth/login', payload);
      const userData = { ...response.data.user, token: response.data.token };
      setUser(userData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
      return userData;
    } catch (error) {
      console.error("Login failed:", error.response?.data?.message || error.message);
      throw error;
    }
  };

  const signup = async (payload) => {
    try {
      const response = await api.post('/auth/register', payload);
      const userData = { ...response.data.user, token: response.data.token };
      setUser(userData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
      return userData;
    } catch (error) {
      console.error("Signup failed:", error.response?.data?.message || error.message);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  useEffect(() => {
    const bootstrap = async () => {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        setLoading(false);
        return;
      }
      try {
        const parsed = JSON.parse(saved);
        if (!parsed?.token) throw new Error("Missing token");
        const meRes = await api.get("/auth/me");
        const hydrated = { ...meRes.data, token: parsed.token };
        setUser(hydrated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(hydrated));
      } catch {
        setUser(null);
        localStorage.removeItem(STORAGE_KEY);
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, []);

  const value = useMemo(() => ({ user, loading, login, signup, logout }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
