'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { UserService } from '@/services/user';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Role, Gender } from '@/types/user';

const roleMap: Record<Role, string> = {
  USER: '普通用户',
  ADMIN: '管理员',
  SUPERADMIN: '超级管理员',
} as const;

const genderMap: Record<Gender, string> = {
  MALE: '男',
  FEMALE: '女',
  OTHER: '其他',
} as const;

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const { data: user, isLoading } = useQuery({
    queryKey: ['users', userId],
    queryFn: () => UserService.getUser(userId),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[150px]" />
          </div>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return <div>用户不存在</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" className="gap-2" onClick={() => router.back()}>
          <ChevronLeft className="h-4 w-4" />
          返回
        </Button>
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">基本信息</h2>
          <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <dt className="text-muted-foreground text-sm">用户名</dt>
              <dd className="text-sm font-medium">{user.name}</dd>
            </div>
            <div className="space-y-1">
              <dt className="text-muted-foreground text-sm">邮箱</dt>
              <dd className="text-sm font-medium">{user.email}</dd>
            </div>
            <div className="space-y-1">
              <dt className="text-muted-foreground text-sm">角色</dt>
              <dd className="text-sm font-medium">{roleMap[user.role]}</dd>
            </div>
            <div className="space-y-1">
              <dt className="text-muted-foreground text-sm">最后登录</dt>
              <dd className="text-sm font-medium">
                {user.lastLoginAt
                  ? format(new Date(user.lastLoginAt), 'yyyy-MM-dd HH:mm:ss')
                  : '从未登录'}
              </dd>
            </div>
          </dl>
        </div>

        <div>
          <h2 className="text-2xl font-bold tracking-tight">个人资料</h2>
          <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <dt className="text-muted-foreground text-sm">姓</dt>
              <dd className="text-sm font-medium">{user.firstName || '-'}</dd>
            </div>
            <div className="space-y-1">
              <dt className="text-muted-foreground text-sm">名</dt>
              <dd className="text-sm font-medium">{user.lastName || '-'}</dd>
            </div>
            <div className="space-y-1">
              <dt className="text-muted-foreground text-sm">性别</dt>
              <dd className="text-sm font-medium">
                {user.gender ? genderMap[user.gender] : '-'}
              </dd>
            </div>
            <div className="space-y-1">
              <dt className="text-muted-foreground text-sm">生日</dt>
              <dd className="text-sm font-medium">
                {user.dateOfBirth
                  ? format(new Date(user.dateOfBirth), 'yyyy-MM-dd')
                  : '-'}
              </dd>
            </div>
            <div className="space-y-1">
              <dt className="text-muted-foreground text-sm">手机号</dt>
              <dd className="text-sm font-medium">{user.phoneNumber || '-'}</dd>
            </div>
            <div className="space-y-1">
              <dt className="text-muted-foreground text-sm">地址</dt>
              <dd className="text-sm font-medium">{user.address || '-'}</dd>
            </div>
            <div className="space-y-1">
              <dt className="text-muted-foreground text-sm">时区</dt>
              <dd className="text-sm font-medium">{user.timezone || '-'}</dd>
            </div>
            <div className="space-y-1">
              <dt className="text-muted-foreground text-sm">创建时间</dt>
              <dd className="text-sm font-medium">
                {format(new Date(user.createdAt), 'yyyy-MM-dd HH:mm:ss')}
              </dd>
            </div>
          </dl>
        </div>

        {user.bio && (
          <div>
            <h2 className="text-2xl font-bold tracking-tight">个人简介</h2>
            <p className="mt-4 text-sm">{user.bio}</p>
          </div>
        )}
      </div>
    </div>
  );
}
