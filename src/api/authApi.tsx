// src/api/authApi.ts
import api  from "./api";

export type LoginPayload = { email: string; password: string };
export type SignUpPayload = { name: string; email: string; password: string };

export async function signIn(payload: LoginPayload) {
  const res = await api.post("/auth/login", payload);
  return res.data;
}

export async function signUp(payload: SignUpPayload) {
  const res = await api.post("/user/create", payload);
  return res.data;
}
