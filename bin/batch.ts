import { spamTextRepository } from '@/repositories/spam-text.repository';
import { serviceFlagRepository } from '@/repositories/service-flag.repository';
import { targetProviderRepository } from '@/repositories/target-provider.repository';
import { createRestAPIClient } from 'masto';
import { TargetProvider } from '@prisma/client';
import crypto from 'crypto';

import { defaultRetryConfig, retry } from 'ts-retry-promise';
import dayjs from 'dayjs';
import axios from 'axios';

defaultRetryConfig.retries = 3;
defaultRetryConfig.backoff = 'LINEAR';
defaultRetryConfig.delay = 1000;
defaultRetryConfig.timeout = 5 * 60 * 1000;
defaultRetryConfig.logger = (log) => {
  // eslint-disable-next-line no-console
  console.log('[retry]', log);
};

const execMastodon = async (provider: TargetProvider, spamTexts: string[], lastChecked: Date | null | undefined) => {

  const masto = createRestAPIClient({
    url: provider.apiEndpoint,
    accessToken: provider.apiToken,
  });

  const adminMasto = createRestAPIClient({
    url: provider.apiEndpoint,
    accessToken: provider.adminApiToken,
  });

  const offsetDate = dayjs((lastChecked ? dayjs(lastChecked)
    .add(-48, 'h') : null) ?? new Date(Date.now() - 48 * 60 * 60 * 1000));

  let sinceId: string | null | undefined;
  let isBreak = false;

  for (const _ of Array(999).fill(null)) {

    if (isBreak) break;

    // eslint-disable-next-line no-loop-func
    const notifications = await retry(async () => masto.v1.notifications.list({
      limit: 40,
      sinceId,
      types: ['mention'],
    }));
    sinceId = notifications[notifications.length - 1]?.id as string | null | undefined;
    console.debug('sinceId =', sinceId);

    if (sinceId === null || sinceId === undefined) {
      console.debug('No more notifications');
      break;
    }

    for (const notification of notifications) {

      if (dayjs(notification.createdAt).isBefore(offsetDate)) {
        console.debug('Reach to the last acquisition');
        isBreak = true;
        break;
      }

      // eslint-disable-next-line no-continue
      if (!notification.account?.id) continue;

      console.debug('------------------------------------------------------------------------------------');
      console.debug('notification.status.context =', notification?.status?.content);
      // console.debug('notification.status.mediaAttachments =', notification?.status?.mediaAttachments?.map((value)
      // => value.remoteUrl));
      // console.debug('notification.createdAt =', dayjs(notification.createdAt).format('YYYY-MM-DD HH:mm:ss'));
      // console.debug('offsetDate =', dayjs(offsetDate).format('YYYY-MM-DD HH:mm:ss'));

      // Get image md5
      const imageMD5s = (await Promise.all((notification.status?.mediaAttachments ?? []).map(async (media) => {
        if (!media.remoteUrl) return null;
        const image = await retry(
          async () => axios.get(media.remoteUrl as string, { responseType: 'arraybuffer' })).catch((e) => null);
        if (!image) return null;
        return crypto.createHash('md5').update(image.data).digest('hex');
      }))).filter((value): value is string => !!value);

      console.debug('md5 =', imageMD5s);

      try {

        const found = await spamTexts.some((spamText) =>
          // Check text
          notification.status?.content?.includes(spamText) ||
          // Check media url
          notification.status?.mediaAttachments?.some((media) => media.remoteUrl?.includes(spamText)) ||
          // Check image md5
          imageMD5s.includes(spamText),
        );
        console.debug('found =', found);
        // eslint-disable-next-line no-continue
        if (!found) continue;

        // report target
        console.debug('[spam found] notification =', notification.status?.content);
        console.debug('notification.account?.id =', notification.account?.id);
        console.debug('notification.account?.displayName =', notification.account?.displayName);
        console.debug('notification.account?.username =', notification.account?.username);
        console.debug('notification.status?.id =', notification.status?.id);

        // Report spam
        const report = await retry(async () => masto.v1.reports.create({
          accountId: notification.account?.id,
          statusIds: [notification.status?.id]?.filter((value): value is string => !!value),
          comment: 'This is spam.',
          forward: true,
          category: 'spam',
        }));
        console.debug('report =', report);

        // Remove Status
        // for (const statusId of report.statusIds ?? []) {
        //   console.debug('[Remove Status] statusId =', statusId);
        //   const result = await retry(async () => adminMasto.v1.statuses.$select(statusId).remove(), { retries: 0 });
        //   console.debug('result  =', result);
        // }

        // Suspend User
        console.debug('[Suspend User] report.targetAccount.id =', report.targetAccount.id);
        const suspendResult = await retry(async () => adminMasto.v1.admin.accounts.$select(report.targetAccount.id).action.create({
          type: 'suspend',
          sendEmailNotification: true,
          reportId: report.id,
          text: 'This account has been suspended due to spam.',
        }));
        console.debug('suspendResult =', suspendResult);

        // Resolve Report
        console.debug('[Resolve Report] report.id =', report.id);
        const resolveResult = await retry(async () => adminMasto.v1.admin.reports.$select(report.id).resolve());
        console.debug('resolveResult =', resolveResult);

      } catch
      (e) {
        console.error('error =', e);
      }
    }
  }
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

    } catch (error) {
      console.error('error =', error);
    }
  }

})();
