/**
 * MinIO配置
 */
import { Client } from 'minio';

/**
 * MinIO客户端实例
 */
export const minioClient = new Client({
  endPoint: 'localhost',
  port: 9000,
  useSSL: false,
  accessKey: 'FTiP2tGUa8lwkZtZnR9I',
  secretKey: 'c8gWP9e3xRkj4Ave7nDpjqiehmnemj2VILeasOok',
});

/**
 * 视频存储桶名称
 */
export const BUCKET_NAME = 'admin';
