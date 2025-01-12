'use client';

import { FC, PropsWithChildren } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  Upload,
  Video,
  ClipboardList,
  Settings,
  LogOut,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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

  // 判断是否是管理员
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPERADMIN';

  const handleLogout = () => {
    try {
      clearAuth();
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
            // 如果需要管理员权限且用户不是管理员，则不显示
            if (item.requireAdmin && !isAdmin) {
              return null;
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'hover:bg-accent hover:text-accent-foreground flex items-center gap-2 rounded-md px-4 py-2 transition-colors',
                  pathname === item.href && 'bg-accent text-accent-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* 顶部导航栏 */}
        <header className="flex h-14 items-center justify-between border-b px-4">
          <div className="text-lg font-semibold">
            {navItems.find((item) => item.href === pathname)?.title || '仪表盘'}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  {/* <AvatarImage
                    src={user?.profilePicture}
                    alt={user?.name || ''}
                  /> */}
                  <AvatarFallback className="bg-primary/10">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.name}
                  </p>
                  <p className="text-muted-foreground text-xs leading-none">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>个人资料</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>设置</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>退出登录</span>
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
