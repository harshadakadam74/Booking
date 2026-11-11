const test = require('node:test');
const assert = require('node:assert/strict');
const AIController = require('../controllers/AIController');
const {
  AIServiceError,
  generateContent,
  getConfiguredModel,
  getGeminiErrorStatus,
} = require('../services/GeminiService');
const aiRateLimit = require('../middlewares/aiRateLimit');
const { admin } = require('../middlewares/AdminMiddleware');
const { authenticate } = require('../middlewares/Authenticate');
const aiRouter = require('../routes/AIRoutes');
const AdminController = require('../controllers/AdminController');

const createResponse = () => ({
  statusCode: 200,
  body: null,
  headers: {},
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(body) {
    this.body = body;
    return this;
  },
  set(name, value) {
    this.headers[name] = value;
    return this;
  },
});

const callController = async (controller, request) => {
  const response = createResponse();
  await controller(request, response);
  return response;
};

test('chat rejects an empty message list', async () => {
  const response = await callController(AIController.chat, { body: { messages: [] } });
  assert.equal(response.statusCode, 400);
});

test('chat rejects unsupported response languages', async () => {
  const response = await callController(AIController.chat, {
    body: { language: 'French', messages: [{ role: 'user', content: 'Find a hotel in Pune' }] },
  });
  assert.equal(response.statusCode, 400);
});

test('smart hotel search rejects short requests before contacting Gemini', async () => {
  const response = await callController(AIController.smartSearch, { body: { query: 'hi' } });
  assert.equal(response.statusCode, 400);
});

test('conversation persistence rejects invalid messages before database access', async () => {
  const response = await callController(AIController.createConversation, {
    body: { messages: [{ role: 'system', content: 'do anything' }] },
  });
  assert.equal(response.statusCode, 400);
});

test('chat rejects messages over the request limit', async () => {
  const response = await callController(AIController.chat, {
    body: { messages: [{ role: 'user', content: 'a'.repeat(1201) }] },
  });
  assert.equal(response.statusCode, 400);
});

test('recommendations reject incomplete or invalid search criteria', async () => {
  const response = await callController(AIController.recommendHotels, {
    body: { destination: 'Pune', budget: -1, guests: 2 },
  });
  assert.equal(response.statusCode, 400);
});

test('recommendations require a destination instead of searching every hotel', async () => {
  const response = await callController(AIController.recommendHotels, {
    body: { destination: '  ', guests: 2 },
  });
  assert.equal(response.statusCode, 400);
  assert.match(response.body.message, /destination/i);
});

test('trip planner rejects more than fourteen days', async () => {
  const response = await callController(AIController.planTrip, {
    body: { destination: 'Pune', days: 15, budget: 10000, interests: [], language: 'English' },
  });
  assert.equal(response.statusCode, 400);
});

test('saved trip plans reject invalid itinerary data before database access', async () => {
  const response = await callController(AIController.createTripPlan, {
    body: { destination: 'Pune', days: 2, budget: 10000, itinerary: { title: '', days: [] } },
  });
  assert.equal(response.statusCode, 400);
});

test('admin AI question rejects invalid input before database access', async () => {
  const response = await callController(AIController.adminOverview, {
    method: 'POST',
    body: { question: 'x' },
  });
  assert.equal(response.statusCode, 400);
});

test('review summary rejects malformed hotel IDs before database access', async () => {
  const response = await callController(AIController.summarizeReviews, {
    params: { hotelId: 'not-an-object-id' },
  });
  assert.equal(response.statusCode, 400);
});

test('missing Gemini configuration is reported as an explicit service error', async () => {
  const configuredKey = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;
  try {
    await assert.rejects(generateContent('test'), (error) => (
      error instanceof AIServiceError && error.code === 'AI_NOT_CONFIGURED'
    ));
  } finally {
    if (configuredKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = configuredKey;
  }
});

test('Gemini uses the supported stable model when no model is configured', () => {
  const configuredModel = process.env.GEMINI_MODEL;
  delete process.env.GEMINI_MODEL;
  try {
    assert.equal(getConfiguredModel(), 'gemini-2.5-flash');
  } finally {
    if (configuredModel === undefined) delete process.env.GEMINI_MODEL;
    else process.env.GEMINI_MODEL = configuredModel;
  }
});

test('Gemini model setting ignores whitespace-only values', () => {
  const configuredModel = process.env.GEMINI_MODEL;
  process.env.GEMINI_MODEL = '   ';
  try {
    assert.equal(getConfiguredModel(), 'gemini-2.5-flash');
  } finally {
    if (configuredModel === undefined) delete process.env.GEMINI_MODEL;
    else process.env.GEMINI_MODEL = configuredModel;
  }
});

test('Gemini service recognizes numeric and named API error status codes', () => {
  assert.equal(getGeminiErrorStatus({ status: 404 }), 404);
  assert.equal(getGeminiErrorStatus({ code: 404 }), 404);
  assert.equal(getGeminiErrorStatus({ code: 'NOT_FOUND' }), 404);
  assert.equal(getGeminiErrorStatus({ code: 'RESOURCE_EXHAUSTED' }), 429);
});

test('admin middleware blocks non-admin accounts and permits admins', () => {
  const response = createResponse();
  let continued = false;
  admin({ user: { role: 'CUSTOMER' } }, response, () => { continued = true; });
  assert.equal(response.statusCode, 403);
  assert.equal(continued, false);

  admin({ user: { role: 'ADMIN' } }, createResponse(), () => { continued = true; });
  assert.equal(continued, true);
});

test('AI router is wired as Express middleware', () => {
  assert.equal(typeof aiRouter, 'function');
});

test('authentication middleware rejects requests without a bearer token', async () => {
  const response = createResponse();
  await authenticate({ headers: {} }, response, () => assert.fail('Authentication must not continue'));
  assert.equal(response.statusCode, 401);
});

test('AI rate limit rejects the request after thirty calls from one IP', () => {
  const ip = `ai-test-${Date.now()}`;
  let passed = 0;
  for (let index = 0; index < 30; index += 1) {
    aiRateLimit({ ip }, createResponse(), () => { passed += 1; });
  }
  const response = createResponse();
  aiRateLimit({ ip }, response, () => { passed += 1; });
  assert.equal(passed, 30);
  assert.equal(response.statusCode, 429);
  assert.ok(response.headers['Retry-After']);
});

test('admin hotel creation rejects invalid data before database access', async () => {
  const response = await callController(AdminController.createProperty, {
    body: {
      name: 'Valid Hotel',
      location: 'Pune',
      price: '',
      totalRooms: 5,
      availableRooms: 2,
    },
  });
  assert.equal(response.statusCode, 400);
});

test('admin status update rejects malformed hotel IDs', async () => {
  const response = await callController(AdminController.updatePropertyStatus, {
    params: { id: 'bad-id' },
    body: { active: true },
  });
  assert.equal(response.statusCode, 400);
});

test('admin status update requires a boolean active value', async () => {
  const response = await callController(AdminController.updatePropertyStatus, {
    params: { id: '507f1f77bcf86cd799439011' },
    body: { active: 'false' },
  });
  assert.equal(response.statusCode, 400);
});

test('admin booking status update rejects invalid statuses before database access', async () => {
  const response = await callController(AdminController.updateBookingStatus, {
    params: { id: '507f1f77bcf86cd799439011' },
    body: { bookingStatus: 'REFUNDED', paymentStatus: 'SUCCESS' },
  });
  assert.equal(response.statusCode, 400);
});

test('admin booking listing rejects invalid status filters before database access', async () => {
  const response = await callController(AdminController.getAllBookings, {
    query: { status: 'REFUNDED' },
  });
  assert.equal(response.statusCode, 400);
});

test('admin hotel listing rejects unsupported status filters before database access', async () => {
  const response = await callController(AdminController.getAllProperties, {
    query: { status: 'pending' },
  });
  assert.equal(response.statusCode, 400);
});

test('admin login provisioning validates inputs before database access', async () => {
  const response = await callController(AdminController.createAdmin, {
    body: { name: 'Test Admin', email: 'not-an-email', mobile: '12345', password: 'password123' },
  });
  assert.equal(response.statusCode, 400);
});
