// src/lib/api.ts
export const apiUrl = (path: string) => {
  const RAW_BASE = import.meta.env.VITE_API_URL ?? "";           // e.g. "http://localhost:5000" or "http://localhost:5000/api"
  const BASE = RAW_BASE.replace(/\/+$/, "");
  const API_BASE = /\/api$/.test(BASE) ? BASE : `${BASE}/api`;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${p}`;
};
