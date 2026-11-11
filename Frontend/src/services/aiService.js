import apiClient, { API_BASE_URL } from './apiClient';

const getMessage = (error, fallback) => {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.code === 'ERR_NETWORK' || !error?.response) {
    return `Cannot reach the FastBooking API at ${API_BASE_URL}. Check that the backend is running and VITE_API_URL is correct.`;
  }
  return error?.message || fallback;
};

export const sendAIChatMessage = async (messages, language = 'auto') => {
  try {
    const response = await apiClient.post('/api/v1/ai/chat', { messages, language });
    return response.data;
  } catch (error) {
    throw new Error(getMessage(error, 'Unable to send your message.'));
  }
};

export const searchAIHotels = async (query) => {
  try {
    const response = await apiClient.post('/api/v1/ai/smart-search', { query });
    return response.data;
  } catch (error) {
    throw new Error(getMessage(error, 'Unable to search hotels from your request.'));
  }
};

export const fetchAIConversations = async () => {
  try {
    const response = await apiClient.get('/api/v1/ai/conversations');
    return response.data;
  } catch (error) {
    throw new Error(getMessage(error, 'Unable to load your conversations.'));
  }
};

export const fetchAIConversation = async (conversationId) => {
  try {
    const response = await apiClient.get(`/api/v1/ai/conversations/${conversationId}`);
    return response.data;
  } catch (error) {
    throw new Error(getMessage(error, 'Unable to open this conversation.'));
  }
};

export const saveAIConversation = async (messages, language, conversationId) => {
  try {
    const payload = { messages, language };
    const response = conversationId
      ? await apiClient.put(`/api/v1/ai/conversations/${conversationId}`, payload)
      : await apiClient.post('/api/v1/ai/conversations', payload);
    return response.data;
  } catch (error) {
    throw new Error(getMessage(error, 'Unable to save this conversation.'));
  }
};

export const deleteAIConversation = async (conversationId) => {
  try {
    const response = await apiClient.delete(`/api/v1/ai/conversations/${conversationId}`);
    return response.data;
  } catch (error) {
    throw new Error(getMessage(error, 'Unable to delete this conversation.'));
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

export const fetchAISavedTripPlans = async () => {
  try {
    const response = await apiClient.get('/api/v1/ai/trip-plans');
    return response.data;
  } catch (error) {
    throw new Error(getMessage(error, 'Unable to load saved trip plans.'));
  }
};

export const saveAITripPlan = async (payload, planId) => {
  try {
    const response = planId
      ? await apiClient.put(`/api/v1/ai/trip-plans/${planId}`, payload)
      : await apiClient.post('/api/v1/ai/trip-plans', payload);
    return response.data;
  } catch (error) {
    throw new Error(getMessage(error, 'Unable to save this trip plan.'));
  }
};

export const deleteAISavedTripPlan = async (planId) => {
  try {
    const response = await apiClient.delete(`/api/v1/ai/trip-plans/${planId}`);
    return response.data;
  } catch (error) {
    throw new Error(getMessage(error, 'Unable to delete this trip plan.'));
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

export const askAIAdminInsight = async (question) => {
  try {
    const response = await apiClient.post('/api/v1/ai/admin/insights', { question });
    return response.data;
  } catch (error) {
    throw new Error(getMessage(error, 'Unable to answer this admin analytics question.'));
  }
};
