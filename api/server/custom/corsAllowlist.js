const cors = require('cors');

const resolveAllowedOrigin = (value) => {
  const trimmed = typeof value === 'string' ? value.trim() : '';
  if (!trimmed) {
    return null;
  }

  try {
    return new URL(trimmed).origin;
  } catch {
    return trimmed;
  }
};

const getAllowedOrigins = () => {
  const allowedOrigins = new Set(
    (process.env.ALLOWED_URLS ?? '').split(',').map(resolveAllowedOrigin).filter(Boolean),
  );

  const domainClientOrigin = resolveAllowedOrigin(process.env.DOMAIN_CLIENT);
  if (domainClientOrigin) {
    allowedOrigins.add(domainClientOrigin);
  }

  return allowedOrigins;
};

/**
 * Applies CORS config based on an allowlist.
 * - Allows browser origins present in ALLOWED_URLS (comma-separated)
 * - Always allows DOMAIN_CLIENT origin
 * - Keeps credentialed requests enabled
 */
const applyCorsAllowlist = (app) => {
  const allowedOrigins = getAllowedOrigins();

  const corsOptions = {
    origin: (requestOrigin, callback) => {
      if (!requestOrigin) {
        return callback(null, true);
      }

      if (allowedOrigins.has(requestOrigin)) {
        return callback(null, true);
      }

      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Authorization',
      'Content-Type',
      'Accept',
      'Origin',
      'X-Requested-With',
      'Cache-Control',
      'Pragma',
    ],
    optionsSuccessStatus: 204,
  };

  app.use(cors(corsOptions));
  app.options('*', cors(corsOptions));
};

module.exports = { applyCorsAllowlist, resolveAllowedOrigin, getAllowedOrigins };
