// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import api, { setBasicAuth } from "../api/apiClient";

type User = { id: number; email: string; name?: string; role?: string } | null;

type AuthContextType = {
  user: User;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  restoring: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(null);
  const [restoring, setRestoring] = useState(true);

  // single restore flow on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      const token = localStorage.getItem("authBasic");
      if (!token) {
        if (mounted) setRestoring(false);
        return;
      }
      // header já re-aplicado por apiClient.restoreAuthFromStorage (module init),
      // but ensure header exists (defensive)
      api.defaults.headers.common["Authorization"] = `Basic ${token}`;

      try {
        const decoded = atob(token);
        const [email] = decoded.split(":");
        const resp = await api.get("/user/findByEmail", { params: { email } });
        if (!mounted) return;
        setUser(resp.data);
        // optionally cache user for quick lookup (not required)
        localStorage.setItem("user", JSON.stringify(resp.data));
      } catch (err) {
        // failed to restore (invalid credentials / server rejected)
        setBasicAuth(null, null);
        setUser(null);
        localStorage.removeItem("user");
      } finally {
        if (mounted) setRestoring(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  async function login(email: string, password: string) {
    // set header & persist token
    setBasicAuth(email, password);
    // verify credentials by fetching user
    const resp = await api.get("/user/findByEmail", { params: { email } });
    setUser(resp.data);
    localStorage.setItem("user", JSON.stringify(resp.data));
  }

  function logout() {
    setBasicAuth(null, null);
    setUser(null);
    localStorage.removeItem("user");
  }

  const isAdmin = !!user && (user.role === "ROLE_ADMIN" || user.role === "ADMIN");

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin, restoring }}>
      {children}
    </AuthContext.Provider>
  );
};
