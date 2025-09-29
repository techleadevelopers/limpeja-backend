// src/config/configuration.ts
export default () => ({
  // Configurações básicas
  port: parseInt(process.env.PORT, 10) || 3000,
  databaseUrl: process.env.DATABASE_URL,
  appBaseUrl: process.env.APP_BASE_URL,

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET,
    expirationTime: process.env.JWT_EXPIRATION_TIME,
  },

  // Throttle (ausente antes)
  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL, 10) || 60,
    limit: parseInt(process.env.THROTTLE_LIMIT, 10) || 10,
  },

  // Redis (ausente antes - para Bull, Locks, Cache)
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  // Sentry (ausente antes)
  sentry: {
    dsn: process.env.SENTRY_DSN,
  },

  // Google Cloud Storage
  googleCloudStorage: {
    projectId: process.env.GCS_PROJECT_ID,
    keyFile: process.env.GCS_KEY,
    bucketName: process.env.GCS_BUCKET_NAME,
  },

  // APIs de terceiros
  thirdPartyApis: {
    facematch: {
      apiUrl: process.env.THIRD_PARTY_FACEMATCH_API_URL,
      apiKey: process.env.THIRD_PARTY_FACEMATCH_API_KEY,
    },
  },

  // Email
  email: {
    provider: process.env.EMAIL_SERVICE_PROVIDER,
    sendgridApiKey: process.env.SENDGRID_API_KEY,
    smtpHost: process.env.SMTP_HOST,
    smtpPort: parseInt(process.env.SMTP_PORT, 10),
    smtpUser: process.env.SMTP_USER,
    smtpPass: process.env.SMTP_PASS,
    defaultFrom: process.env.DEFAULT_EMAIL_FROM,
  },

  // SMS
  sms: {
    provider: process.env.SMS_SERVICE_PROVIDER,
    twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
    twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
    twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER,
    twilioVerifyServiceSid: process.env.TWILIO_VERIFY_SERVICE_SID,
  },

  // Geocoding
  geocoding: {
    provider: process.env.GEOCODING_API_PROVIDER,
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
    openStreetMapNominatimUrl: process.env.OPENSTREETMAP_NOMINATIM_URL,
  },

  // PagSeguro
  pagseguro: {
    apiToken: process.env.PAGSEGURO_API_TOKEN,
    apiBaseUrl: process.env.PAGSEGURO_API_BASE_URL,
  },
});