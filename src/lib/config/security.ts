export const securityConfig = {
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  },
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
  },
  session: {
    maxAge: 24 * 60 * 60 * 1000,
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict' as const,
  },
  jwt: {
    expiresIn: '1h',
    refreshExpiresIn: '7d',
    issuer: 'medtrack-app',
    audience: 'medtrack-users',
  },
  upload: {
    maxFileSize: 10 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'],
    maxFiles: 5,
  },
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? (process.env.CORS_ORIGINS || 'https://medtrack.com,https://www.medtrack.com').split(',')
      : ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  },
  validation: {
    maxInputLength: 1000,
    allowedTags: [],
    sanitizeHtml: true,
  },
  api: {
    timeout: 30000,
    maxRetries: 3,
    retryDelay: 1000,
  },
}