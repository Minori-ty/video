'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { AxiosError } from 'axios';

export const LoginForm = () => {
  const router = useRouter();
  const { login, register } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    try {
      await login.mutateAsync({ username, password });
      toast.success('登录成功');
      router.push('/');
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.error || '登录失败');
      } else {
        toast.error('登录失败');
      }
      console.error('登录错误:', error);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const username = formData.get('username') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      await register.mutateAsync({ username, email, password });
      toast.success('注册成功');
      setActiveTab('login');
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.error || '注册失败');
      } else {
        toast.error('注册失败');
      }
      console.error('注册错误:', error);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>视频管理系统</CardTitle>
          <CardDescription>登录后开始管理您的视频内容</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as 'login' | 'register')}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">登录</TabsTrigger>
              <TabsTrigger value="register">注册</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form onSubmit={handleLogin}>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="username">用户名/邮箱</Label>
                    <Input
                      id="username"
                      name="username"
                      placeholder="请输入用户名或邮箱"
                      required
                      disabled={login.isPending}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">密码</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="请输入密码"
                      required
                      disabled={login.isPending}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={login.isPending}
                  >
                    {login.isPending ? '登录中...' : '登录'}
                  </Button>
                </div>
              </form>
            </TabsContent>
            <TabsContent value="register">
              <form onSubmit={handleRegister}>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="reg-username">用户名</Label>
                    <Input
                      id="reg-username"
                      name="username"
                      placeholder="请输入用户名"
                      required
                      disabled={register.isPending}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">邮箱</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="请输入邮箱"
                      required
                      disabled={register.isPending}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="reg-password">密码</Label>
                    <Input
                      id="reg-password"
                      name="password"
                      type="password"
                      placeholder="请输入密码"
                      required
                      disabled={register.isPending}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={register.isPending}
                  >
                    {register.isPending ? '注册中...' : '注册'}
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
