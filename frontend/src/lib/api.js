import axios from "axios";

// Empty VITE_BACKEND_URL keeps requests same-origin, which the Vite dev
// proxy (and the Express static build) both handle. Set it only when the
// API lives on a different host.
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "";
export const API = `${BACKEND_URL}/api`;

// Uploads are stored as origin-relative paths ("/api/files/..."). Prefix them
// with the backend origin when the API is hosted somewhere else.
export const fileUrl = (u) => (u && u.startsWith("/api/") ? `${BACKEND_URL}${u}` : u || "");

const api = axios.create({ baseURL: API });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("mkd_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
