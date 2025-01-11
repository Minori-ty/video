'use client';

import { ColumnDef } from '@tanstack/react-table';
import { User, Role } from '@/types/user';
import { DataTableColumnHeader } from './data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { DataTableRowActions } from './data-table-row-actions';

const roleMap: Record<Role, string> = {
  USER: '用户',
  ADMIN: '管理员',
  SUPERADMIN: '超级管理员',
};

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="用户名" />
    ),
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="邮箱" />
    ),
  },
  {
    accessorKey: 'role',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="角色" />
    ),
    cell: ({ row }) => {
      const role = row.getValue('role') as Role;
      return (
        <Badge variant={role === 'SUPERADMIN' ? 'destructive' : 'secondary'}>
          {roleMap[role]}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'lastLoginAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="最后登录" />
    ),
    cell: ({ row }) => {
      const date = row.getValue('lastLoginAt') as string;
      if (!date) return '从未登录';
      return format(new Date(date), 'PPpp', { locale: zhCN });
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="创建时间" />
    ),
    cell: ({ row }) => {
      const date = row.getValue('createdAt') as string;
      return format(new Date(date), 'PPpp', { locale: zhCN });
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
