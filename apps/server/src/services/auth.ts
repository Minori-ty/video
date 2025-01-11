import { PrismaClient } from '@prisma/client';
import { decrypt, hashPassword, verifyPassword } from '../lib/crypto';
import jwt from 'jsonwebtoken';
import { privateKey } from '../config/keys';
import { AppError } from '../middlewares/error';
import { z } from 'zod';
import logger from '../lib/logger';

const prisma = new PrismaClient();

// 密码验证规则
const passwordSchema = z.string().min(6, '密码至少6位').max(32, '密码最多32位');

interface LoginData {
  username: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export class AuthService {
  /**
   * 用户登录
   * @param data 登录数据
   */
  async login(data: LoginData) {
    try {
      // 先查找用户
      const user = await prisma.user.findFirst({
        where: {
          OR: [{ email: data.username }, { name: data.username }],
        },
      });

      if (!user) {
        throw new AppError(404, '用户不存在');
      }

      // 解密密码
      let decryptedPassword: string;
      try {
        decryptedPassword = decrypt(data.password);
      } catch (error) {
        logger.error({
          message: '密码解密失败',
          error,
        });
        throw new AppError(400, '密码格式错误');
      }

      // 验证密码
      const isValid = await verifyPassword(decryptedPassword, user.password);
      if (!isValid) {
        throw new AppError(401, '密码错误');
      }

      // 更新最后登录时间
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      // 生成token
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role === 'SUPERADMIN' ? 'SUPER_ADMIN' : user.role,
        },
        privateKey,
        { algorithm: 'RS256', expiresIn: '7d' }
      );

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error({
        message: '登录失败',
        error,
      });
      throw new AppError(500, '登录失败');
    }
  }

  /**
   * 用户注册
   * @param data 注册数据
   */
  async register(data: RegisterData) {
    // 解密密码
    const decryptedPassword = decrypt(data.password);

    // 验证解密后的密码
    try {
      await passwordSchema.parseAsync(decryptedPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new AppError(400, error.errors[0].message);
      }
      throw error;
    }

    // 检查用户名是否存在
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: data.email }, { name: data.username }],
      },
    });

    if (existingUser) {
      throw new AppError(409, '用户名或邮箱已存在');
    }

    // 密码哈希
    const hashedPassword = await hashPassword(decryptedPassword);

    // 创建用户
    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.username,
        password: hashedPassword,
        lastLoginAt: new Date(),
      },
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }
}
