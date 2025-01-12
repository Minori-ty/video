import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { AxiosError, AxiosResponse } from 'axios';
import { useAuthStore } from '@/stores/auth';
import { axios } from '@/lib/axios';

interface LoginData {
  username: string;
  password: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export const useAuth = () => {
  const { setAuth, clearAuth } = useAuthStore();
  const router = useRouter();

  const login = useMutation<AxiosResponse<AuthResponse>, AxiosError, LoginData>(
    {
      mutationFn: async (data) => {
        console.log('发送登录请求:', {
          username: data.username,
          password: data.password,
        });
        return await axios.post<AuthResponse>('/auth/login', data);
      },
      onSuccess: (response) => {
        const { token, user } = response.data;
        setAuth(token, user);
        router.push('/');
      },
      onError: (error) => {
        if (error instanceof AxiosError) {
          console.error('登录失败:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
          });
        } else {
          console.error('未知登录错误:', error);
        }
      },
    }
  );

  return {
    login,
    clearAuth,
  };
};
