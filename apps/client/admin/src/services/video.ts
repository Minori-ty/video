/**
 * 视频服务
 */
import { axios } from '@/lib/axios';

/**
 * 视频信息接口
 */
export interface Video {
  /** 视频ID */
  id: string;
  /** 视频标题 */
  title: string;
  /** 视频描述 */
  description?: string;
  /** 视频URL */
  url: string;
  /** 视频封面URL */
  coverUrl?: string;
  /** 视频时长(秒) */
  duration?: number;
  /** 视频文件大小(字节) */
  size: number;
  /** 视频文件类型 */
  mimeType: string;
  /** 上传用户ID */
  userId: string;
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
  /** 视频状态 */
  status: 'PENDING' | 'PROCESSING' | 'READY' | 'ERROR';
  /** m3u8播放列表URL */
  m3u8Url?: string;
}

/**
 * 视频更新参数
 */
export interface UpdateVideoParams {
  /** 视频标题 */
  title: string;
  /** 视频描述 */
  description?: string;
}

/**
 * 视频播放信息
 */
export interface VideoPlayInfo {
  /** 视频ID */
  id: string;
  /** 视频标题 */
  title: string;
  /** 视频状态 */
  status: 'PENDING' | 'PROCESSING' | 'READY' | 'ERROR';
  /** m3u8播放列表URL */
  m3u8Url?: string;
  /** 视频时长 */
  duration?: number;
}

/**
 * 上传视频
 * @param formData - 包含视频文件和标题的表单数据
 * @returns 上传的视频信息
 */
export const uploadVideo = async (formData: FormData): Promise<Video> => {
  const { data } = await axios.post<Video>('/videos/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};

/**
 * 删除视频
 * @param id - 视频ID
 */
export const deleteVideo = async (id: string): Promise<void> => {
  await axios.delete(`/videos/${id}`);
};

/**
 * 更新视频信息
 * @param id - 视频ID
 * @param params - 更新参数
 * @returns 更新后的视频信息
 */
export const updateVideo = async (
  id: string,
  params: UpdateVideoParams
): Promise<Video> => {
  const { data } = await axios.put<Video>(`/videos/${id}`, params);
  return data;
};

/**
 * 获取用户的视频列表
 * @returns 视频列表
 */
export const getUserVideos = async (): Promise<Video[]> => {
  const { data } = await axios.get<Video[]>('/videos/user');
  return data;
};

/**
 * 获取所有视频列表
 * @returns 视频列表
 */
export const getAllVideos = async (): Promise<Video[]> => {
  const { data } = await axios.get<Video[]>('/videos');
  return data;
};

/**
 * 获取视频播放信息
 * @param id - 视频ID
 * @returns 视频播放信息
 */
export const getVideoPlayInfo = async (id: string): Promise<VideoPlayInfo> => {
  const { data } = await axios.get<VideoPlayInfo>(`/videos/${id}/play`);
  return data;
};
