/**
 * 视频播放组件
 */
'use client';

import { useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery, type Query } from '@tanstack/react-query';
import { getVideoPlayInfo, type VideoPlayInfo } from '@/services/video';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

/**
 * 视频播放组件属性
 */
interface VideoPlayerProps {
  /** 视频ID */
  videoId: string;
}

/**
 * 视频播放组件
 */
export const VideoPlayer = ({ videoId }: VideoPlayerProps) => {
  /** 播放器引用 */
  const playerRef = useRef<ReactPlayer>(null);
  /** 错误信息 */
  const [error, setError] = useState<string | null>(null);

  /** 获取视频播放信息 */
  const { data: playInfo, isLoading } = useQuery({
    queryKey: ['video', 'play', videoId],
    queryFn: () => getVideoPlayInfo(videoId),
    refetchInterval: (query: Query<VideoPlayInfo, Error>) => {
      // 如果视频未准备就绪，每5秒轮询一次
      if (query.state.data?.status !== 'READY') {
        return 5000;
      }
      return false;
    },
  });

  if (isLoading) {
    return (
      <Card className="aspect-video w-full">
        <Skeleton className="h-full w-full" />
      </Card>
    );
  }

  if (error || !playInfo) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error || '加载视频信息失败'}</AlertDescription>
      </Alert>
    );
  }

  if (playInfo.status !== 'READY') {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          视频正在处理中，请稍后...
          {playInfo.status === 'ERROR' && '（处理失败）'}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="aspect-video w-full overflow-hidden">
      <ReactPlayer
        ref={playerRef}
        url={playInfo.m3u8Url}
        width="100%"
        height="100%"
        controls
        playing={false}
        onError={(error) => {
          console.error('视频播放错误:', error);
          setError('视频播放失败');
        }}
        config={{
          file: {
            forceHLS: true,
            hlsOptions: {
              enableWorker: true,
              lowLatencyMode: true,
            },
          },
        }}
      />
    </Card>
  );
};
