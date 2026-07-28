// API Base URL
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4545";

export async function apiFetch(path, options = {}) {
  // Get JWT token
  const token = localStorage.getItem("authToken");

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token && {
        Authorization: `Bearer ${token}`,
      }),
      ...options.headers,
    },
    body:
      options.body && typeof options.body !== "string"
        ? JSON.stringify(options.body)
        : options.body,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "API request failed");
  }

  return data;
}