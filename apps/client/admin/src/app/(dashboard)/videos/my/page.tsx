/**
 * 我的视频页面
 */
import { VideoList } from '@/components/video/video-list';

/**
 * 我的视频页面组件
 */
export default function MyVideosPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">我的视频</h1>
      </div>

      <VideoList />
    </div>
  );
}
