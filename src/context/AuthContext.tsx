// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import api, { setBasicAuth,restoreAuthFromStorage } from "../api/apiClient";

type User = { id: number; email: string; name?: string; role?: string } | null;

type AuthContextType = {
  user: User;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  restoring: boolean; // exposto para que a app saiba quando ainda está restaurando
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};

// no topo do AuthProvider


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(null);
  const [restoring, setRestoring] = useState(true);

  useEffect(() => {
  restoreAuthFromStorage();
  // se tiver token, você pode tentar recuperar o usuário atual
  const token = localStorage.getItem('authBasic');
  if (token) {
    const decoded = atob(token);
    const [email] = decoded.split(':');
    // tenta buscar /user/findByEmail
    api.get('/user/findByEmail', { params: { email } })
      .then(res => setUser(res.data))
      .catch(()=> {
        setBasicAuth('', null);
        setUser(null);
      });
  }
}, []);

  async function login(email: string, password: string) {
    const token = btoa(`${email}:${password}`);
    setBasicAuth(email, password);
    try {
      const resp = await api.get("/user/findByEmail", { params: { email } });
      setUser(resp.data);
      localStorage.setItem("authBasic", token); // redundante com setBasicAuth, mas ok
    } catch (err) {
      // credenciais inválidas ou backend inacessível
      setBasicAuth(null);
      setUser(null);
      throw err;
    }
  }

  function logout() {
    setBasicAuth(null);
    setUser(null);
  }

  useEffect(() => {
    // restauração ao início da app
    (async () => {
      const token = localStorage.getItem("authBasic");
      if (!token) {
        setRestoring(false);
        return;
      }
      // aplica header antes de qualquer request
      setBasicAuth(token);
      try {
        // tenta recuperar e validar o usuário (extraia email do token)
        const decoded = atob(token);
        const [email] = decoded.split(":");
        const resp = await api.get("/user/findByEmail", { params: { email } });
        setUser(resp.data);
      } catch (err) {
        // token inválido -> limpar
        setBasicAuth(null);
        setUser(null);
      } finally {
        setRestoring(false);
      }
    })();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin: !!user && user.role === "ROLE_ADMIN", restoring }}>
      {children}
    </AuthContext.Provider>
  );
};
