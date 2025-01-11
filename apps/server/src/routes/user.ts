import { Router } from 'express';
import { UserController } from '../controllers/user';
import { authenticate, authorize } from '../middlewares/auth';
import { Role } from '../types/role';

const router = Router();
const userController = new UserController();

// 获取当前用户信息
router.get('/me', authenticate, userController.getCurrentUser);

// 修改密码
router.patch('/me/password', authenticate, userController.changePassword);

// 搜索用户 (需要管理员权限)
router.get(
  '/search',
  authenticate,
  authorize(Role.ADMIN, Role.SUPER_ADMIN),
  userController.searchUsers
);

// 获取用户列表 (需要管理员权限)
router.get(
  '/',
  authenticate,
  authorize(Role.ADMIN, Role.SUPER_ADMIN),
  userController.getUsers
);

// 获取用户详情 (需要管理员权限)
router.get(
  '/:id',
  authenticate,
  authorize(Role.ADMIN, Role.SUPER_ADMIN),
  userController.getUserById
);

// 更新用户信息 (需要管理员权限)
router.patch(
  '/:id',
  authenticate,
  authorize(Role.ADMIN, Role.SUPER_ADMIN),
  userController.updateUser
);

// 删除用户 (需要超级管理员权限)
router.delete(
  '/:id',
  authenticate,
  authorize(Role.SUPER_ADMIN),
  userController.deleteUser
);

// 重置用户密码 (需要管理员权限)
router.patch(
  '/:id/password',
  authenticate,
  authorize(Role.ADMIN, Role.SUPER_ADMIN),
  userController.resetPassword
);

export default router;
