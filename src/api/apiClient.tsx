// src/api/apiClient.ts
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
  withCredentials: false, // normalmente false com basic auth
});

// seta basic auth globalmente (e grava no localStorage)
export function setBasicAuth(email?: string, password?: string | null) {
  if (!email || !password) {
    delete api.defaults.headers.common["Authorization"];
    localStorage.removeItem("authBasic");
    return;
  }
  const token = btoa(`${email}:${password}`);
  api.defaults.headers.common["Authorization"] = `Basic ${token}`;
  localStorage.setItem("authBasic", token);
}

// restore auth from localStorage quando a app iniciar
export function restoreAuthFromStorage() {
  const token = localStorage.getItem("authBasic");
  if (token) {
    api.defaults.headers.common["Authorization"] = `Basic ${token}`;
  }
}

export default api;
