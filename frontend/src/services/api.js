import axios from "axios";
import { useAuthStore } from "../context/authStore";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  timeout: 20000,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshPromise = null;

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const status = err?.response?.status;
    const originalRequest = err?.config;

    if (status === 401 && originalRequest && !originalRequest._retry) {
      const { refreshToken, setAuth, logout } = useAuthStore.getState();
      if (!refreshToken) {
        logout();
        return Promise.reject(err);
      }

      originalRequest._retry = true;

      try {
        refreshPromise =
          refreshPromise ||
          api.post("/api/auth/refresh", { refreshToken }, { headers: { Authorization: undefined } });

        const response = await refreshPromise;
        refreshPromise = null;
        setAuth(response.data.data);
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${response.data.data.accessToken || response.data.data.token}`;
        return api(originalRequest);
      } catch (refreshError) {
        refreshPromise = null;
        logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(err);
  }
);
