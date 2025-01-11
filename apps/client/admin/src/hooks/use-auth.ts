import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth';
import { encrypt } from '@/lib/crypto';
import axios from 'axios';

interface LoginData {
  username: string;
  password: string;
}

interface RegisterData extends LoginData {
  email: string;
}

export const useAuth = () => {
  const { setAuth, clearAuth } = useAuthStore();

  const login = useMutation({
    mutationFn: async (data: LoginData) => {
      const encryptedPassword = encrypt(data.password);
      const response = await axios.post(
        'http://localhost:8000/api/auth/login',
        {
          username: data.username,
          password: encryptedPassword,
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      setAuth(data.token, data.user);
    },
  });

  const register = useMutation({
    mutationFn: async (data: RegisterData) => {
      const encryptedPassword = encrypt(data.password);
      const response = await axios.post(
        'http://localhost:8000/api/auth/register',
        {
          username: data.username,
          email: data.email,
          password: encryptedPassword,
        }
      );
      return response.data;
    },
  });

  const logout = () => {
    clearAuth();
  };

  return {
    login,
    register,
    logout,
  };
};
