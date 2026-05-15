import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

const authHeader = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

export const fetchCart = async (token) => {
  const response = await api.get('/cart', authHeader(token));
  return response.data;
};

export const addToCart = async ({ hotelId, roomId, quantity }, token) => {
  const response = await api.post(
    '/cart',
    { hotelId, roomId, quantity },
    authHeader(token)
  );
  return response.data;
};

export const updateCartItem = async ({ itemId, quantity }, token) => {
  const response = await api.put(
    `/cart/${itemId}`,
    { quantity },
    authHeader(token)
  );
  return response.data;
};

export const removeCartItem = async (itemId, token) => {
  const response = await api.delete(`/cart/${itemId}`, authHeader(token));
  return response.data;
};

export const clearCart = async (token) => {
  const response = await api.delete('/cart', authHeader(token));
  return response.data;
};