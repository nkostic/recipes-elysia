import { Context } from 'elysia';
import { ApiError } from '../types';

interface ErrorResponse {
  success: boolean;
  error: string;
  code?: string;
}

export const errorHandler = ({ error, set }: { error: Error; set: any }): ErrorResponse => {
  console.error('Error:', error);

  if (error instanceof ApiError) {
    set.status = error.statusCode;
    return {
      success: false,
      error: error.message,
      code: error.code,
    };
  }

  // Handle validation errors
  if (error.name === 'ValidationError') {
    set.status = 400;
    return {
      success: false,
      error: 'Invalid request data',
      code: 'VALIDATION_ERROR',
    };
  }

  // Default error
  set.status = 500;
  return {
    success: false,
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
  };
};

// Rate limiting middleware (basic implementation)
export const rateLimiter = () => {
  const requests = new Map<string, { count: number; resetTime: number }>();
  const maxRequests = 100;
  const windowMs = 15 * 60 * 1000; // 15 minutes

  return (context: Context) => {
    const ip =
      context.request.headers.get('x-forwarded-for') ||
      context.request.headers.get('x-real-ip') ||
      'unknown';

    const now = Date.now();
    const userRequests = requests.get(ip);

    if (!userRequests || now > userRequests.resetTime) {
      requests.set(ip, { count: 1, resetTime: now + windowMs });
      return;
    }

    if (userRequests.count >= maxRequests) {
      throw new ApiError(429, 'Too many requests');
    }

    userRequests.count++;
  };
};

// CORS configuration
export const corsConfig = {
  credentials: true,
  origin:
    process.env.NODE_ENV === 'production'
      ? process.env.FRONTEND_URL?.split(',') || []
      : /localhost.*/,
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Basic auth middleware (placeholder - implement proper JWT)
export const authMiddleware = (context: Context) => {
  const authHeader = context.request.headers.get('authorization');

  if (!authHeader) {
    throw new ApiError(401, 'Authentication required');
  }

  const token = authHeader.replace('Bearer ', '');

  if (!token) {
    throw new ApiError(401, 'Invalid authentication token');
  }

  // TODO: Implement proper JWT validation
  // For now, we'll just check if token exists
  if (token === 'invalid') {
    throw new ApiError(401, 'Invalid token');
  }

  // Add user info to context (placeholder)
  (context as any).user = { id: 'temp-user-id', name: 'Test User' };
};
