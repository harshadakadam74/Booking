import apiClient, { API_BASE_URL } from './apiClient';

const getMessage = (error, fallback) => {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.code === 'ERR_NETWORK' || !error?.response) {
    return `Cannot reach the FastBooking API at ${API_BASE_URL}. Check that the backend is running and VITE_API_URL is correct.`;
  }
  return error?.message || fallback;
};

export const sendAIChatMessage = async (messages) => {
  try {
    const response = await apiClient.post('/api/v1/ai/chat', { messages });
    return response.data;
  } catch (error) {
    throw new Error(getMessage(error, 'Unable to send your message.'));
  }
};

export const fetchAIRecommendations = async (payload) => {
  try {
    const response = await apiClient.post('/api/v1/ai/recommendations', payload);
    return response.data;
  } catch (error) {
    throw new Error(getMessage(error, 'Unable to find hotel recommendations.'));
  }
};

export const generateAITripPlan = async (payload) => {
  try {
    const response = await apiClient.post('/api/v1/ai/plan-trip', payload);
    return response.data;
  } catch (error) {
    throw new Error(getMessage(error, 'Unable to generate your itinerary.'));
  }
};

export const fetchAIReviewSummary = async (hotelId) => {
  try {
    const response = await apiClient.get(`/api/v1/ai/reviews/${hotelId}/summary`);
    return response.data;
  } catch (error) {
    throw new Error(getMessage(error, 'Unable to load the review summary.'));
  }
};

export const fetchAIAdminOverview = async () => {
  try {
    const response = await apiClient.get('/api/v1/ai/admin/overview');
    return response.data;
  } catch (error) {
    throw new Error(getMessage(error, 'Unable to load admin analytics.'));
  }
};
