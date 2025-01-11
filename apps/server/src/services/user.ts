import { PrismaClient } from '@prisma/client';
import { AppError } from '../middlewares/error';
import { decrypt, hashPassword, verifyPassword } from '../lib/crypto';

const prisma = new PrismaClient();

export class UserService {
  /**
   * 获取用户信息
   * @param userId 用户ID
   */
  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError(404, '用户不存在');
    }

    return user;
  }

  /**
   * 获取用户列表
   * @param page 页码
   * @param pageSize 每页数量
   */
  async getUsers(page = 1, pageSize = 10) {
    const skip = (page - 1) * pageSize;
    const [total, users] = await Promise.all([
      prisma.user.count(),
      prisma.user.findMany({
        skip,
        take: pageSize,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          lastLoginAt: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ]);

    return {
      total,
      page,
      pageSize,
      items: users,
    };
  }

  /**
   * 更新用户角色
   * @param userId 用户ID
   * @param role 新角色
   */
  async updateUserRole(userId: string, role: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError(404, '用户不存在');
    }

    if (user.role === 'SUPERADMIN') {
      throw new AppError(403, '不能修改超级管理员的角色');
    }

    return prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });
  }

  /**
   * 删除用户
   * @param userId 用户ID
   */
  async deleteUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError(404, '用户不存在');
    }

    if (user.role === 'SUPERADMIN') {
      throw new AppError(403, '不能删除超级管理员');
    }

    await prisma.user.delete({
      where: { id: userId },
    });
  }

  /**
   * 修改密码
   * @param userId 用户ID
   * @param oldPassword 旧密码
   * @param newPassword 新密码
   */
  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        password: true,
      },
    });

    if (!user) {
      throw new AppError(404, '用户不存在');
    }

    // 解密并验证旧密码
    const decryptedOldPassword = decrypt(oldPassword);
    const isValid = await verifyPassword(decryptedOldPassword, user.password);
    if (!isValid) {
      throw new AppError(401, '原密码错误');
    }

    // 解密并哈希新密码
    const decryptedNewPassword = decrypt(newPassword);
    const hashedPassword = await hashPassword(decryptedNewPassword);

    // 更新密码
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }

  /**
   * 重置用户密码（管理员功能）
   * @param userId 用户ID
   * @param newPassword 新密码
   */
  async resetPassword(userId: string, newPassword: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError(404, '用户不存在');
    }

    if (user.role === 'SUPERADMIN') {
      throw new AppError(403, '不能重置超级管理员的密码');
    }

    // 解密并哈希新密码
    const decryptedPassword = decrypt(newPassword);
    const hashedPassword = await hashPassword(decryptedPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }
}
