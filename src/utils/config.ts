export const config = {
  port: parseInt(process.env.PORT || '3000'),
  databaseUrl: process.env.DATABASE_URL || './recipes.db',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  uploadDir: process.env.UPLOAD_DIR || './files',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB
  environment: process.env.NODE_ENV || 'development',
  corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
};

// Validate required environment variables in production
if (config.environment === 'production') {
  const requiredEnvVars = ['JWT_SECRET'];
  requiredEnvVars.forEach(envVar => {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  });
}
