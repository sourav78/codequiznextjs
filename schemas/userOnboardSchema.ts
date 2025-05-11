import * as z from 'zod';

export const userOnboardSchema = z.object({
  
  userId: z
    .string()
    .uuid({ message: 'Invalid user ID' })
    .min(1, { message: 'User ID is required' }),
  firstName: z
    .string()
    .min(1, { message: 'First name is required' }),
  lastName: z
    .string()
    .optional(),
  bio: z
    .string()
    .optional(),
  dob: z
    .date()
    .optional(),
  country: z
    .string()
})