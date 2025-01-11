import { Router } from 'express';
import { AuthController } from '@/controllers/auth';
import { validate } from '@/middlewares/validator';
import { loginSchema, registerSchema } from '@/schemas/auth';

const router: Router = Router();
const authController = new AuthController();

// 登录
router.post(
  '/login',
  validate(loginSchema),
  authController.login.bind(authController)
);

// 注册
router.post(
  '/register',
  validate(registerSchema),
  authController.register.bind(authController)
);

export default router;
