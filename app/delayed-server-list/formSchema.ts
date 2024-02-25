import { z } from 'zod';

export const formSchema = z.object({
  targetProviderId: z.number().nonnegative().nullable(),
  targetProviders: z.array(
    z.object({
      id: z.number().nonnegative(),
      name: z.string().min(1),
      delayedServers: z.array(
        z.object({
          name: z.string().min(1),
          queue: z.number().min(0),
        }),
      ),
    }),
  ),
  addDomain: z
    .object({
      targetProviderId: z.number().nonnegative(),
      domain: z.string().min(1),
    })
    .optional(),
});
