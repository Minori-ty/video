/**
 * 视频上传组件
 */
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadVideo } from '@/services/video';

/**
 * 视频上传组件
 */
export const UploadVideo = () => {
  /** 视频文件 */
  const [videoFile, setVideoFile] = useState<File | null>(null);
  /** 视频标题 */
  const [title, setTitle] = useState('');

  /** 查询客户端 */
  const queryClient = useQueryClient();

  /** 视频上传mutation */
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return await uploadVideo(formData);
    },
    onSuccess: () => {
      toast.success('上传成功');
      // 重置表单
      setVideoFile(null);
      setTitle('');
      // 刷新视频列表
      queryClient.invalidateQueries({ queryKey: ['videos', 'user'] });
    },
    onError: () => {
      toast.error('上传失败');
    },
  });

  /**
   * 处理视频文件选择
   * @param e - 文件选择事件
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        toast.error('请选择视频文件');
        return;
      }
      setVideoFile(file);
    }
  };

  /**
   * 处理视频上传
   */
  const handleUpload = async () => {
    if (!videoFile) {
      toast.error('请选择视频文件');
      return;
    }

    if (!title.trim()) {
      toast.error('请输入视频标题');
      return;
    }

    const formData = new FormData();
    formData.append('file', videoFile);
    formData.append('title', title);

    uploadMutation.mutate(formData);
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">视频标题</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="请输入视频标题"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="video">视频文件</Label>
          <Input
            id="video"
            type="file"
            accept="video/*"
            onChange={handleFileChange}
          />
        </div>

        <Button
          onClick={handleUpload}
          disabled={!videoFile || !title.trim() || uploadMutation.isPending}
        >
          {uploadMutation.isPending ? '上传中...' : '上传视频'}
        </Button>
      </div>
    </Card>
  );
};
