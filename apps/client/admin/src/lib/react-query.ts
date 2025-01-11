import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // 失败重试次数
      refetchOnWindowFocus: false, // 窗口聚焦时不重新请求
      staleTime: 1000 * 60 * 5, // 数据5分钟内认为是新鲜的
    },
  },
});
