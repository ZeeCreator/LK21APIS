import { z } from 'zod';

export const movieQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().int().positive('Page must be a positive integer')),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20))
    .pipe(z.number().int().min(1, 'Limit must be at least 1').max(100, 'Limit must be at most 100')),
  search: z.string().optional(),
});

export type MovieQueryInput = z.infer<typeof movieQuerySchema>;
