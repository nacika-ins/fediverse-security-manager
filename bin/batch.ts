import { spamTextRepository } from '@/repositories/spam-text.repository';
import { serviceFlagRepository } from '@/repositories/service-flag.repository';
import { targetProviderRepository } from '@/repositories/target-provider.repository';

import { defaultRetryConfig } from 'ts-retry-promise';
import { execMastodon } from '@/features/batch/mastodon';
import { execMisskey } from '@/features/batch/misskey';

defaultRetryConfig.retries = 3;
defaultRetryConfig.backoff = 'LINEAR';
defaultRetryConfig.delay = 1000;
defaultRetryConfig.timeout = 5 * 60 * 1000;
defaultRetryConfig.logger = (log) => {
  // eslint-disable-next-line no-console
  console.log('[retry]', log);
};

(async () => {

  const spamTexts = await spamTextRepository.getSpamTexts();
  console.debug('spamTexts =', spamTexts);

  const serviceFlag = await serviceFlagRepository.getServiceFlagByName('automaticSpamReporting');
  await serviceFlagRepository.updatedLastCheckedByName('automaticSpamReporting');
  const isEnableAutomaticSpamReporting = serviceFlag?.enabled ?? false;
  if (!isEnableAutomaticSpamReporting) return;

  const providers = await targetProviderRepository.getTargetProviders();
  for (const provider of providers) {
    try {
      // eslint-disable-next-line no-continue
      if (!provider.enabled) continue;
      console.debug('provider =', provider);

      if (provider.providerType === 'mastodon') {
        await execMastodon(provider, spamTexts, serviceFlag?.lastChecked);
      }
      if (provider.providerType === 'misskey') {
        await execMisskey(provider, spamTexts, serviceFlag?.lastChecked);
      }

    } catch (error) {
      console.error('error =', error);
    }
  }

})();
