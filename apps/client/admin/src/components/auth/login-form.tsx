'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { encrypt } from '@/lib/crypto';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AuthService } from '@/services/auth';
import { useMutation } from '@tanstack/react-query';

const loginSchema = z.object({
  username: z.string().min(1, '请输入用户名'),
  password: z.string().min(6, '密码至少6位'),
});

const registerSchema = z
  .object({
    username: z.string().min(1, '请输入用户名'),
    email: z.string().email('请输入有效的邮箱'),
    password: z.string().min(6, '密码至少6位'),
    confirmPassword: z.string().min(6, '密码至少6位'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '两次输入的密码不一致',
    path: ['confirmPassword'],
  });

type LoginData = z.infer<typeof loginSchema>;
type RegisterData = z.infer<typeof registerSchema>;

export function LoginForm() {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const { login } = useAuth();

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const registerForm = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const register = useMutation({
    mutationFn: async (data: Omit<RegisterData, 'confirmPassword'>) => {
      const encryptedPassword = encrypt(data.password);
      return await AuthService.register({
        ...data,
        password: encryptedPassword,
      });
    },
    onSuccess: () => {
      toast.success('注册成功');
      setTab('login');
      loginForm.setValue('username', registerForm.getValues('username'));
      registerForm.reset();
    },
    onError: (error) => {
      console.error('注册失败:', error);
      toast.error('注册失败');
    },
  });

  const onLoginSubmit = async (data: LoginData) => {
    try {
      if (!data.password) {
        toast.error('请输入密码');
        return;
      }

      const encryptedPassword = encrypt(data.password);
      console.log('登录数据:', {
        username: data.username,
        password: data.password,
        encryptedPassword,
      });

      await login.mutateAsync({
        username: data.username,
        password: encryptedPassword,
      });
      toast.success('登录成功');
    } catch (error) {
      console.error('登录失败:', error);
      toast.error('登录失败');
    }
  };

  const onRegisterSubmit = async (data: RegisterData) => {
    try {
      const { confirmPassword: _, ...registerData } = data;
      await register.mutateAsync(registerData);
    } catch (error) {
      console.error('注册失败:', error);
      toast.error('注册失败');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 via-indigo-50 to-emerald-50 p-4 sm:p-8 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      <Card className="w-full max-w-[400px] shadow-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-center text-2xl font-bold">
            欢迎使用后台管理系统
          </CardTitle>
          <CardDescription className="text-center">
            {tab === 'login' ? '登录您的账号' : '创建一个新账号'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            value={tab}
            onValueChange={(value) => setTab(value as 'login' | 'register')}
            className="w-full"
          >
            <TabsList className="mb-4 grid w-full grid-cols-2">
              <TabsTrigger value="login">登录</TabsTrigger>
              <TabsTrigger value="register">注册</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Form {...loginForm}>
                <form
                  onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={loginForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>用户名</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="请输入用户名"
                            className="bg-background"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>密码</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="请输入密码"
                            className="bg-background"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full transition-all hover:scale-[1.02]"
                    disabled={login.isPending}
                  >
                    {login.isPending ? '登录中...' : '登录'}
                  </Button>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="register">
              <Form {...registerForm}>
                <form
                  onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={registerForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>用户名</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="请输入用户名"
                            className="bg-background"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>邮箱</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="请输入邮箱"
                            className="bg-background"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>密码</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="请输入密码"
                            className="bg-background"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>确认密码</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="请再次输入密码"
                            className="bg-background"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full transition-all hover:scale-[1.02]"
                    disabled={register.isPending}
                  >
                    {register.isPending ? '注册中...' : '注册'}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
