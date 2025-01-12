import { axios } from '@/lib/axios';
import type { LoginData, RegisterData, AuthResponse } from '../types/auth';

export const AuthService = {
  login: (data: LoginData) => {
    console.log('AuthService 中的登录数据:', data);
    return axios.post<AuthResponse>('/auth/login', data);
  },

  register: (data: RegisterData) => {
    return axios.post<AuthResponse>('/auth/register', data);
  },

  logout: () => {
    return axios.post('/auth/logout');
  },
};
