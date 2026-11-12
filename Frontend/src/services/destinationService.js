import apiClient from './apiClient';

export const searchDestinations = async (search, limit = 10) => {
  const response = await apiClient.get('/api/v1/destinations', {
    params: { search, limit },
  });
  return response.data.destinations || [];
};

export const searchHotels = async (params) => {
  const response = await apiClient.get('/api/v1/hotels/search', { params });
  return response.data;
};

export const listHotels = async (params = {}) => {
  const response = await apiClient.get('/api/v1/hotels', { params });
  return response.data;
};

export const getHotelById = async (hotelId) => {
  const response = await apiClient.get(`/api/v1/hotels/${encodeURIComponent(hotelId)}`);
  return response.data?.property;
};

export const getHotelAvailability = async (hotelId, params) => {
  const response = await apiClient.get(
    `/api/v1/hotels/${encodeURIComponent(hotelId)}/availability`,
    { params }
  );
  return response.data?.eligibility;
};

export const fetchAdminDestinations = async (params) => {
  const response = await apiClient.get('/api/v1/destinations/admin', { params });
  return response.data?.data ?? response.data;
};

export const saveAdminDestination = async (destination, id) => {
  const response = id
    ? await apiClient.put(`/api/v1/destinations/${id}`, destination)
    : await apiClient.post('/api/v1/destinations', destination);
  return response.data?.data ?? response.data;
};

export const setAdminDestinationStatus = async (id, active) => {
  const response = await apiClient.patch(`/api/v1/destinations/${id}/status`, { active });
  return response.data?.data ?? response.data;
};

export const deleteAdminDestination = async (id) => {
  const response = await apiClient.delete(`/api/v1/destinations/${id}`);
  return response.data?.data ?? response.data;
};
