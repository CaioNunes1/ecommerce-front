// src/components/RequireAuth.tsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RequireAuth({ children }: { children: JSX.Element }) {
  const { user, restoring } = useAuth();
  if (restoring) return <div>Carregando sessão...</div>;
  return user ? children : <Navigate to="/signin" replace />;
}
