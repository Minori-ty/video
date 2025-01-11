import { PrismaClient } from '@prisma/client';
import { decrypt, hashPassword, verifyPassword } from '@/lib/crypto';
import jwt from 'jsonwebtoken';
import { privateKey } from '@/config/keys';
import { AppError } from '@/middlewares/error';

const prisma = new PrismaClient();

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
    // 解密密码
    const decryptedPassword = decrypt(data.password);

    // 查找用户
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: data.username }, { name: data.username }],
      },
    });

    if (!user) {
      throw new AppError(404, '用户不存在');
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
        role: user.role,
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
  }

  /**
   * 用户注册
   * @param data 注册数据
   */
  async register(data: RegisterData) {
    // 解密密码
    const decryptedPassword = decrypt(data.password);

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
