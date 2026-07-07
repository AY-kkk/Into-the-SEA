import { z } from 'zod';

const email = z.string().trim().toLowerCase().email('邮箱格式不正确');
const password = z.string().min(8, '密码至少 8 位').max(72, '密码过长');
const name = z.string().trim().min(1, '昵称不能为空').max(40, '昵称过长');

export const registerSchema = z.object({ email, name, password });
export const loginSchema = z.object({ email, password });
export const resetPasswordSchema = z.object({ email, newPassword: password });

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
