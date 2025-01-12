/**
 * 视频服务
 */
import { PrismaClient } from '@prisma/client';
import { minioService } from './minio.service';
import { randomUUID } from 'crypto';
import { extname } from 'path';

const prisma = new PrismaClient();

/**
 * 视频上传参数
 */
interface UploadVideoParams {
  /** 视频文件 */
  file: Express.Multer.File;
  /** 视频标题 */
  title: string;
  /** 用户ID */
  userId: string;
}

/**
 * 视频更新参数
 */
interface UpdateVideoParams {
  /** 视频标题 */
  title: string;
  /** 视频描述 */
  description?: string;
}

/**
 * 视频服务类
 */
export class VideoService {
  /**
   * 上传视频到MinIO
   * @param file - 视频文件
   * @returns 视频URL
   */
  private async uploadToMinio(file: Express.Multer.File): Promise<string> {
    const ext = extname(file.originalname);
    const objectName = `${randomUUID()}${ext}`;

    try {
      console.log(`上传文件到MinIO: ${objectName}`);
      // 上传文件
      const url = await minioService.putObject(objectName, file.buffer);
      console.log(`文件上传成功: ${url}`);
      return url;
    } catch (error) {
      console.error('MinIO上传失败:', error);
      throw error;
    }
  }

  /**
   * 从MinIO删除视频
   * @param url - 视频URL
   */
  private async deleteFromMinio(url: string): Promise<void> {
    try {
      const objectName = url.split('/').pop();
      if (!objectName) {
        throw new Error('无效的视频URL');
      }

      console.log(`从MinIO删除文件: ${objectName}`);
      await minioService.removeObject(objectName);
      console.log('文件删除成功');
    } catch (error) {
      console.error('MinIO删除失败:', error);
      throw error;
    }
  }

  /**
   * 上传视频
   * @param params - 上传参数
   * @returns 上传的视频信息
   */
  async uploadVideo(params: UploadVideoParams) {
    const { file, title, userId } = params;

    try {
      // 检查用户是否存在
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error(`用户不存在: ${userId}`);
      }

      // 上传视频到MinIO
      const url = await this.uploadToMinio(file);

      console.log('保存视频信息到数据库:', {
        title,
        url,
        size: file.size,
        mimeType: file.mimetype,
        userId,
      });

      // 保存视频信息到数据库
      const video = await prisma.video.create({
        data: {
          title,
          url,
          size: file.size,
          mimeType: file.mimetype,
          userId,
        },
      });

      console.log('视频信息保存成功:', video);
      return video;
    } catch (error) {
      console.error('视频上传失败:', error);
      throw error;
    }
  }

  /**
   * 删除视频
   * @param videoId - 视频ID
   * @param userId - 用户ID
   */
  async deleteVideo(videoId: string, userId: string) {
    try {
      // 查找视频
      const video = await prisma.video.findUnique({
        where: { id: videoId },
      });

      if (!video) {
        throw new Error('视频不存在');
      }

      // 检查权限
      if (video.userId !== userId) {
        throw new Error('无权删除此视频');
      }

      // 从MinIO删除视频文件
      await this.deleteFromMinio(video.url);

      // 从数据库删除视频记录
      await prisma.video.delete({
        where: { id: videoId },
      });

      return { success: true };
    } catch (error) {
      console.error('删除视频失败:', error);
      throw error;
    }
  }

  /**
   * 更新视频信息
   * @param videoId - 视频ID
   * @param userId - 用户ID
   * @param data - 更新数据
   */
  async updateVideo(videoId: string, userId: string, data: UpdateVideoParams) {
    try {
      // 查找视频
      const video = await prisma.video.findUnique({
        where: { id: videoId },
      });

      if (!video) {
        throw new Error('视频不存在');
      }

      // 检查权限
      if (video.userId !== userId) {
        throw new Error('无权修改此视频');
      }

      // 更新视频信息
      const updatedVideo = await prisma.video.update({
        where: { id: videoId },
        data,
      });

      return updatedVideo;
    } catch (error) {
      console.error('更新视频失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户的视频列表
   * @param userId - 用户ID
   * @returns 视频列表
   */
  async getUserVideos(userId: string) {
    return prisma.video.findMany({
      where: {
        userId,
        status: 'READY',
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * 获取所有视频列表
   * @returns 视频列表
   */
  async getAllVideos() {
    return prisma.video.findMany({
      where: {
        status: 'READY',
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * 获取视频详情
   * @param id - 视频ID
   * @returns 视频信息
   */
  async getVideoById(id: string) {
    return await prisma.video.findUnique({
      where: { id },
    });
  }

  /**
   * 获取处理中的视频列表
   * @returns 处理中的视频列表
   */
  async getPendingVideos() {
    return prisma.video.findMany({
      where: {
        OR: [
          { status: 'PENDING' },
          { status: 'PROCESSING' },
          { status: 'ERROR' },
        ],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        chunks: {
          select: {
            id: true,
            index: true,
          },
        },
      },
    });
  }
}
