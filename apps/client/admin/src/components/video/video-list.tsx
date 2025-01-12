/**
 * 视频列表组件
 */
'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getUserVideos,
  deleteVideo,
  updateVideo,
  type UpdateVideoParams,
} from '@/services/video';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { formatBytes } from '@/lib/utils';
import { toast } from 'sonner';
import { MoreVertical, Pencil, Trash } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/**
 * 视频列表组件
 */
export const VideoList = () => {
  /** 查询客户端 */
  const queryClient = useQueryClient();

  /** 编辑对话框状态 */
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  /** 当前编辑的视频ID */
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  /** 编辑表单数据 */
  const [editForm, setEditForm] = useState<UpdateVideoParams>({
    title: '',
    description: '',
  });

  /** 获取用户视频列表 */
  const { data: videos, isLoading } = useQuery({
    queryKey: ['videos', 'user'],
    queryFn: getUserVideos,
  });

  /** 删除视频mutation */
  const deleteMutation = useMutation({
    mutationFn: deleteVideo,
    onSuccess: () => {
      toast.success('删除成功');
      queryClient.invalidateQueries({ queryKey: ['videos', 'user'] });
    },
    onError: () => {
      toast.error('删除失败');
    },
  });

  /** 更新视频mutation */
  const updateMutation = useMutation({
    mutationFn: (params: { id: string; data: UpdateVideoParams }) =>
      updateVideo(params.id, params.data),
    onSuccess: () => {
      toast.success('更新成功');
      setEditDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['videos', 'user'] });
    },
    onError: () => {
      toast.error('更新失败');
    },
  });

  /**
   * 处理删除视频
   * @param id - 视频ID
   */
  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个视频吗？')) {
      deleteMutation.mutate(id);
    }
  };

  /**
   * 打开编辑对话框
   * @param id - 视频ID
   * @param title - 视频标题
   * @param description - 视频描述
   */
  const openEditDialog = (id: string, title: string, description?: string) => {
    setEditingVideoId(id);
    setEditForm({ title, description });
    setEditDialogOpen(true);
  };

  /**
   * 处理更新视频
   */
  const handleUpdate = () => {
    if (!editingVideoId) return;
    if (!editForm.title.trim()) {
      toast.error('请输入视频标题');
      return;
    }

    updateMutation.mutate({
      id: editingVideoId,
      data: editForm,
    });
  };

  if (isLoading) {
    return <div>加载中...</div>;
  }

  if (!videos?.length) {
    return <div>暂无视频</div>;
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {videos.map((video) => (
          <Card key={video.id} className="space-y-2 p-4">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold">{video.title}</h3>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() =>
                      openEditDialog(video.id, video.title, video.description)
                    }
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    编辑
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => handleDelete(video.id)}
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    删除
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="bg-muted aspect-video overflow-hidden rounded-lg">
              <video
                src={video.videoUrl}
                className="h-full w-full object-cover"
                controls
              />
            </div>

            {video.description && (
              <p className="text-muted-foreground text-sm">
                {video.description}
              </p>
            )}

            <div className="text-muted-foreground text-sm">
              <div>大小：{formatBytes(video.size)}</div>
              <div>类型：{video.mimeType}</div>
              <div>上传时间：{new Date(video.createdAt).toLocaleString()}</div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑视频信息</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                标题
              </label>
              <Input
                id="title"
                value={editForm.title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditForm((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="请输入视频标题"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                描述
              </label>
              <Textarea
                id="description"
                value={editForm.description || ''}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setEditForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="请输入视频描述"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              disabled={updateMutation.isPending}
            >
              取消
            </Button>
            <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? '保存中...' : '保存'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
