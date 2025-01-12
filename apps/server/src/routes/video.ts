/**
 * 视频路由
 */
import { Router } from 'express';
import {
  videoController,
  uploadMiddleware,
} from '../controllers/video.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();

/**
 * 上传视频
 * @route POST /api/videos/upload
 * @access 私有
 */
router.post(
  '/upload',
  authenticate,
  uploadMiddleware,
  videoController.uploadVideo
);

/**
 * 删除视频
 * @route DELETE /api/videos/:id
 * @access 私有
 */
router.delete('/:id', authenticate, videoController.deleteVideo);

/**
 * 更新视频信息
 * @route PUT /api/videos/:id
 * @access 私有
 */
router.put('/:id', authenticate, videoController.updateVideo);

/**
 * 获取用户的视频列表
 * @route GET /api/videos/user
 * @access 私有
 */
router.get('/user', authenticate, videoController.getUserVideos);

/**
 * 获取所有视频列表
 * @route GET /api/videos
 * @access 私有
 */
router.get('/', authenticate, videoController.getAllVideos);

export default router;
