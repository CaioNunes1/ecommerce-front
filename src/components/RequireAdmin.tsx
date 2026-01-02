// src/components/RequireAdmin.tsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RequireAdmin({ children }: { children: JSX.Element }) {
  const {  restoring, isAdmin } = useAuth();
  if (restoring) return <div>Carregando sessão...</div>;
  return isAdmin ? children : <Navigate to="/" replace />;
}
