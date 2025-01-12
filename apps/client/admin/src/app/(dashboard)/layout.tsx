'use client';

import { FC, PropsWithChildren } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Users, Upload, Video, ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/use-auth';
import { useAuthStore } from '@/stores/auth';
import { toast } from 'sonner';

/**
 * 导航项接口
 */
interface NavItem {
  /** 标题 */
  title: string;
  /** 链接 */
  href: string;
  /** 图标 */
  icon: React.ElementType;
  /** 是否需要管理员权限 */
  requireAdmin?: boolean;
}

/**
 * 导航项列表
 */
const navItems: NavItem[] = [
  {
    title: '用户管理',
    href: '/users',
    icon: Users,
    requireAdmin: true,
  },
  {
    title: '视频上传',
    href: '/videos/upload',
    icon: Upload,
  },
  {
    title: '我的视频',
    href: '/videos/my',
    icon: Video,
  },
  {
    title: '视频审核',
    href: '/videos/pending',
    icon: ClipboardList,
    requireAdmin: true,
  },
];

const Layout: FC<PropsWithChildren> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { clearAuth } = useAuth();
  const user = useAuthStore((state) => state.user);

  const handleLogout = async () => {
    try {
      clearAuth();
      toast.success('退出登录成功');
      router.push('/login');
    } catch {
      toast.error('退出登录失败');
    }
  };

  return (
    <div className="flex h-screen">
      {/* 侧边栏 */}
      <aside className="bg-background w-64 border-r">
        <nav className="flex flex-col gap-2 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'hover:bg-accent hover:text-accent-foreground flex items-center gap-2 rounded-md px-4 py-2 transition-colors',
                  pathname === item.href && 'bg-accent text-accent-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.title}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* 顶部导航栏 */}
        <header className="flex h-14 items-center justify-end border-b px-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-red-500"
              >
                退出登录
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* 主内容区域 */}
        <main className="flex-1 overflow-auto p-4">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
