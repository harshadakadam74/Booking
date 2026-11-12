const PRODUCTION_ORIGINS = ['https://booking-l2vm.vercel.app'];

const isLoopbackDevelopmentOrigin = (origin) => {
  try {
    const url = new URL(origin);
    return url.protocol === 'http:' &&
      ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  } catch {
    return false;
  }
};

const createCorsOptions = (environment = process.env) => {
  const isProduction = environment.NODE_ENV === 'production';
  const configuredOrigins = String(environment.CLIENT_URL || '')
    .split(',')
    .map((origin) => origin.trim().replace(/\/+$/, ''))
    .filter((origin) => origin && (!isProduction || !isLoopbackDevelopmentOrigin(origin)));
  const allowedOrigins = new Set([...PRODUCTION_ORIGINS, ...configuredOrigins]);

  return {
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin) ||
        (!isProduction && isLoopbackDevelopmentOrigin(origin))) {
        callback(null, true);
        return;
      }
      callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Accept',
      'Authorization',
      'Content-Type',
      'Idempotency-Key',
      'X-Requested-With',
    ],
    optionsSuccessStatus: 204,
    maxAge: 86400,
  };
};

module.exports = { createCorsOptions, isLoopbackDevelopmentOrigin };
