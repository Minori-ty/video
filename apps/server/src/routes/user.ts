import { Router } from 'express';
import { UserController } from '../controllers/user';
import { authenticate, authorize } from '../middlewares/auth';
import { validate } from '../middlewares/validator';
import {
  updateUserRoleSchema,
  changePasswordSchema,
  resetPasswordSchema,
} from '../schemas/user';

const router: Router = Router();
const userController = new UserController();

// 获取当前用户信息
router.get(
  '/me',
  authenticate,
  userController.getCurrentUser.bind(userController)
);

// 获取用户列表（需要管理员权限）
router.get(
  '/',
  authenticate,
  authorize('ADMIN', 'SUPERADMIN'),
  userController.getUsers.bind(userController)
);

// 更新用户角色（需要超级管理员权限）
router.patch(
  '/:userId/role',
  authenticate,
  authorize('SUPERADMIN'),
  validate(updateUserRoleSchema),
  userController.updateUserRole.bind(userController)
);

// 删除用户（需要超级管理员权限）
router.delete(
  '/:userId',
  authenticate,
  authorize('SUPERADMIN'),
  userController.deleteUser.bind(userController)
);

// 修改当前用户密码
router.patch(
  '/me/password',
  authenticate,
  validate(changePasswordSchema),
  userController.changePassword.bind(userController)
);

// 重置用户密码（需要管理员权限）
router.patch(
  '/:userId/password',
  authenticate,
  authorize('ADMIN', 'SUPERADMIN'),
  validate(resetPasswordSchema),
  userController.resetPassword.bind(userController)
);

export default router;
