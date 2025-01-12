import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    // 检查是否存在 superadmin 用户
    const superadmin = await prisma.user.findFirst({
      where: {
        role: 'SUPERADMIN',
      },
    });

    // 如果不存在则创建
    if (!superadmin) {
      // 直接对原始密码进行 hash
      const hashedPassword = await hash('123456', 10);

      await prisma.user.create({
        data: {
          email: 'root@admin.com',
          password: hashedPassword, // 存储 hash 后的密码
          name: 'superadmin',
          role: 'SUPERADMIN',
          lastLoginAt: new Date(),
        },
      });
      console.log('已创建超级管理员账号');
    }
  } catch (error) {
    console.error('初始化失败:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// 在应用启动时执行
export async function seed() {
  try {
    await main();
    console.log('数据库初始化完成');
  } catch (error) {
    console.error('数据库初始化失败:', error);
    throw error;
  }
}
