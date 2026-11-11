const { GoogleGenAI } = require('@google/genai');

class AIServiceError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'AIServiceError';
    this.code = code;
  }
}

let client;
const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';

const getClient = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new AIServiceError('AI_NOT_CONFIGURED', 'Gemini is not configured on the server.');
  }

  if (!client) {
    client = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: { timeout: 60000 },
    });
  }

  return client;
};

const getGeminiErrorStatus = (error) => {
  const numericStatus = Number(error.status ?? error.statusCode ?? error.code);
  if (Number.isFinite(numericStatus) && numericStatus > 0) return numericStatus;

  const code = String(error.code || error.status || '').toUpperCase();
  if (code === 'UNAUTHENTICATED') return 401;
  if (code === 'PERMISSION_DENIED') return 403;
  if (code === 'NOT_FOUND') return 404;
  if (code === 'RESOURCE_EXHAUSTED') return 429;
  if (code === 'INVALID_ARGUMENT') return 400;
  return 0;
};

const getConfiguredModel = () => process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;

const generateContent = async (contents, responseMimeType, maxOutputTokens = 1024) => {
  const model = getConfiguredModel();
  try {
    const response = await getClient().models.generateContent({
      model,
      contents,
      ...(responseMimeType ? { config: { responseMimeType, maxOutputTokens } } : {}),
    });
    const text = response.text?.trim();
    if (!text) throw new AIServiceError('AI_EMPTY_RESPONSE', 'Gemini returned an empty response.');
    return text;
  } catch (error) {
    if (error instanceof AIServiceError) throw error;

    const status = getGeminiErrorStatus(error);
    const apiCode = String(error.code || '').toUpperCase();
    const message = error.message || '';
    console.error('Gemini request failed:', {
      status: status || 'unknown',
      code: apiCode || 'unknown',
      name: error.name,
      message,
    });

    if (status === 401 || status === 403) {
      throw new AIServiceError('AI_INVALID_KEY', 'Gemini rejected the server credentials or model access. Check the API key and its model permissions.');
    }
    if (status === 400 && /api.?key|credential|auth/i.test(message)) {
      throw new AIServiceError('AI_INVALID_KEY', 'Gemini rejected the server API key. Check GEMINI_API_KEY.');
    }
    if (status === 429) {
      throw new AIServiceError('AI_QUOTA', 'Gemini request quota is temporarily unavailable.');
    }
    if (status === 404 || /model.*not.*found|not.*supported|unsupported.*model/i.test(message)) {
      throw new AIServiceError(
        'AI_MODEL_UNAVAILABLE',
        `Gemini model "${model}" is unavailable. Set GEMINI_MODEL to a currently supported model.`,
      );
    }
    if (error.name === 'TimeoutError' || error.name === 'AbortError' || /timeout/i.test(message)) {
      throw new AIServiceError('AI_TIMEOUT', 'Gemini did not respond before the request timed out.');
    }
    throw new AIServiceError('AI_UNAVAILABLE', 'Gemini is temporarily unavailable. Please try again.');
  }
};

const generateJson = async (contents) => {
  const text = await generateContent(contents, 'application/json', 2048);
  try {
    const jsonText = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
    return JSON.parse(jsonText);
  } catch {
    throw new AIServiceError('AI_INVALID_RESPONSE', 'Gemini returned an invalid structured response.');
  }
};

module.exports = {
  AIServiceError,
  generateContent,
  generateJson,
  getConfiguredModel,
  getGeminiErrorStatus,
};
