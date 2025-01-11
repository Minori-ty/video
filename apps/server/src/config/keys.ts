import fs from 'fs';
import path from 'path';

// 读取private.pem文件内容
export const privateKey = fs.readFileSync(
  path.join(process.cwd(), '../../private.pem'),
  'utf-8'
);

// 读取public.pem文件内容
export const publicKey = fs.readFileSync(
  path.join(process.cwd(), '../../public.pem'),
  'utf-8'
);
