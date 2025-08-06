import { Elysia } from 'elysia';
import { RecipeDatabase } from '../models/database';
import { AuthController } from '../controllers/auth.controller';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
  updateProfileSchema,
} from '../validators/schemas';

interface SimpleContext {
  body: Record<string, unknown>;
  set: { status: number };
}

export function createAuthRoutes(db: RecipeDatabase) {
  const authController = new AuthController(db);

  return new Elysia({ prefix: '/auth' })
    .post(
      '/register',
      async ({ body, set }) => {
        const context: SimpleContext = { body, set: { status: 200 } };
        const result = await authController.register(context);
        if (context.set.status !== 200) {
          set.status = context.set.status;
        }
        return result;
      },
      {
        body: registerSchema,
        detail: {
          summary: 'Register a new user',
          description: 'Create a new user account with email and password',
          tags: ['Authentication'],
        },
      }
    )

    .post(
      '/login',
      async ({ body, set }) => {
        const context: SimpleContext = { body, set: { status: 200 } };
        const result = await authController.login(context);
        if (context.set.status !== 200) {
          set.status = context.set.status;
        }
        return result;
      },
      {
        body: loginSchema,
        detail: {
          summary: 'Login user',
          description: 'Authenticate user and return access and refresh tokens',
          tags: ['Authentication'],
        },
      }
    )

    .post(
      '/refresh',
      async ({ body, set }) => {
        const context: SimpleContext = { body, set: { status: 200 } };
        const result = await authController.refreshToken(context);
        if (context.set.status !== 200) {
          set.status = context.set.status;
        }
        return result;
      },
      {
        body: refreshTokenSchema,
        detail: {
          summary: 'Refresh access token',
          description: 'Get a new access token using a valid refresh token',
          tags: ['Authentication'],
        },
      }
    )

    .post(
      '/logout',
      async () => {
        const context = { body: {}, set: { status: 200 } };
        return await authController.logout(context);
      },
      {
        detail: {
          summary: 'Logout user',
          description: 'Logout the current user (client-side token removal)',
          tags: ['Authentication'],
        },
      }
    )

    .get(
      '/profile',
      async ({ headers, set }) => {
        // Extract user from JWT token in headers
        const authHeader = headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          set.status = 401;
          return {
            success: false,
            error: 'Authentication required',
          };
        }

        const context = {
          body: {},
          set: { status: 200 },
          user: { userId: 'temp', email: 'temp', name: 'temp' }, // This will be replaced by middleware
        };

        const result = await authController.getProfile(context);
        if (context.set.status !== 200) {
          set.status = context.set.status;
        }
        return result;
      },
      {
        detail: {
          summary: 'Get user profile',
          description: 'Get the authenticated user profile information',
          tags: ['Authentication'],
        },
      }
    )

    .put(
      '/profile',
      async ({ body, headers, set }) => {
        // Extract user from JWT token in headers
        const authHeader = headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          set.status = 401;
          return {
            success: false,
            error: 'Authentication required',
          };
        }

        const context = {
          body,
          set: { status: 200 },
          user: { userId: 'temp', email: 'temp', name: 'temp' }, // This will be replaced by middleware
        };

        const result = await authController.updateProfile(context);
        if (context.set.status !== 200) {
          set.status = context.set.status;
        }
        return result;
      },
      {
        body: updateProfileSchema,
        detail: {
          summary: 'Update user profile',
          description: 'Update the authenticated user profile information',
          tags: ['Authentication'],
        },
      }
    )

    .post(
      '/change-password',
      async ({ body, headers, set }) => {
        // Extract user from JWT token in headers
        const authHeader = headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          set.status = 401;
          return {
            success: false,
            error: 'Authentication required',
          };
        }

        const context = {
          body,
          set: { status: 200 },
          user: { userId: 'temp', email: 'temp', name: 'temp' }, // This will be replaced by middleware
        };

        const result = await authController.changePassword(context);
        if (context.set.status !== 200) {
          set.status = context.set.status;
        }
        return result;
      },
      {
        body: changePasswordSchema,
        detail: {
          summary: 'Change user password',
          description: 'Change the password for the authenticated user',
          tags: ['Authentication'],
        },
      }
    );
}
