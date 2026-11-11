import apiClient from "./apiClient";

export async function apiFetch(path, options = {}) {
  const { body, ...requestOptions } = options;
  const response = await apiClient.request({
    ...requestOptions,
    url: path,
    method: requestOptions.method || "GET",
    data: body,
  });

  return response.data;
}
