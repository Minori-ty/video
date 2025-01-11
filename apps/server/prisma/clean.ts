import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clean() {
  try {
    // 删除所有用户
    await prisma.user.deleteMany();
    console.log('已清理所有用户数据');
  } catch (error) {
    console.error('清理失败:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

clean();
