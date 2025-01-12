import { Router } from 'express';
import { videoController } from '../controllers/video.controller';
import { authenticate } from '../middlewares/auth';
import { uploadMiddleware } from '../controllers/video.controller';

const router = Router();

// 上传视频
router.post(
  '/upload',
  authenticate,
  uploadMiddleware,
  videoController.uploadVideo
);

// 获取用户的视频列表
router.get('/user', authenticate, videoController.getUserVideos);

// 获取处理中的视频列表
router.get('/pending', authenticate, videoController.getPendingVideos);

// 获取所有视频列表
router.get('/', authenticate, videoController.getAllVideos);

// 获取视频播放信息
router.get('/:id/play', authenticate, videoController.getVideoPlayInfo);

// 删除失败的视频记录
router.delete('/:id/failed', authenticate, videoController.deleteFailedVideo);

// 删除视频
router.delete('/:id', authenticate, videoController.deleteVideo);

// 更新视频信息
router.put('/:id', authenticate, videoController.updateVideo);

export default router;
