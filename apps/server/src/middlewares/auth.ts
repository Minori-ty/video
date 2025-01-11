import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/error';
import { Role } from '../types/role';
import { publicKey } from '../config/keys';

// 扩展 Request 类型以包含用户信息
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

/**
 * 认证中间件
 */
export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // 从请求头获取 token
    const authHeader = req.headers.authorization;
    console.log('Authorization header:', authHeader);

    // 从 cookie 获取 token
    const authCookie = req.cookies['auth-storage'];
    console.log('Auth cookie:', authCookie);

    let token: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      // 从请求头获取 token
      token = authHeader.split(' ')[1];
    } else if (authCookie) {
      // 从 cookie 获取 token
      try {
        const authData = JSON.parse(decodeURIComponent(authCookie));
        console.log('Parsed auth data:', authData);
        token = authData.state?.token;
        console.log('Token from cookie:', token);
      } catch (error) {
        console.error('Failed to parse auth cookie:', error);
        throw new AppError('无效的认证信息', 401);
      }
    }

    if (!token) {
      throw new AppError('未提供认证令牌', 401);
    }

    // 验证 token
    const decoded = jwt.verify(token, publicKey, { algorithms: ['RS256'] });
    console.log('Decoded token:', decoded);

    if (typeof decoded === 'object' && decoded.id) {
      req.user = {
        id: decoded.id,
        role: decoded.role as Role,
      };
      next();
    } else {
      throw new AppError('无效的认证令牌', 401);
    }
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('无效的认证令牌', 401));
    } else {
      next(error);
    }
  }
};

/**
 * 授权中间件
 */
export const authorize = (...roles: Role[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('未认证', 401));
    }

    // 转换角色名称
    const userRole =
      req.user.role === 'SUPERADMIN' ? 'SUPER_ADMIN' : req.user.role;

    if (!roles.includes(userRole as Role)) {
      return next(new AppError('无权限访问', 403));
    }

    next();
  };
};
