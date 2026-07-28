import apiClient, { API_BASE_URL } from './apiClient';

const getApiErrorMessage = (error, fallbackMessage) => {
  const responseData = error?.response?.data;

  if (responseData?.message) return responseData.message;
  if (responseData?.error) return responseData.error;
  if (typeof responseData === 'string') return responseData;
  if (error?.code === 'ERR_NETWORK' || error?.message === 'Network Error') {
    return `Unable to connect to the backend at ${API_BASE_URL}. Make sure the server is running.`;
  }
  if (error?.message) return error.message;
  return fallbackMessage;
};

export const registerUser = async (payload) => {
  try {
    const response = await apiClient.post('/api/v1/auth/register', payload);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Registration failed. Please try again.'));
  }
};

export const loginUser = async (payload) => {
  try {
    const response = await apiClient.post("/api/v1/auth/login", payload);

    if (response.data?.jwt) {
      localStorage.setItem("authToken", response.data.jwt);
    }

    if (response.data?.user) {
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }

    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Login failed."));
  }
};

export const fetchUserProfile = async () => {
  try {
    const token = localStorage.getItem("authToken");

    if (!token) {
      throw new Error("User is not logged in");
    }

    const response = await apiClient.get("/api/v1/user/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    localStorage.setItem("user", JSON.stringify(response.data));

    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Failed to fetch profile")
    );
  }
};