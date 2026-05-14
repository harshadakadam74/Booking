import apiClient from "./apiClient";

// Register new user
export const registerUser = async (userData) => {
  try {
    const response = await apiClient.post("/api/v1/auth/register", userData);
    if (response.data.jwt) {
      localStorage.setItem("authToken", response.data.jwt);
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Login user
export const loginUser = async (email, password) => {
  try {
    const response = await apiClient.post("/api/v1/auth/login", {
      email,
      password,
    });
    if (response.data.jwt) {
      localStorage.setItem("authToken", response.data.jwt);
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Logout user
export const logoutUser = () => {
  localStorage.removeItem("authToken");
  return { message: "Logged out successfully" };
};

// Get current user (if needed)
export const getCurrentUser = async () => {
  try {
    const response = await apiClient.get("/api/v1/user/profile");
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!localStorage.getItem("authToken");
};

// Get auth token
export const getAuthToken = () => {
  return localStorage.getItem("authToken");
};
