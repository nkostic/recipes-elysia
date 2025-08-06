import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';
import { RecipeDatabase } from './models/database';
import { createRoutes } from './routes';
import { createAuthRoutes } from './routes/auth.routes';
import { errorHandler, corsConfig } from './middleware';
import { config } from './utils/config';

// Initialize database
const db = new RecipeDatabase();

// Wait for database initialization before starting server
await db.waitForInit();

// Create main application
const app = new Elysia()
  .use(cors(corsConfig))
  .use(
    swagger({
      documentation: {
        info: {
          title: 'Recipe API Documentation',
          version: '1.0.0',
          description: 'Backend API for recipe management system built with Elysia and Bun',
        },
        tags: [
          { name: 'Authentication', description: 'User authentication and profile management' },
          { name: 'Recipes', description: 'Recipe management endpoints' },
          { name: 'Cuisines', description: 'Cuisine management endpoints' },
          { name: 'Files', description: 'File upload and serving endpoints' },
        ],
        servers: [
          {
            url:
              config.environment === 'production'
                ? 'https://your-api-domain.com'
                : `http://localhost:${config.port}`,
            description:
              config.environment === 'production' ? 'Production server' : 'Development server',
          },
        ],
      },
      path: '/docs',
    })
  )
  .onError(errorHandler)
  .use(createAuthRoutes(db))
  .use(createRoutes(db))
  .get(
    '/',
    () => ({
      message: 'Recipe API is running',
      version: '1.0.0',
      documentation: '/docs',
      endpoints: {
        auth: '/auth',
        recipes: '/api/v1/recipes',
        cuisines: '/api/v1/cuisines',
        files: '/api/v1/files',
      },
    }),
    {
      detail: {
        tags: ['General'],
        summary: 'API health check and information',
      },
    }
  )
  .get(
    '/health',
    () => ({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: config.environment,
    }),
    {
      detail: {
        tags: ['General'],
        summary: 'Health check endpoint',
      },
    }
  );

// Start server with explicit Bun.serve configuration
const server = Bun.serve({
  hostname: '0.0.0.0',
  port: config.port,
  fetch: app.fetch,
});

console.log(`🦊 Recipe API is running at ${server.hostname}:${server.port}`);
console.log(`📚 API Documentation available at http://${server.hostname}:${server.port}/docs`);
console.log(`🌱 Environment: ${config.environment}`);

export default app;
