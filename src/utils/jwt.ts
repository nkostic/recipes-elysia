import jwt from 'jsonwebtoken';
import { config } from './config';

export interface JWTPayload {
  userId: string;
  email: string;
  name: string;
}

export class JWTService {
  private static readonly ACCESS_TOKEN_EXPIRES_IN = '1h';
  private static readonly REFRESH_TOKEN_EXPIRES_IN = '7d';

  static generateAccessToken(payload: JWTPayload): string {
    return jwt.sign(payload, config.jwtSecret, {
      expiresIn: this.ACCESS_TOKEN_EXPIRES_IN,
      issuer: 'recipes-api',
      audience: 'recipes-app',
    });
  }

  static generateRefreshToken(payload: Pick<JWTPayload, 'userId'>): string {
    return jwt.sign(payload, config.jwtSecret, {
      expiresIn: this.REFRESH_TOKEN_EXPIRES_IN,
      issuer: 'recipes-api',
      audience: 'recipes-app',
    });
  }

  static verifyAccessToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, config.jwtSecret, {
        issuer: 'recipes-api',
        audience: 'recipes-app',
      }) as JWTPayload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  static verifyRefreshToken(token: string): Pick<JWTPayload, 'userId'> {
    try {
      return jwt.verify(token, config.jwtSecret, {
        issuer: 'recipes-api',
        audience: 'recipes-app',
      }) as Pick<JWTPayload, 'userId'>;
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  static extractTokenFromHeader(authHeader: string | null): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }
}
