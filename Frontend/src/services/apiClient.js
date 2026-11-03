import axios from "axios";

// Use the local backend by default and avoid double slashes in request URLs.
export const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:4545"
).replace(/\/$/, "");

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || "";
      const authPaths = [
        "/api/v1/auth/login",
        "/api/v1/auth/register",
        "/api/v1/auth/forgot-password",
        "/api/v1/auth/reset-password",
      ];
      const shouldSkipRedirect = authPaths.some((path) => requestUrl.includes(path));

      if (!shouldSkipRedirect) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        const loginPath = window.location.pathname.startsWith("/admin")
          ? "/admin/login"
          : "/login";
        window.location.href = loginPath;
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
