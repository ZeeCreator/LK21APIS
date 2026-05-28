import { z } from 'zod';

export const syncMoviesSchema = z.object({
  type: z.enum(['latest', 'trending', 'all'], {
    errorMap: () => ({ message: 'Sync type must be one of: latest, trending, all' }),
  }),
});

export const syncByIdSchema = z.object({
  movieId: z.string().min(1, 'Movie ID is required'),
});

export type SyncMoviesInput = z.infer<typeof syncMoviesSchema>;
export type SyncByIdInput = z.infer<typeof syncByIdSchema>;
