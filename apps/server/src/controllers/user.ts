import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user';
import { AppError } from '../utils/error';
import {
  paginationSchema,
  updateUserSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from '../schemas/user';

// 扩展 Express 的 Request 类型
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

const userService = new UserService();

export class UserController {
  /**
   * 获取当前用户信息
   */
  async getCurrentUser(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const user = await userService.getUserById(req.user!.id);
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
      const result = paginationSchema.safeParse(req.query);
      if (!result.success) {
        throw new AppError('无效的分页参数', 400);
      }

      const users = await userService.getUsers(result.data);
      res.json(users);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取用户详情
   */
  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新用户信息
   */
  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const result = updateUserSchema.safeParse(req.body);
      if (!result.success) {
        throw new AppError('无效的用户信息', 400);
      }

      const { id } = req.params;
      const user = await userService.updateUser(id, result.data);
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
      const { id } = req.params;
      await userService.deleteUser(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  /**
   * 重置用户密码
   */
  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const result = resetPasswordSchema.safeParse(req.body);
      if (!result.success) {
        throw new AppError('无效的密码格式', 400);
      }

      const { id } = req.params;
      await userService.resetPassword(id, result.data.password);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  /**
   * 修改密码
   */
  async changePassword(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const result = changePasswordSchema.safeParse(req.body);
      if (!result.success) {
        throw new AppError('无效的密码格式', 400);
      }

      const { oldPassword, newPassword } = result.data;
      await userService.changePassword(req.user!.id, oldPassword, newPassword);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  /**
   * 搜索用户
   */
  async searchUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const result = paginationSchema.safeParse(req.query);
      if (!result.success) {
        throw new AppError('无效的分页参数', 400);
      }

      const { keyword } = req.query;
      const users = await userService.searchUsers({
        ...result.data,
        keyword: keyword as string,
      });
      res.json(users);
    } catch (error) {
      next(error);
    }
  }
}
