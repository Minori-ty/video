// 从环境变量获取公钥
export const publicKey = process.env.NEXT_PUBLIC_RSA_PUBLIC_KEY || '';

if (!publicKey) {
  throw new Error('RSA公钥未配置，请检查环境变量 NEXT_PUBLIC_RSA_PUBLIC_KEY');
}
