import { z } from 'zod';

// 分页参数验证
export const paginationSchema = z.object({
  page: z.string().optional().transform(Number),
  pageSize: z.string().optional().transform(Number),
});

// 更新用户信息验证
export const updateUserSchema = z.object({
  firstName: z
    .string()
    .min(1, '名字不能为空')
    .max(50, '名字最多50个字符')
    .optional(),
  lastName: z
    .string()
    .min(1, '姓氏不能为空')
    .max(50, '姓氏最多50个字符')
    .optional(),
  phoneNumber: z
    .string()
    .regex(/^1[3-9]\d{9}$/, '请输入有效的手机号码')
    .optional(),
  dateOfBirth: z.string().datetime().optional(),
  gender: z
    .enum(['MALE', 'FEMALE', 'OTHER'], {
      invalid_type_error: '性别必须是 MALE、FEMALE 或 OTHER',
    })
    .optional(),
  address: z.string().max(200, '地址最多200个字符').optional(),
  profilePicture: z.string().url('请输入有效的图片URL').optional(),
  bio: z.string().max(500, '个人简介最多500个字符').optional(),
  timezone: z.string().optional(),
  role: z
    .enum(['USER', 'ADMIN'], {
      invalid_type_error: '角色必须是 USER 或 ADMIN',
    })
    .optional(),
});

// 重置密码验证
export const resetPasswordSchema = z.object({
  password: z.string().min(6, '密码至少6个字符').max(32, '密码最多32个字符'),
});

// 修改密码验证
export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, '原密码不能为空'),
  newPassword: z
    .string()
    .min(6, '新密码至少6个字符')
    .max(32, '新密码最多32个字符'),
});
