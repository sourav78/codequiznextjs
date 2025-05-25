import * as z from 'zod';

export const forgotPasswordSchema = z.object({
  code: z
    .string()
    .min(1, { message: 'Code is required' })
    .length(6, { message: 'Code must be 6 characters long' }),
  password: z
    .string()
    .min(1, { message: 'Password is required' })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[^\s]{8,}$/, {
      message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and no spaces',
    })
    .min(8, { message: 'Password must be at least 8 characters long' }),
  confirmPassword: z.string().min(1, { message: 'Confirm Password is required' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});