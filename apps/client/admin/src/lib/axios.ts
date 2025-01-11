import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import { toast } from 'sonner';

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  withCredentials: true, // 允许跨域请求携带 cookie
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
instance.interceptors.response.use(
  (response) => {
    // 禁止修改这里
    return response;
  },
  (error) => {
    // 处理 401 错误（未授权）
    if (error.response?.status === 401) {
      useAuthStore.getState().clearAuth();
      // 如果不是登录页面，则重定向到登录页
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    const message =
      error.response?.data?.message || error.message || '请求失败，请稍后重试';
    toast.error(message);
    return Promise.reject(error);
  }
);

export { instance as axios };
