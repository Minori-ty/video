import { z } from 'zod';

export const updateUserRoleSchema = z.object({
  role: z.enum(['USER', 'ADMIN'], {
    required_error: '角色是必填的',
    invalid_type_error: '角色必须是 USER 或 ADMIN',
  }),
});

export const changePasswordSchema = z.object({
  oldPassword: z
    .string({
      required_error: '原密码是必填的',
    })
    .min(1, '原密码不能为空'),

  newPassword: z
    .string({
      required_error: '新密码是必填的',
    })
    .min(6, '新密码至少6位')
    .max(20, '新密码最多20位')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[^]{6,20}$/,
      '新密码必须包含大小写字母和数字'
    ),
});

export const resetPasswordSchema = z.object({
  newPassword: z
    .string({
      required_error: '新密码是必填的',
    })
    .min(6, '新密码至少6位')
    .max(20, '新密码最多20位')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[^]{6,20}$/,
      '新密码必须包含大小写字母和数字'
    ),
});
