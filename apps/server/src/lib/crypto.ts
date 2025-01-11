import { privateKey } from '../config/keys';
import { hash, compare } from 'bcryptjs';
import NodeRSA from 'node-rsa';

/**
 * RSA解密
 * @param text 要解密的文本
 * @returns 解密后的文本
 */
export const decrypt = (text: string) => {
  const key = new NodeRSA(privateKey, 'pkcs1-private-pem', {
    encryptionScheme: 'pkcs1',
  });
  return key.decrypt(text, 'utf8');
};

/**
 * 密码哈希
 * @param password 原始密码
 * @returns 哈希后的密码
 */
export const hashPassword = async (password: string) => {
  return hash(password, 10);
};

/**
 * 验证密码
 * @param password 原始密码
 * @param hashedPassword 哈希后的密码
 * @returns 是否匹配
 */
export const verifyPassword = async (
  password: string,
  hashedPassword: string
) => {
  return compare(password, hashedPassword);
};
