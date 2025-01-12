/**
 * 上传视频页面
 */
import { UploadVideo } from '@/components/video/upload-video';

/**
 * 上传视频页面组件
 */
export default function UploadVideoPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">上传视频</h1>
      </div>

      <UploadVideo />
    </div>
  );
}
