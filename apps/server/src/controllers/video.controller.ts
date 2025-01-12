/**
 * 视频控制器
 */
import { Request, Response } from 'express';
import { VideoService } from '../services/video.service';
import multer from 'multer';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

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

/**
 * 配置multer用于处理文件上传
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 限制文件大小为100MB
  },
});

/**
 * 视频控制器类
 */
export class VideoController {
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

      const video = await videoService.uploadVideo({
        file,
        title,
        userId: req.user.id,
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
}

/**
 * 视频控制器实例
 */
export const videoController = new VideoController();

/**
 * 上传中间件
 */
export const uploadMiddleware = upload.single('file');
