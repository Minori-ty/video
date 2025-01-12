/**
 * MinIO服务
 */
import { Client } from 'minio';
import { Readable } from 'stream';
import config from '../config/minio';

/**
 * MinIO服务类
 */
export class MinioService {
  /** MinIO客户端 */
  private client: Client;
  /** 存储桶名称 */
  private bucketName: string;

  constructor() {
    this.client = new Client({
      endPoint: config.endPoint,
      port: config.port,
      useSSL: config.useSSL,
      accessKey: config.accessKey,
      secretKey: config.secretKey,
    });
    this.bucketName = config.bucketName;
  }

  /**
   * 上传对象
   * @param objectName - 对象名称
   * @param stream - 文件流
   * @returns 对象URL
   */
  async putObject(
    objectName: string,
    stream: Readable | Buffer
  ): Promise<string> {
    await this.client.putObject(this.bucketName, objectName, stream);
    return this.getObjectUrl(objectName);
  }

  /**
   * 获取对象
   * @param objectName - 对象名称
   * @returns 文件流
   */
  async getObject(objectName: string): Promise<Readable> {
    return await this.client.getObject(this.bucketName, objectName);
  }

  /**
   * 删除对象
   * @param objectName - 对象名称
   */
  async removeObject(objectName: string): Promise<void> {
    await this.client.removeObject(this.bucketName, objectName);
  }

  /**
   * 获取对象URL
   * @param objectName - 对象名称
   * @returns 对象URL
   */
  getObjectUrl(objectName: string): string {
    return `${config.useSSL ? 'https' : 'http'}://${config.endPoint}:${config.port}/${this.bucketName}/${objectName}`;
  }
}

/**
 * MinIO服务实例
 */
export const minioService = new MinioService();
