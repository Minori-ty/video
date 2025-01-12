/**
 * 视频控制器
 */
import { Request, Response } from 'express';
import { VideoService } from '../services/video.service';
import { VideoProcessorService } from '../services/video-processor.service';
import multer from 'multer';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 扩展Request类型以包含用户信息
 */
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

/**
 * 自定义错误类型
 */
interface CustomError extends Error {
  code?: string;
  name: string;
  message: string;
}

const videoService = new VideoService();
const videoProcessorService = new VideoProcessorService();

/**
 * 上传中间件配置
 */
export const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 限制文件大小为100MB
  },
}).single('file');

/**
 * 视频控制器类
 */
export class VideoController {
  constructor() {
    // 绑定方法到实例
    this.uploadVideo = this.uploadVideo.bind(this);
    this.deleteVideo = this.deleteVideo.bind(this);
    this.updateVideo = this.updateVideo.bind(this);
    this.getUserVideos = this.getUserVideos.bind(this);
    this.getAllVideos = this.getAllVideos.bind(this);
    this.getVideoPlayInfo = this.getVideoPlayInfo.bind(this);
    this.getPendingVideos = this.getPendingVideos.bind(this);
    this.deleteFailedVideo = this.deleteFailedVideo.bind(this);
  }

  /**
   * 上传视频
   * @param req - 请求对象
   * @param res - 响应对象
   */
  async uploadVideo(req: AuthenticatedRequest, res: Response) {
    try {
      const { title } = req.body;
      const file = req.file;

      console.log('上传视频请求:', {
        title,
        fileName: file?.originalname,
        fileSize: file?.size,
        userId: req.user?.id,
      });

      if (!file) {
        return res.status(400).json({ message: '请上传视频文件' });
      }

      if (!title) {
        return res.status(400).json({ message: '请提供视频标题' });
      }

      if (!req.user?.id) {
        return res.status(401).json({ message: '未认证' });
      }

      // 上传视频
      const video = await videoService.uploadVideo({
        file,
        title,
        userId: req.user.id,
      });

      // 异步处理视频
      videoProcessorService.processVideo(video.id).catch((error) => {
        console.error('视频处理失败:', error);
      });

      console.log('视频上传成功:', video);
      res.status(201).json(video);
    } catch (error: unknown) {
      const err = error as CustomError;
      console.error('上传视频失败:', {
        error: err,
        errorName: err.name,
        errorCode:
          err instanceof PrismaClientKnownRequestError ? err.code : undefined,
        errorMessage: err.message,
        userId: req.user?.id,
      });

      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          return res.status(400).json({ message: '用户不存在' });
        }
      }

      res.status(500).json({ message: '上传视频失败' });
    }
  }

  /**
   * 删除视频
   * @param req - 请求对象
   * @param res - 响应对象
   */
  async deleteVideo(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;

      if (!req.user?.id) {
        return res.status(401).json({ message: '未认证' });
      }

      await videoService.deleteVideo(id, req.user.id);
      res.json({ success: true });
    } catch (error: unknown) {
      const err = error as CustomError;
      console.error('删除视频失败:', err);

      if (err.message === '视频不存在') {
        return res.status(404).json({ message: err.message });
      }

      if (err.message === '无权删除此视频') {
        return res.status(403).json({ message: err.message });
      }

      res.status(500).json({ message: '删除视频失败' });
    }
  }

  /**
   * 更新视频信息
   * @param req - 请求对象
   * @param res - 响应对象
   */
  async updateVideo(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { title, description } = req.body;

      if (!req.user?.id) {
        return res.status(401).json({ message: '未认证' });
      }

      if (!title?.trim()) {
        return res.status(400).json({ message: '请提供视频标题' });
      }

      const video = await videoService.updateVideo(id, req.user.id, {
        title,
        description,
      });

      res.json(video);
    } catch (error: unknown) {
      const err = error as CustomError;
      console.error('更新视频失败:', err);

      if (err.message === '视频不存在') {
        return res.status(404).json({ message: err.message });
      }

      if (err.message === '无权修改此视频') {
        return res.status(403).json({ message: err.message });
      }

      res.status(500).json({ message: '更新视频失败' });
    }
  }

  /**
   * 获取用户的视频列表
   * @param req - 请求对象
   * @param res - 响应对象
   */
  async getUserVideos(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: '未认证' });
      }

      const videos = await videoService.getUserVideos(req.user.id);
      res.json(videos);
    } catch (error) {
      console.error('获取视频列表失败:', error);
      res.status(500).json({ message: '获取视频列表失败' });
    }
  }

  /**
   * 获取所有视频列表
   * @param req - 请求对象
   * @param res - 响应对象
   */
  async getAllVideos(req: Request, res: Response) {
    try {
      const videos = await videoService.getAllVideos();
      res.json(videos);
    } catch (error) {
      console.error('获取视频列表失败:', error);
      res.status(500).json({ message: '获取视频列表失败' });
    }
  }

  /**
   * 获取视频播放信息
   * @param req - 请求对象
   * @param res - 响应对象
   */
  async getVideoPlayInfo(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;

      const video = await videoService.getVideoById(id);
      if (!video) {
        return res.status(404).json({ message: '视频不存在' });
      }

      if (video.status !== 'READY') {
        return res.status(400).json({
          message: '视频未准备就绪',
          status: video.status,
        });
      }

      res.json({
        id: video.id,
        title: video.title,
        status: video.status,
        m3u8Url: video.m3u8Url,
        duration: video.duration,
      });
    } catch (error) {
      console.error('获取视频播放信息失败:', error);
      res.status(500).json({ message: '获取视频播放信息失败' });
    }
  }

  /**
   * 获取处理中的视频列表
   * @param req - 请求对象
   * @param res - 响应对象
   */
  async getPendingVideos(req: AuthenticatedRequest, res: Response) {
    try {
      const videos = await videoService.getPendingVideos();
      res.json(videos);
    } catch (error) {
      console.error('获取处理中的视频列表失败:', error);
      res.status(500).json({ message: '获取处理中的视频列表失败' });
    }
  }

  /**
   * 删除失败的视频记录
   * @param req - 请求对象
   * @param res - 响应对象
   */
  async deleteFailedVideo(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;

      // 查找视频
      const video = await prisma.video.findUnique({
        where: { id },
      });

      if (!video) {
        return res.status(404).json({ message: '视频不存在' });
      }

      // 检查视频状态
      if (video.status !== 'ERROR') {
        return res.status(400).json({ message: '只能删除处理失败的视频' });
      }

      // 删除视频记录
      await prisma.video.delete({
        where: { id },
      });

      res.json({ success: true });
    } catch (error) {
      console.error('删除失败视频记录失败:', error);
      res.status(500).json({ message: '删除失败视频记录失败' });
    }
  }
}

/**
 * 视频控制器实例
 */
export const videoController = new VideoController();
