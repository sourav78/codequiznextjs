import * as z from 'zod';

export const signUpSchema = z.object({
  userName: z
    .string()
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: 'User name can only contain letters, numbers, and underscores, and must not contain spaces',
    })
    .min(1, { message: 'User name is required' })
    .max(50, { message: 'User name must be less than 50 characters' }),
  email: z
    .string()
    .email({ message: 'Invalid email address' })
    .max(100, { message: 'Email must be less than 100 characters' }),
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