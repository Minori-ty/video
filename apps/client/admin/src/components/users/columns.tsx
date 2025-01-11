import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { User } from '@/types/user';
import { DataTableColumnHeader } from './data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { DataTableRowActions } from './data-table-row-actions';

const roleMap = {
  USER: '普通用户',
  ADMIN: '管理员',
  SUPERADMIN: '超级管理员',
} as const;

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
      const role = row.getValue('role') as keyof typeof roleMap;
      return (
        <Badge variant={role === 'SUPERADMIN' ? 'destructive' : 'default'}>
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
      const lastLoginAt = row.getValue('lastLoginAt') as string;
      if (!lastLoginAt) return '从未登录';
      return format(new Date(lastLoginAt), 'yyyy-MM-dd HH:mm:ss');
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="创建时间" />
    ),
    cell: ({ row }) => {
      const createdAt = row.getValue('createdAt') as string;
      return format(new Date(createdAt), 'yyyy-MM-dd HH:mm:ss');
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
