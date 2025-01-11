import { Request, Response, NextFunction } from 'express';
import { AuthService } from '@/services/auth';

const authService = new AuthService();

export class AuthController {
  /**
   * 用户登录
   */
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, password } = req.body;
      const result = await authService.login({ username, password });
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 用户注册
   */
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, email, password } = req.body;
      const result = await authService.register({ username, email, password });
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
