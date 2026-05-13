const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export async function apiFetch(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const fetchOptions = {
    headers: {
      ...defaultHeaders,
      ...(options.headers || {}),
    },
    ...options,
  };

  if (fetchOptions.body && typeof fetchOptions.body !== 'string') {
    fetchOptions.body = JSON.stringify(fetchOptions.body);
  }

  const response = await fetch(url, fetchOptions);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'API request failed');
    error.status = response.status;
    error.response = data;
    throw error;
  }

  return data;
}
