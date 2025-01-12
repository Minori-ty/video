'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPendingVideos, deleteFailedVideo } from '@/services/video';
import type { Video } from '@/services/video';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatBytes } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';

/**
 * 获取状态徽章的变体
 * @param status - 视频状态
 */
const getStatusBadgeVariant = (
  status: Video['status']
): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status) {
    case 'PENDING':
      return 'secondary';
    case 'PROCESSING':
      return 'outline';
    case 'ERROR':
      return 'destructive';
    default:
      return 'default';
  }
};

/**
 * 获取状态文本
 * @param status - 视频状态
 */
const getStatusText = (status: Video['status']) => {
  switch (status) {
    case 'PENDING':
      return '等待处理';
    case 'PROCESSING':
      return '处理中';
    case 'ERROR':
      return '处理失败';
    case 'READY':
      return '处理完成';
  }
};

/**
 * 视频审核页面
 */
export default function PendingVideosPage() {
  const queryClient = useQueryClient();

  // 获取处理中的视频列表
  const { data: videos, isLoading } = useQuery({
    queryKey: ['pending-videos'],
    queryFn: getPendingVideos,
    // 每5秒刷新一次
    refetchInterval: 5000,
  });

  // 删除失败的视频
  const deleteMutation = useMutation({
    mutationFn: deleteFailedVideo,
    onSuccess: () => {
      toast.success('删除成功');
      // 刷新视频列表
      queryClient.invalidateQueries({ queryKey: ['pending-videos'] });
    },
    onError: () => {
      toast.error('删除失败');
    },
  });

  /** 处理删除 */
  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-lg">加载中...</div>
      </div>
    );
  }

  if (!videos?.length) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-lg">暂无处理中的视频</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="mb-6 text-2xl font-bold">视频审核</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {videos.map((video) => (
          <Card key={video.id} className="overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex-1 truncate" title={video.title}>
                  {video.title}
                </span>
                <Badge variant={getStatusBadgeVariant(video.status)}>
                  {getStatusText(video.status)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {video.status === 'PROCESSING' && video.chunks && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">处理进度</span>
                      <span>{video.chunks.length} 个切片</span>
                    </div>
                    <Progress value={video.chunks.length * 10} max={100} />
                  </div>
                )}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">上传者</span>
                    <span>{video.user?.name || '未知'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">大小</span>
                    <span>{formatBytes(video.size)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">类型</span>
                    <span>{video.mimeType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">上传时间</span>
                    <span>
                      {new Date(video.createdAt).toLocaleString('zh-CN')}
                    </span>
                  </div>
                </div>
                {video.status === 'ERROR' && (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full"
                    onClick={() => handleDelete(video.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    删除失败记录
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
