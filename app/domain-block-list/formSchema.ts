import { z } from 'zod';

export const formSchema = z.object({
  targetProviderId: z.number().nonnegative().nullable(),
  targetProviders: z.array(
    z.object({
      id: z.number().nonnegative(),
      name: z.string().min(1),
      blockDomains: z.array(
        z.object({
          id: z.string().optional(),
          name: z.string().min(1),
          host: z.string().optional(),
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
  removeDomain: z
    .object({
      id: z.string().optional(),
      targetProviderId: z.number().nonnegative(),
      domain: z.string().min(1),
    })
    .optional(),
});
