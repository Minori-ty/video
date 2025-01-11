import { PrismaClient, Prisma } from '@prisma/client';
import { AppError } from '../middlewares/error';
import { hashPassword, verifyPassword } from '../lib/crypto';
import logger from '../lib/logger';

const prisma = new PrismaClient();

interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  address?: string;
  profilePicture?: string;
  bio?: string;
  timezone?: string;
  role?: 'USER' | 'ADMIN';
}

interface PaginationParams {
  page?: number;
  pageSize?: number;
}

interface SearchParams extends PaginationParams {
  keyword?: string;
}

export class UserService {
  /**
   * 获取用户列表
   * @param params 分页参数
   */
  async getUsers(params: PaginationParams = {}) {
    try {
      const page = Math.max(1, Number(params.page) || 1);
      const pageSize = Math.max(1, Number(params.pageSize) || 10);
      const skip = (page - 1) * pageSize;

      const [total, items] = await Promise.all([
        prisma.user.count(),
        prisma.user.findMany({
          skip,
          take: pageSize,
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        }),
      ]);

      return {
        total,
        items,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        logger.error({
          message: '获取用户列表失败 - Prisma验证错误',
          error: {
            name: error.name,
            message: error.message,
            details: error,
          },
        });
      } else {
        logger.error({
          message: '获取用户列表失败 - 其他错误',
          error,
        });
      }
      throw new AppError(500, '获取用户列表失败');
    }
  }

  /**
   * 获取用户详情
   * @param id 用户ID
   */
  async getUserById(id: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          lastLoginAt: true,
          createdAt: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
          dateOfBirth: true,
          gender: true,
          address: true,
          profilePicture: true,
          bio: true,
          timezone: true,
        },
      });

      if (!user) {
        throw new AppError(404, '用户不存在');
      }

      return user;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error({
        message: '获取用户详情失败',
        error,
      });
      throw new AppError(500, '获取用户详情失败');
    }
  }

  /**
   * 更新用户信息
   * @param id 用户ID
   * @param data 更新数据
   */
  async updateUser(id: string, data: UpdateUserData) {
    try {
      // 检查用户是否存在
      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) {
        throw new AppError(404, '用户不存在');
      }

      // 如果要更新角色,检查是否为超级管理员
      if (data.role && user.role === 'SUPERADMIN') {
        throw new AppError(403, '不能修改超级管理员的角色');
      }

      // 更新用户信息
      const updatedUser = await prisma.user.update({
        where: { id },
        data,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          lastLoginAt: true,
          createdAt: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
          dateOfBirth: true,
          gender: true,
          address: true,
          profilePicture: true,
          bio: true,
          timezone: true,
        },
      });

      return updatedUser;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error({
        message: '更新用户信息失败',
        error,
      });
      throw new AppError(500, '更新用户信息失败');
    }
  }

  /**
   * 删除用户
   * @param id 用户ID
   */
  async deleteUser(id: string) {
    try {
      // 检查用户是否存在
      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) {
        throw new AppError(404, '用户不存在');
      }

      // 不能删除超级管理员
      if (user.role === 'SUPERADMIN') {
        throw new AppError(403, '不能删除超级管理员');
      }

      await prisma.user.delete({ where: { id } });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error({
        message: '删除用户失败',
        error,
      });
      throw new AppError(500, '删除用户失败');
    }
  }

  /**
   * 重置用户密码
   * @param id 用户ID
   * @param newPassword 新密码
   */
  async resetPassword(id: string, newPassword: string) {
    try {
      // 检查用户是否存在
      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) {
        throw new AppError(404, '用户不存在');
      }

      // 对新密码进行哈希
      const hashedPassword = await hashPassword(newPassword);

      // 更新密码
      await prisma.user.update({
        where: { id },
        data: { password: hashedPassword },
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error({
        message: '重置密码失败',
        error,
      });
      throw new AppError(500, '重置密码失败');
    }
  }

  /**
   * 修改密码
   * @param id 用户ID
   * @param oldPassword 原密码
   * @param newPassword 新密码
   */
  async changePassword(id: string, oldPassword: string, newPassword: string) {
    try {
      // 检查用户是否存在
      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) {
        throw new AppError(404, '用户不存在');
      }

      // 验证原密码
      const isPasswordValid = await verifyPassword(oldPassword, user.password);
      if (!isPasswordValid) {
        throw new AppError(400, '原密码错误');
      }

      // 对新密码进行哈希
      const hashedPassword = await hashPassword(newPassword);

      // 更新密码
      await prisma.user.update({
        where: { id },
        data: { password: hashedPassword },
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error({
        message: '修改密码失败',
        error,
      });
      throw new AppError(500, '修改密码失败');
    }
  }

  /**
   * 搜索用户
   * @param params 搜索参数
   */
  async searchUsers(params: SearchParams = {}) {
    try {
      const page = Math.max(1, Number(params.page) || 1);
      const pageSize = Math.max(1, Number(params.pageSize) || 10);
      const keyword = params.keyword || '';
      const skip = (page - 1) * pageSize;

      //   console.log('搜索参数:', {
      //     page,
      //     pageSize,
      //     keyword,
      //     skip,
      //     type: {
      //       page: typeof page,
      //       pageSize: typeof pageSize,
      //       skip: typeof skip,
      //     },
      //   });

      const where = keyword
        ? {
            OR: [
              { name: { contains: keyword, mode: 'insensitive' as const } },
              { email: { contains: keyword, mode: 'insensitive' as const } },
              {
                firstName: { contains: keyword, mode: 'insensitive' as const },
              },
              { lastName: { contains: keyword, mode: 'insensitive' as const } },
            ],
          }
        : {};

      const [total, items] = await Promise.all([
        prisma.user.count({ where }),
        prisma.user.findMany({
          where,
          skip,
          take: pageSize,
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            lastLoginAt: true,
            createdAt: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
            profilePicture: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        }),
      ]);

      return {
        total,
        items,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    } catch (error) {
      logger.error({
        message: '搜索用户失败',
        error,
      });
      throw new AppError(500, '搜索用户失败');
    }
  }

  /**
   * 检查用户名是否已存在
   * @param name 用户名
   * @param excludeId 排除的用户ID
   */
  async checkNameExists(name: string, excludeId?: string) {
    const user = await prisma.user.findFirst({
      where: {
        name,
        id: { not: excludeId },
      },
    });
    return !!user;
  }

  /**
   * 检查邮箱是否已存在
   * @param email 邮箱
   * @param excludeId 排除的用户ID
   */
  async checkEmailExists(email: string, excludeId?: string) {
    const user = await prisma.user.findFirst({
      where: {
        email,
        id: { not: excludeId },
      },
    });
    return !!user;
  }
}
