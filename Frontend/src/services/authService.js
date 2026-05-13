import { apiFetch } from './api';

export const registerUser = async (payload) => {
  return apiFetch('/api/v1/auth/register', {
    method: 'POST',
    body: payload,
  });
};

export const loginUser = async (payload) => {
  return apiFetch('/api/v1/auth/login', {
    method: 'POST',
    body: payload,
  });
};

export const fetchUserProfile = async (token) => {
  return apiFetch('/api/v1/user/profile', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
