import { TargetProvider } from '@prisma/client';
import dayjs from 'dayjs';

import { defaultRetryConfig, retry } from 'ts-retry-promise';
import {
  abuseUserReports,
  deleteNote,
  getGlobalTimeline,
  reportAbuse,
  resolveAbuseUserReport,
  suspendUser,
} from '@/features/vendorApis/misskey';

defaultRetryConfig.retries = 3;
defaultRetryConfig.backoff = 'LINEAR';
defaultRetryConfig.delay = 1000;
defaultRetryConfig.timeout = 5 * 60 * 1000;
defaultRetryConfig.logger = (log) => {
  // eslint-disable-next-line no-console
  console.log('[retry]', log);
};

export const execMisskey = async (
  provider: TargetProvider,
  spamTexts: string[],
  lastChecked: Date | null | undefined,
) => {
  // const offsetDate = dayjs((lastChecked ? dayjs(lastChecked)
  //   .add(-72, 'h') : null) ?? new Date(Date.now() - 48 * 60 * 60 * 1000));
  const offsetDate = dayjs(
    lastChecked ?? new Date(Date.now() - 72 * 60 * 60 * 1000),
  );

  let untilId: string | null | undefined;

  for (const _ of Array(999).fill(null)) {
    // eslint-disable-next-line no-loop-func
    const notes = await retry(() => getGlobalTimeline({ provider, untilId }));

    console.debug('[old] untilId =', untilId);
    untilId = notes[notes.length - 1]?.id as string | null | undefined;
    console.debug('[new] untilId =', untilId);

    if (untilId === null || untilId === undefined) {
      console.debug('No more notes');
      break;
    }

    if (notes.every((note) => dayjs(note.createdAt).isBefore(offsetDate))) {
      console.debug('No more notes');
      break;
    }

    for (const note of notes) {
      if (dayjs(note.createdAt).isBefore(offsetDate)) {
        // eslint-disable-next-line no-continue
        continue;
      }

      // eslint-disable-next-line no-continue
      if (!note.userId) continue;

      console.debug(
        '------------------------------------------------------------------------------------',
      );
      console.debug('note?.text =', note?.text);
      console.debug('note?.files =', note?.files);

      // Get image md5
      const imageMD5s =
        note?.files?.map((media) => media.md5).filter((md5) => md5) ?? [];
      console.debug('md5 =', imageMD5s);

      try {
        const found = await spamTexts.some(
          (spamText) =>
            // Check text
            note?.text?.includes(spamText) ||
            // Check media url
            note?.files?.some((media) => media.url?.includes(spamText)) ||
            // Check image md5
            imageMD5s.includes(spamText),
        );

        console.debug('found =', found);
        // eslint-disable-next-line no-continue
        if (!found) continue;

        // report target
        console.debug('[spam found] note?.text =', note?.text);
        console.debug('note.userId =', note.userId);
        console.debug('note.user?.id =', note.user?.id);
        console.debug('note.user?.name =', note.user?.name);
        console.debug('note.user?.username =', note.user?.username);
        console.debug('note?.id =', note?.id);

        // Report spam ( When 200OK, no value is returned )
        console.debug('[reportAbuse] note.userId =', note.userId);
        await retry(() =>
          reportAbuse({ provider, userId: note.userId, comment: 'spam' }),
        );

        // Reports
        console.debug('[abuseUserReports]');
        const reports = await retry(() => abuseUserReports({ provider }));
        const reportId = reports[0]?.id;
        const targetUserId = reports[0]?.targetUserId;

        if (!reportId) {
          throw new Error('Report ID is not found');
        }

        if (!targetUserId) {
          throw new Error('Target User ID is not found');
        }

        if (provider.isReportOnly) continue;

        // Delete note ( When 200OK, no value is returned )
        console.debug('[deleteNote] note?.id =', note?.id);
        await retry(() => deleteNote({ provider, noteId: note?.id }));

        // Suspend User ( When 200OK, no value is returned )
        console.debug('[suspendUser] targetUserId =', targetUserId);
        await retry(() => suspendUser({ provider, userId: targetUserId }));

        // Resolve Report ( When 200OK, no value is returned )
        console.debug('[resolveAbuseUserReport] reportId =', reportId);
        await retry(() => resolveAbuseUserReport({ provider, reportId }));
      } catch (error) {
        console.debug('error =', error);
      }
    }
  }
};
