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

export const requestPasswordReset = async (email) => {
  try {
    const response = await apiClient.post('/api/v1/auth/forgot-password', { email });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Unable to send password reset email.'));
  }
};

export const resetPassword = async (payload) => {
  try {
    const response = await apiClient.post('/api/v1/auth/reset-password', payload);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Unable to reset your password.'));
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

    const profile = response.data?.user || response.data;
    localStorage.setItem("user", JSON.stringify(profile));

    return profile;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Failed to fetch profile")
    );
  }
};

export const updateUserProfile = async (payload) => {
  try {
    const token = localStorage.getItem("authToken");

    if (!token) {
      throw new Error("User is not logged in");
    }

    const response = await apiClient.put("/api/v1/user/profile", payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const profile = response.data?.user || response.data;
    localStorage.setItem("user", JSON.stringify(profile));

    return profile;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Failed to update profile")
    );
  }
};

export const fetchAdminUsers = async () => {
  try {
    const response = await apiClient.get('/api/v1/admin/users');
    return response.data?.data?.users || [];
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to fetch users'));
  }
};

export const createAdmin = async (payload) => {
  try {
    const response = await apiClient.post('/api/v1/admin/users', payload);
    return response.data?.data?.user;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to create admin'));
  }
};

export const fetchAdminProperties = async () => {
  try {
    const response = await apiClient.get('/api/v1/admin/properties');
    return response.data?.data?.properties || [];
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to fetch hotels'));
  }
};

export const createProperty = async (payload) => {
  try {
    const response = await apiClient.post('/api/v1/admin/properties', payload);
    return response.data?.data?.property;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to create hotel'));
  }
};

export const updatePropertyAvailability = async (propertyId, payload) => {
  try {
    const response = await apiClient.put(`/api/v1/admin/property/${propertyId}`, payload);
    return response.data?.data?.property;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to update room availability'));
  }
};

export const deleteProperty = async (propertyId) => {
  try {
    await apiClient.delete(`/api/v1/admin/property/${propertyId}`);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to delete hotel'));
  }
};

export const fetchPublicProperties = async (type = 'Hotel') => {
  try {
    const response = await apiClient.get('/api/v1/properties', { params: { type } });
    return response.data?.properties || [];
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to fetch hotels'));
  }
};