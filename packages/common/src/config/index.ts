export const config = {
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER || 'crypto_user',
    password: process.env.DB_PASSWORD || 'crypto_password',
    database: process.env.DB_NAME || 'crypto_wallet',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'dev_jwt_secret',
    expiresIn: '24h',
  },
  security: {
    encryptionKey: process.env.MASTER_KEY || 'dev_master_key',
    saltRounds: 10,
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '60000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
  monitoring: {
    logLevel: process.env.LOG_LEVEL || 'debug',
  },
};
