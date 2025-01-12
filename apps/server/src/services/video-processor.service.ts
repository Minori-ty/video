/**
 * 视频处理服务
 */
import { PrismaClient } from '@prisma/client';
import { MinioService } from './minio.service';
import ffmpeg from 'fluent-ffmpeg';
import { mkdir, unlink, readdir, rmdir, readFile } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { createReadStream, createWriteStream } from 'fs';

const prisma = new PrismaClient();
const minioService = new MinioService();

/**
 * FFProbe结果接口
 */
export interface FFProbeResult {
  /** 格式信息 */
  format: {
    /** 视频时长 */
    duration?: number;
  };
}

/**
 * 视频处理服务
 */
export class VideoProcessorService {
  /**
   * 创建临时目录
   * @returns 临时目录路径
   */
  private async createTempDir(): Promise<string> {
    const tempDir = join(process.cwd(), 'temp', randomUUID());
    await mkdir(tempDir, { recursive: true });
    return tempDir;
  }

  /**
   * 清理临时目录
   * @param tempDir - 临时目录路径
   */
  private async cleanupTempDir(tempDir: string): Promise<void> {
    try {
      const files = await readdir(tempDir);
      await Promise.all(files.map((file) => unlink(join(tempDir, file))));
      await rmdir(tempDir);
    } catch (error) {
      console.error('清理临时目录失败:', error);
    }
  }

  /**
   * 获取视频时长
   * @param inputPath - 输入视频路径
   * @returns 视频时长（秒）
   */
  private async getVideoDuration(inputPath: string): Promise<number> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(inputPath, (err, metadata) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(metadata.format.duration || 0);
      });
    });
  }

  /**
   * 生成m3u8切片
   * @param videoId - 视频ID
   * @param inputPath - 输入视频路径
   */
  async generateM3U8(videoId: string, inputPath: string): Promise<void> {
    const tempDir = await this.createTempDir();
    const outputPath = join(tempDir, 'playlist.m3u8');

    try {
      // 获取视频时长
      const duration = await this.getVideoDuration(inputPath);

      // 生成m3u8切片
      await new Promise<void>((resolve, reject) => {
        ffmpeg(inputPath)
          .outputOptions([
            '-codec:v libx264', // 使用H.264编码
            '-codec:a aac', // 使用AAC音频编码
            '-hls_time 10', // 每个切片10秒
            '-hls_list_size 0', // 保留所有切片
            '-hls_segment_filename',
            join(tempDir, 'segment%03d.ts'), // 切片文件名格式
            '-f hls', // HLS格式
          ])
          .output(outputPath)
          .on('end', () => resolve())
          .on('error', (err) => reject(err))
          .run();
      });

      // 读取生成的切片文件
      const files = await readdir(tempDir);
      const segments = files.filter((f: string) => f.endsWith('.ts'));

      // 上传切片到MinIO并创建数据库记录
      for (let i = 0; i < segments.length; i++) {
        const segmentPath = join(tempDir, segments[i]);
        const objectName = `${videoId}/${segments[i]}`;
        const url = await minioService.putObject(
          objectName,
          createReadStream(segmentPath)
        );

        await prisma.videoChunk.create({
          data: {
            videoId,
            index: i,
            filename: segments[i],
            url,
            duration: 10, // 每个切片10秒
          },
        });
      }

      // 修改m3u8文件中的路径
      const m3u8Content = await readFile(outputPath, 'utf-8');
      const updatedM3u8Content = m3u8Content.replace(
        /segment\d+\.ts/g,
        (match: string) => `${minioService.getObjectUrl(`${videoId}/${match}`)}`
      );

      // 上传m3u8文件
      const playlistObjectName = `${videoId}/playlist.m3u8`;
      await minioService.putObject(
        playlistObjectName,
        Buffer.from(updatedM3u8Content)
      );

      // 更新视频状态和时长
      await prisma.video.update({
        where: { id: videoId },
        data: {
          status: 'READY',
          duration,
          m3u8Url: minioService.getObjectUrl(playlistObjectName),
        },
      });
    } catch (error) {
      console.error('生成m3u8切片失败:', error);
      await prisma.video.update({
        where: { id: videoId },
        data: { status: 'ERROR' },
      });
      throw error;
    } finally {
      // 清理临时文件
      await this.cleanupTempDir(tempDir);
    }
  }

  /**
   * 处理视频
   * @param videoId - 视频ID
   */
  async processVideo(videoId: string): Promise<void> {
    try {
      // 获取视频信息
      const video = await prisma.video.findUnique({
        where: { id: videoId },
      });

      if (!video) {
        throw new Error('视频不存在');
      }

      // 更新视频状态为处理中
      await prisma.video.update({
        where: { id: videoId },
        data: { status: 'PROCESSING' },
      });

      // 从MinIO下载视频文件
      const tempDir = await this.createTempDir();
      const inputPath = join(tempDir, 'input.mp4');
      // 从URL中提取对象名称
      const objectName = video.url.split('/').pop();
      if (!objectName) {
        throw new Error('无效的视频URL');
      }
      const videoStream = await minioService.getObject(objectName);

      // 将视频流写入临时文件
      await new Promise<void>((resolve, reject) => {
        const writeStream = createWriteStream(inputPath);
        videoStream.pipe(writeStream);
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
      });

      // 生成m3u8切片
      await this.generateM3U8(videoId, inputPath);

      // 清理临时文件
      await this.cleanupTempDir(tempDir);
    } catch (error) {
      console.error('处理视频失败:', error);
      await prisma.video.update({
        where: { id: videoId },
        data: { status: 'ERROR' },
      });
      throw error;
    }
  }
}

/**
 * 视频处理服务实例
 */
export const videoProcessorService = new VideoProcessorService();
