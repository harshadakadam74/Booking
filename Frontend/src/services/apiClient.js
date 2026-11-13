import axios from "axios";

const API_VERSION_PATH = "/api/v1";
const configuredApiUrl = import.meta.env.VITE_API_URL?.trim().replace(/\/+$/, "");
const isLoopbackHost = (hostname) =>
  hostname === "localhost" ||
  hostname.endsWith(".localhost") ||
  hostname.startsWith("127.") ||
  hostname === "::1" ||
  hostname === "[::1]" ||
  hostname === "0.0.0.0";
const isPrivateNetworkHost = (hostname) =>
  hostname.endsWith(".local") ||
  /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
  /^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
  /^172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}$/.test(hostname);
const frontendHostname = typeof window === "undefined" ? "" : window.location.hostname;
const isLoopbackFrontend = isLoopbackHost(frontendHostname);
export const IS_LOCAL_DEVELOPMENT = import.meta.env.DEV &&
  (isLoopbackFrontend || isPrivateNetworkHost(frontendHostname));
const developmentApiUrl = import.meta.env.DEV
  ? "http://localhost:4545/api/v1"
  : "";

const getApiBaseUrl = () => {
  if (!configuredApiUrl) return import.meta.env.DEV && isLoopbackFrontend ? developmentApiUrl : "";

  try {
    const url = new URL(configuredApiUrl);
    if (import.meta.env.DEV) {
      if (!["http:", "https:"].includes(url.protocol) ||
        (isLoopbackHost(url.hostname) && !isLoopbackFrontend) ||
        (url.protocol === "http:" && !isLoopbackHost(url.hostname) && !isPrivateNetworkHost(url.hostname))) {
        return "";
      }
    } else if (url.protocol !== "https:" || isLoopbackHost(url.hostname)) {
      return "";
    }

    const baseUrl = configuredApiUrl.endsWith(API_VERSION_PATH)
      ? configuredApiUrl
      : `${configuredApiUrl}${API_VERSION_PATH}`;
    return baseUrl;
  } catch {
    return "";
  }
};

export const API_BASE_URL = getApiBaseUrl();

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    if (!API_BASE_URL) {
      throw new Error(
        "Set VITE_API_URL to the deployed HTTPS backend URL ending in /api/v1. Production cannot use localhost."
      );
    }

    const requestUrl = config.url || "/";
    const normalizedUrl = requestUrl.startsWith("/")
      ? requestUrl
      : `/${requestUrl}`;
    config.url = normalizedUrl.replace(/^\/api\/v1(?=\/|\?|$)/, "") || "/";

    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || "";
      const authPaths = [
        "/auth/login",
        "/auth/register",
        "/auth/forgot-password",
        "/auth/reset-password",
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
