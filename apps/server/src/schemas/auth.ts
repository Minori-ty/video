import { z } from 'zod';

export const loginSchema = z.object({
  username: z
    .string({
      required_error: '用户名是必填的',
    })
    .min(1, '用户名不能为空'),
  password: z
    .string({
      required_error: '密码是必填的',
    })
    .min(6, '密码至少6位'),
});

export const registerSchema = z.object({
  username: z
    .string({
      required_error: '用户名是必填的',
    })
    .min(2, '用户名至少2位')
    .max(20, '用户名最多20位')
    .regex(/^[a-zA-Z0-9_-]+$/, '用户名只能包含字母、数字、下划线和横线'),

  email: z
    .string({
      required_error: '邮箱是必填的',
    })
    .email('邮箱格式不正确'),

  password: z
    .string({
      required_error: '密码是必填的',
    })
    .min(6, '密码至少6位')
    .max(20, '密码最多20位')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[^]{6,20}$/,
      '密码必须包含大小写字母和数字'
    ),
});
