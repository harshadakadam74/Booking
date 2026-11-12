import apiClient from './apiClient';

const getErrorMessage = (error, fallback) => (
  error?.response?.data?.message || error?.response?.data?.error || error?.message || fallback
);

const request = async (operation, fallback) => {
  try {
    const response = await operation();
    return response.data?.data ?? response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, fallback));
  }
};

export const fetchAdminDashboard = () => request(
  () => apiClient.get('/api/v1/admin/dashboard'),
  'Unable to load dashboard statistics.',
);

export const fetchAdminHotels = (params = {}) => request(
  () => apiClient.get('/api/v1/admin/hotels', { params: { limit: 100, ...params } }),
  'Unable to load hotels.',
);

export const createAdminHotel = (payload) => request(
  () => apiClient.post('/api/v1/admin/hotels', payload),
  'Unable to create hotel.',
);

export const importAdminHotels = (records) => request(
  () => apiClient.post('/api/v1/admin/hotels/import', { records }),
  'Unable to import hotel records.',
);

export const exportAdminHotels = async () => {
  try {
    const response = await apiClient.get('/api/v1/admin/hotels/export', { responseType: 'blob' });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Unable to export hotel records.'));
  }
};

export const uploadAdminHotelImage = (image) => {
  const formData = new FormData();
  formData.append('image', image);
  return request(
    () => apiClient.post('/api/v1/admin/hotels/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
    'Unable to upload hotel image.',
  );
};

export const uploadAdminHotelImages = (images) => {
  const formData = new FormData();
  images.forEach((image) => formData.append('images', image));
  return request(
    () => apiClient.post('/api/v1/admin/hotels/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
    'Unable to upload hotel images.',
  );
};

export const updateAdminHotel = (hotelId, payload) => request(
  () => apiClient.put(`/api/v1/admin/hotels/${hotelId}`, payload),
  'Unable to update hotel.',
);

export const setAdminHotelStatus = (hotelId, active) => request(
  () => apiClient.patch(`/api/v1/admin/hotels/${hotelId}/status`, { active }),
  'Unable to update hotel status.',
);

export const setAdminHotelApproval = (hotelId, approvalStatus) => request(
  () => apiClient.patch(`/api/v1/admin/hotels/${hotelId}/approval`, { approvalStatus }),
  'Unable to update hotel approval.',
);

export const deleteAdminHotel = (hotelId) => request(
  () => apiClient.delete(`/api/v1/admin/hotels/${hotelId}`),
  'Unable to safely delete hotel.',
);

export const fetchAdminBookings = (params = {}) => request(
  () => apiClient.get('/api/v1/admin/bookings', { params: { limit: 100, ...params } }),
  'Unable to load bookings.',
);

export const setAdminBookingStatus = (bookingId, bookingStatus) => request(
  () => apiClient.patch(`/api/v1/admin/bookings/${bookingId}/status`, { bookingStatus }),
  'Unable to update booking status.',
);

export const fetchAdminUsers = (params = {}) => request(
  () => apiClient.get('/api/v1/admin/users', { params: { limit: 100, ...params } }),
  'Unable to load users.',
);

export const createAdminAccount = (payload) => request(
  () => apiClient.post('/api/v1/admin/users', payload),
  'Unable to create administrator account.',
);

export const setAdminUserRole = (userId, role) => request(
  () => apiClient.patch(`/api/v1/admin/users/${userId}/role`, { role }),
  'Unable to update user role.',
);

export const logoutAdmin = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
};
