import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user';
import { AuthRequest } from '../middlewares/auth';

const userService = new UserService();

export class UserController {
  /**
   * 获取当前用户信息
   */
  async getCurrentUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new Error('未认证');
      }
      const user = await userService.getUserById(req.user.id);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取用户列表
   */
  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page) || 1;
      const pageSize = Number(req.query.pageSize) || 10;
      const users = await userService.getUsers(page, pageSize);
      res.json(users);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新用户角色
   */
  async updateUserRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const { role } = req.body;
      const user = await userService.updateUserRole(userId, role);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 删除用户
   */
  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      await userService.deleteUser(userId);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }

  /**
   * 修改密码
   */
  async changePassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new Error('未认证');
      }
      const { oldPassword, newPassword } = req.body;
      await userService.changePassword(req.user.id, oldPassword, newPassword);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }

  /**
   * 重置用户密码
   */
  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const { newPassword } = req.body;
      await userService.resetPassword(userId, newPassword);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }
}
