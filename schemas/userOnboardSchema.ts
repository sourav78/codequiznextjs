import * as z from 'zod';

export const userOnboardSchema = z.object({

  firstName: z
    .string()
    .min(1, { message: 'First name is required' }),
  lastName: z
    .string()
    .optional(),
  bio: z
    .string()
    .min(1, { message: 'Write something about yourself' }),
  dob: z
    .any()
    .refine((val) => val === null || typeof val === "object", {
      message: "Date of birth is required",
    })
    .nullable(),
  country: z
    .string()
    .min(1, { message: 'Please select you country' }),
})