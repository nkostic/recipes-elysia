import { RecipeDatabase } from '../models/database';
import { PasswordService } from '../utils/password';
import { JWTService } from '../utils/jwt';

interface RegisterBody {
  name: string;
  email: string;
  password: string;
}

interface LoginBody {
  email: string;
  password: string;
}

interface RefreshTokenBody {
  refreshToken: string;
}

interface ChangePasswordBody {
  currentPassword: string;
  newPassword: string;
}

interface UpdateProfileBody {
  name?: string;
  email?: string;
}

interface AuthContext {
  body: Record<string, unknown>;
  set: {
    status: number;
  };
  user?: {
    userId: string;
    email: string;
    name: string;
  };
}

export class AuthController {
  constructor(private db: RecipeDatabase) {}

  async register(context: AuthContext) {
    try {
      const { name, email, password } = context.body as unknown as RegisterBody;

      // Validate password strength
      const passwordValidation = PasswordService.validatePassword(password);
      if (!passwordValidation.isValid) {
        context.set.status = 400;
        return {
          success: false,
          error: 'Password does not meet requirements',
          details: passwordValidation.errors,
        };
      }

      // Check if user already exists
      const existingUser = this.db.getUserByEmail(email);
      if (existingUser) {
        context.set.status = 409;
        return {
          success: false,
          error: 'User with this email already exists',
        };
      }

      // Hash password and create user
      const passwordHash = await PasswordService.hash(password);
      const userId = await this.db.createUser({
        name,
        email,
        password_hash: passwordHash,
      });

      // Generate tokens
      const tokenPayload = { userId, email, name };
      const accessToken = JWTService.generateAccessToken(tokenPayload);
      const refreshToken = JWTService.generateRefreshToken({ userId });

      // Get user profile (without password)
      const userProfile = this.db.getUserProfile(userId);

      context.set.status = 201;
      return {
        success: true,
        data: {
          user: userProfile,
          accessToken,
          refreshToken,
        },
      };
    } catch (error: any) {
      context.set.status = 500;
      return {
        success: false,
        error: 'Registration failed',
        details: error.message,
      };
    }
  }

  async login(context: AuthContext) {
    try {
      const { email, password } = context.body as unknown as LoginBody;

      // Find user by email
      const user = this.db.getUserByEmail(email);
      if (!user) {
        context.set.status = 401;
        return {
          success: false,
          error: 'Invalid email or password',
        };
      }

      // Verify password
      const isValidPassword = await PasswordService.compare(password, user.password_hash);
      if (!isValidPassword) {
        context.set.status = 401;
        return {
          success: false,
          error: 'Invalid email or password',
        };
      }

      // Update last login
      this.db.updateUserLastLogin(user.id);

      // Generate tokens
      const tokenPayload = { userId: user.id, email: user.email, name: user.name };
      const accessToken = JWTService.generateAccessToken(tokenPayload);
      const refreshToken = JWTService.generateRefreshToken({ userId: user.id });

      // Get user profile (without password)
      const userProfile = this.db.getUserProfile(user.id);

      return {
        success: true,
        data: {
          user: userProfile,
          accessToken,
          refreshToken,
        },
      };
    } catch (error: unknown) {
      context.set.status = 500;
      return {
        success: false,
        error: 'Login failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async refreshToken(context: AuthContext) {
    try {
      const { refreshToken } = context.body as unknown as RefreshTokenBody;

      // Verify refresh token
      const payload = JWTService.verifyRefreshToken(refreshToken);

      // Get user
      const user = this.db.getUserById(payload.userId);
      if (!user) {
        context.set.status = 401;
        return {
          success: false,
          error: 'User not found',
        };
      }

      // Generate new access token
      const tokenPayload = { userId: user.id, email: user.email, name: user.name };
      const newAccessToken = JWTService.generateAccessToken(tokenPayload);

      return {
        success: true,
        data: {
          accessToken: newAccessToken,
        },
      };
    } catch (error: unknown) {
      context.set.status = 401;
      return {
        success: false,
        error: 'Invalid refresh token',
        details: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getProfile(context: AuthContext) {
    try {
      // Get user ID from auth middleware (will be added to context)
      const userId = context.user?.userId;

      if (!userId) {
        context.set.status = 401;
        return {
          success: false,
          error: 'Authentication required',
        };
      }

      const userProfile = this.db.getUserProfile(userId);
      if (!userProfile) {
        context.set.status = 404;
        return {
          success: false,
          error: 'User not found',
        };
      }

      return {
        success: true,
        data: userProfile,
      };
    } catch (error: unknown) {
      context.set.status = 500;
      return {
        success: false,
        error: 'Failed to get profile',
        details: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async updateProfile(context: AuthContext) {
    try {
      const userId = context.user?.userId;
      const { name, email } = context.body as unknown as UpdateProfileBody;

      if (!userId) {
        context.set.status = 401;
        return {
          success: false,
          error: 'Authentication required',
        };
      }

      // Check if email is already taken by another user
      if (email) {
        const existingUser = this.db.getUserByEmail(email);
        if (existingUser && existingUser.id !== userId) {
          context.set.status = 409;
          return {
            success: false,
            error: 'Email already taken',
          };
        }
      }

      // Update user profile
      const updates: string[] = [];
      const values: (string | number)[] = [];

      if (name) {
        updates.push('name = ?');
        values.push(name);
      }

      if (email) {
        updates.push('email = ?');
        values.push(email);
      }

      if (updates.length > 0) {
        updates.push('updated_at = CURRENT_TIMESTAMP');
        values.push(userId);

        this.db.updateUser(userId, { name, email });
      }

      const updatedProfile = this.db.getUserProfile(userId);

      return {
        success: true,
        data: updatedProfile,
      };
    } catch (error: unknown) {
      context.set.status = 500;
      return {
        success: false,
        error: 'Failed to update profile',
        details: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async changePassword(context: AuthContext) {
    try {
      const userId = context.user?.userId;
      const { currentPassword, newPassword } = context.body as unknown as ChangePasswordBody;

      if (!userId) {
        context.set.status = 401;
        return {
          success: false,
          error: 'Authentication required',
        };
      }

      // Validate new password
      const passwordValidation = PasswordService.validatePassword(newPassword);
      if (!passwordValidation.isValid) {
        context.set.status = 400;
        return {
          success: false,
          error: 'New password does not meet requirements',
          details: passwordValidation.errors,
        };
      }

      // Get user and verify current password
      const user = this.db.getUserById(userId);
      if (!user) {
        context.set.status = 404;
        return {
          success: false,
          error: 'User not found',
        };
      }

      const isValidPassword = await PasswordService.compare(currentPassword, user.password_hash);
      if (!isValidPassword) {
        context.set.status = 400;
        return {
          success: false,
          error: 'Current password is incorrect',
        };
      }

      // Hash new password and update
      const newPasswordHash = await PasswordService.hash(newPassword);
      this.db.updateUserPassword(userId, newPasswordHash);

      return {
        success: true,
        message: 'Password changed successfully',
      };
    } catch (error: unknown) {
      context.set.status = 500;
      return {
        success: false,
        error: 'Failed to change password',
        details: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async logout(_context: AuthContext) {
    // In a stateless JWT system, logout is handled client-side
    // The client should discard the tokens
    // For enhanced security, you could maintain a token blacklist
    return {
      success: true,
      message: 'Logged out successfully',
    };
  }
}
