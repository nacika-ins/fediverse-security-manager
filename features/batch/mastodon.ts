import { TargetProvider } from '@prisma/client';
import { createRestAPIClient } from 'masto';
import dayjs from 'dayjs';
import axios from 'axios';
import crypto from 'crypto';

import { defaultRetryConfig, retry } from 'ts-retry-promise';

defaultRetryConfig.retries = 3;
defaultRetryConfig.backoff = 'LINEAR';
defaultRetryConfig.delay = 1000;
defaultRetryConfig.timeout = 5 * 60 * 1000;
defaultRetryConfig.logger = (log) => {
  // eslint-disable-next-line no-console
  console.log('[retry]', log);
};

export const execMastodon = async (provider: TargetProvider, spamTexts: string[], lastChecked: Date | null | undefined) => {

  const masto = createRestAPIClient({
    url: provider.apiEndpoint,
    accessToken: provider.apiToken,
  });

  const adminMasto = createRestAPIClient({
    url: provider.apiEndpoint,
    accessToken: provider.adminApiToken,
  });

  // const offsetDate = dayjs((lastChecked ? dayjs(lastChecked)
  //   .add(-72, 'h') : null) ?? new Date(Date.now() - 72 * 60 * 60 * 1000));
  const offsetDate = dayjs(lastChecked ?? new Date(Date.now() - 72 * 60 * 60 * 1000));

  let maxId: string | null | undefined;

  for (const _ of Array(999).fill(null)) {

    // eslint-disable-next-line no-loop-func
    const statuses = await retry(async () => masto.v1.timelines.public.list({
      limit: 40,
      maxId,
    }));
    maxId = statuses[statuses.length - 1]?.id as string | null | undefined;
    console.debug('maxId =', maxId);

    if (maxId === null || maxId === undefined) {
      console.debug('No more status');
      break;
    }

    if (statuses.every((status) => dayjs(status.createdAt).isBefore(offsetDate))) {
      console.debug('No more status');
      break;
    }

    for (const status of statuses) {

      if (dayjs(status.createdAt).isBefore(offsetDate)) {
        // eslint-disable-next-line no-continue
        continue;
      }

      // eslint-disable-next-line no-continue
      if (!status.account?.id) continue;

      console.debug('------------------------------------------------------------------------------------');
      console.debug('status?.content =', status?.content);
      console.debug('status?.mediaAttachments =', status?.mediaAttachments
        ?.map((value) => value.remoteUrl));

      // Get image md5
      const imageMD5s = (await Promise.all((status?.mediaAttachments ?? []).map(async (media) => {
        if (!media.remoteUrl) return null;
        const image = await retry(
          async () => axios.get(media.remoteUrl as string, { responseType: 'arraybuffer' })).catch(() => null);
        if (!image) return null;
        return crypto.createHash('md5').update(image.data).digest('hex');
      }))).filter((value): value is string => !!value);
      console.debug('md5 =', imageMD5s);

      try {

        const found = await spamTexts.some((spamText) =>
          // Check text
          status?.content?.includes(spamText) ||
          // Check media url
          status?.mediaAttachments?.some((media) => media.remoteUrl?.includes(spamText)) ||
          // Check image md5
          imageMD5s.includes(spamText),
        );
        console.debug('found =', found);
        // eslint-disable-next-line no-continue
        if (!found) continue;

        // report target
        console.debug('[spam found] status?.content =', status?.content);
        console.debug('status.account?.id =', status.account?.id);
        console.debug('status.account?.displayName =', status.account?.displayName);
        console.debug('status.account?.username =', status.account?.username);
        console.debug('status?.id =', status?.id);

        // Report spam
        const report = await retry(async () => masto.v1.reports.create({
          accountId: status.account?.id,
          statusIds: [status?.id]?.filter((value): value is string => !!value),
          comment: 'This is spam.',
          forward: true,
          category: 'spam',
        }));
        console.debug('report =', report);

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
