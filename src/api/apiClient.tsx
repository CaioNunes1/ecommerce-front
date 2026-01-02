// src/api/apiClient.ts
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
  withCredentials: false,
});

// set/remove basic auth globalmente (email+password) and persist base64 token
export function setBasicAuth(email?: string | null, password?: string | null) {
  if (!email || !password) {
    delete api.defaults.headers.common["Authorization"];
    localStorage.removeItem("authBasic");
    return;
  }
  const token = btoa(`${email}:${password}`);
  api.defaults.headers.common["Authorization"] = `Basic ${token}`;
  localStorage.setItem("authBasic", token);
}

// Restore header from the stored token (called automatically on module init)
export function restoreAuthFromStorage() {
  const token = localStorage.getItem("authBasic");
  if (token) {
    api.defaults.headers.common["Authorization"] = `Basic ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
}

// guarantee restore runs when module loads
restoreAuthFromStorage();

export default api;
