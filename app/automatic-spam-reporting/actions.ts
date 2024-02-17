'use server';

import { z } from 'zod';
import { formSchema } from '@/app/automatic-spam-reporting/formSchema';
import { serviceFlagRepository } from '@/repositories/service-flag.repository';
import { targetProviderRepository } from '@/repositories/target-provider.repository';

export async function update(props: z.infer<typeof formSchema>) {

  console.debug('props =', props);
  console.debug('ser =', 'automaticSpamReporting' in props.serviceFlag);

  if ('automaticSpamReporting' in props.serviceFlag) {
    await serviceFlagRepository.saveServiceFlag({
      name: 'automaticSpamReporting',
      enabled: props.serviceFlag.automaticSpamReporting,
    });
  }

  console.debug(' save');
  await targetProviderRepository.saveTargetProviders(props.targetProviders);
  return {};

}

export async function get(): Promise<z.infer<typeof formSchema>> {
  return {
    serviceFlag: {
      automaticSpamReporting: (await serviceFlagRepository.getServiceFlagByName('automaticSpamReporting'))?.enabled ?? false,
    },
    targetProviders: ((await targetProviderRepository.getTargetProviders()) ?? []).map((value) => ({
      ...value,
      providerType: value.providerType as 'mastodon' | 'misskey',
    })),
  };
}
