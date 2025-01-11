import { publicKey } from '@/config/keys';
import JSEncrypt from 'jsencrypt';

/**
 * RSA加密
 * @param text 要加密的文本
 * @returns 加密后的文本
 */
export const encrypt = (text: string) => {
  const encryptor = new JSEncrypt();
  encryptor.setPublicKey(publicKey);
  const options = {
    encryptionScheme: 'pkcs1',
  };
  Object.assign(encryptor, options);
  return encryptor.encrypt(text) || '';
};
