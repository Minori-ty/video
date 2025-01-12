/**
 * 视频服务
 */
import { PrismaClient } from '@prisma/client';
import { minioClient, BUCKET_NAME } from '../config/minio';
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
      // 确保bucket存在
      const bucketExists = await minioClient.bucketExists(BUCKET_NAME);
      if (!bucketExists) {
        console.log(`创建存储桶: ${BUCKET_NAME}`);
        await minioClient.makeBucket(BUCKET_NAME);
      }

      console.log(`上传文件到MinIO: ${objectName}`);
      // 上传文件
      await minioClient.putObject(
        BUCKET_NAME,
        objectName,
        file.buffer,
        file.size,
        {
          'Content-Type': file.mimetype,
        }
      );

      // 生成URL
      const videoUrl = `http://localhost:9000/${BUCKET_NAME}/${objectName}`;
      console.log(`文件上传成功: ${videoUrl}`);
      return videoUrl;
    } catch (error) {
      console.error('MinIO上传失败:', error);
      throw error;
    }
  }

  /**
   * 从MinIO删除视频
   * @param videoUrl - 视频URL
   */
  private async deleteFromMinio(videoUrl: string): Promise<void> {
    try {
      const objectName = videoUrl.split('/').pop();
      if (!objectName) {
        throw new Error('无效的视频URL');
      }

      console.log(`从MinIO删除文件: ${objectName}`);
      await minioClient.removeObject(BUCKET_NAME, objectName);
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
      const videoUrl = await this.uploadToMinio(file);

      console.log('保存视频信息到数据库:', {
        title,
        videoUrl,
        size: file.size,
        mimeType: file.mimetype,
        userId,
      });

      // 保存视频信息到数据库
      const video = await prisma.video.create({
        data: {
          title,
          videoUrl,
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
      await this.deleteFromMinio(video.videoUrl);

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
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * 获取所有视频列表
   * @returns 视频列表
   */
  async getAllVideos() {
    return prisma.video.findMany({
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
}
