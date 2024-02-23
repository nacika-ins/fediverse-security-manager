import { z } from 'zod';

export const formSchema = z.object({
  serviceFlag: z.object({
    automaticSpamReporting: z.boolean(),
  }),
  targetProviders: z.array(z.object({
    name: z.string().min(1),
    enabled: z.boolean(),
    providerType: z.enum(['mastodon', 'misskey']),
    apiEndpoint: z.string().url().min(1),
    apiToken: z.string().min(1),
    adminApiToken: z.string().min(1),
    isReportOnly: z.boolean().default(false),
  })),
});
