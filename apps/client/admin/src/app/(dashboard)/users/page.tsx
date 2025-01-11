'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { UserService } from '@/services/user';
import { DataTable } from './data-table';
import { columns } from './columns';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/use-debounce';
import { PaginatedUsers } from '@/types/user';
import { AxiosResponse } from 'axios';

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = useQuery<AxiosResponse<PaginatedUsers>>({
    queryKey: ['users', debouncedSearch],
    queryFn: () =>
      debouncedSearch
        ? UserService.searchUsers({ keyword: debouncedSearch })
        : UserService.getUsers(),
  });

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">用户管理</h1>
        <div className="w-[300px]">
          <Input
            placeholder="搜索用户..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      <DataTable
        columns={columns}
        data={data?.data?.items || []}
        isLoading={isLoading}
      />
    </div>
  );
}
