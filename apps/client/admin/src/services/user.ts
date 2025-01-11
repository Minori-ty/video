import { axios } from '@/lib/axios';
import type {
  User,
  PaginatedUsers,
  UpdateUserData,
  ResetPasswordData,
  ChangePasswordData,
} from '@/types/user';

export const UserService = {
  /**
   * 获取当前用户信息
   */
  getCurrentUser: () => {
    return axios.get<User>('/users/me');
  },

  /**
   * 获取用户列表
   */
  getUsers: (params?: { page?: number; pageSize?: number }) => {
    return axios.get<PaginatedUsers>('/users', { params });
  },

  /**
   * 搜索用户
   */
  searchUsers: (params: {
    keyword: string;
    page?: number;
    pageSize?: number;
  }) => {
    return axios.get<PaginatedUsers>('/users/search', { params });
  },

  /**
   * 获取用户详情
   */
  getUserById: (id: string) => {
    return axios.get<User>(`/users/${id}`);
  },

  /**
   * 更新用户信息
   */
  updateUser: (id: string, data: UpdateUserData) => {
    return axios.patch<User>(`/users/${id}`, data);
  },

  /**
   * 删除用户
   */
  deleteUser: (id: string) => {
    return axios.delete(`/users/${id}`);
  },

  /**
   * 重置用户密码
   */
  resetPassword: (id: string, data: ResetPasswordData) => {
    return axios.patch(`/users/${id}/password`, data);
  },

  /**
   * 修改密码
   */
  changePassword: (data: ChangePasswordData) => {
    return axios.patch('/users/me/password', data);
  },
};
