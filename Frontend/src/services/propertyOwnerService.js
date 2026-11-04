import apiClient from './apiClient';

const request = async (operation, fallback) => {
  try {
    const response = await operation();
    return response.data?.data ?? response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || fallback);
  }
};

export const fetchOwnProperties = () => request(
  () => apiClient.get('/api/v1/properties/owner'),
  'Unable to load your property listings.',
);

export const submitOwnProperty = (payload) => request(
  () => apiClient.post('/api/v1/properties/owner', payload),
  'Unable to submit your property listing.',
);

export const updateOwnProperty = (propertyId, payload) => request(
  () => apiClient.put(`/api/v1/properties/owner/${propertyId}`, payload),
  'Unable to update your property listing.',
);

export const setOwnPropertyStatus = (propertyId, active) => request(
  () => apiClient.patch(`/api/v1/properties/owner/${propertyId}/status`, { active }),
  'Unable to update property status.',
);

export const deleteOwnProperty = (propertyId) => request(
  () => apiClient.delete(`/api/v1/properties/owner/${propertyId}`),
  'Unable to delete your property listing.',
);
