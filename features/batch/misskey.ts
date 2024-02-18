import { TargetProvider } from '@prisma/client';
import dayjs from 'dayjs';
import axios from 'axios';

import { defaultRetryConfig, retry } from 'ts-retry-promise';
import { MisskeyNotifications } from '@/features/batch/response/misskey-notification';
import { MisskeyReport } from '@/features/batch/response/misskey-report';

defaultRetryConfig.retries = 3;
defaultRetryConfig.backoff = 'LINEAR';
defaultRetryConfig.delay = 1000;
defaultRetryConfig.timeout = 5 * 60 * 1000;
defaultRetryConfig.logger = (log) => {
  // eslint-disable-next-line no-console
  console.log('[retry]', log);
};

const getNotifications = async ({ provider, sinceId }: { provider: TargetProvider, sinceId: string | undefined | null }) =>
  axios.post<MisskeyNotifications>(`${provider.apiEndpoint}/i/notifications`?.replace('//', '/'), {
    i: provider.apiToken,
    limit: 40,
    unreadOnly: false,
    markAsRead: true,
    includeTypes: [
      'mention',
      'reply',
    ],
    excludeTypes: [
      'follow',
    ],
    sinceId,
  }, {
    headers: {
      Authorization: `Bearer ${provider.apiToken}`,
      'Content-Type': 'application/json',
    },
  }).then((res) =>
    res.data.sort((a: { createdAt: string }, b: { createdAt: string }) => dayjs(a.createdAt).isBefore(dayjs(b.createdAt)) ? 1 : -1),
  ).catch((err) => {
    console.debug('err =', err.response?.data);
    return [];
  });

const reportAbuse = async ({ provider, userId, comment }: { provider: TargetProvider, userId: string, comment: string }) =>
  axios.post<void>(`${provider.apiEndpoint}/users/report-abuse`?.replace('//', '/'), {
    i: provider.apiToken,
    userId,
    comment,
  }, {
    headers: {
      Authorization: `Bearer ${provider.apiToken}`,
      'Content-Type': 'application/json',
    },
  }).then((res) => res.data).catch((err) => {
    console.debug('err =', err.response?.data);
    return [];
  });

const resolveAbuseUserReport = async ({ provider, reportId }: { provider: TargetProvider, reportId: string }) =>
  axios.post<void>(`${provider.apiEndpoint}/admin/resolve-abuse-user-report`?.replace('//', '/'), {
    i: provider.adminApiToken,
    reportId,
    forward: true,
  }, {
    headers: {
      Authorization: `Bearer ${provider.apiToken}`,
      'Content-Type': 'application/json',
    },
  }).then((res) => res.data).catch((err) => {
    console.debug('err =', err.response?.data);
    return [];
  });

const abuseUserReports = async ({ provider }: { provider: TargetProvider }) =>
  axios.post<MisskeyReport[]>(`${provider.apiEndpoint}/admin/abuse-user-reports`?.replace('//', '/'), {
    i: provider.adminApiToken,
    limit: 1,

  }, {
    headers: {
      Authorization: `Bearer ${provider.apiToken}`,
      'Content-Type': 'application/json',
    },
  }).then((res) => res.data).catch((err) => {
    console.debug('err =', err.response?.data);
    return [];
  });

const suspendUser = async ({ provider, userId }: { provider: TargetProvider, userId: string; }) =>
  axios.post<void>(`${provider.apiEndpoint}/admin/suspend-user`?.replace('//', '/'), {
    i: provider.adminApiToken,
    userId,
  }, {
    headers: {
      Authorization: `Bearer ${provider.apiToken}`,
      'Content-Type': 'application/json',
    },
  }).then((res) => res.data).catch((err) => {
    console.debug('err =', err.response?.data);
    return [];
  });

const deleteNote = async ({ provider, noteId }: { provider: TargetProvider, noteId: string; }) =>
  axios.post<void>(`${provider.apiEndpoint}/notes/delete`?.replace('//', '/'), {
    i: provider.adminApiToken,
    noteId,
  }, {
    headers: {
      Authorization: `Bearer ${provider.apiToken}`,
      'Content-Type': 'application/json',
    },
  }).then((res) => res.data).catch((err) => {
    console.debug('err =', err.response?.data);
    return [];
  });

export const execMisskey = async (provider: TargetProvider, spamTexts: string[], lastChecked: Date | null | undefined) => {

  // const offsetDate = dayjs((lastChecked ? dayjs(lastChecked)
  //   .add(-48, 'h') : null) ?? new Date(Date.now() - 48 * 60 * 60 * 1000));
  const offsetDate = dayjs(lastChecked ?? new Date(Date.now() - 48 * 60 * 60 * 1000));

  let sinceId: string | null | undefined;

  for (const _ of Array(999).fill(null)) {

    // eslint-disable-next-line no-loop-func
    const notifications = await retry(() => getNotifications({ provider, sinceId }));
    console.debug('notifications =', notifications);

    console.debug('[old] sinceId =', sinceId);
    sinceId = notifications[notifications.length - 1]?.id as string | null | undefined;
    console.debug('[new] sinceId =', sinceId);

    if (sinceId === null || sinceId === undefined) {
      console.debug('No more notifications');
      break;
    }

    if (notifications.every((notification) => dayjs(notification.createdAt).isBefore(offsetDate))) {
      console.debug('No more notifications');
      break;
    }

    for (const notification of notifications) {

      if (dayjs(notification.createdAt).isBefore(offsetDate)) {
        // eslint-disable-next-line no-continue
        continue;
      }

      // eslint-disable-next-line no-continue
      if (!notification.userId) continue;

      console.debug('------------------------------------------------------------------------------------');
      console.debug('notification.status.context =', notification?.note?.text);
      console.debug('notification?.note?.files =', notification?.note?.files);

      // Get image md5
      const imageMD5s = notification?.note?.files?.map((media) =>
        media.md5).filter((md5) => md5) ?? [];
      console.debug('md5 =', imageMD5s);

      try {
        const found = await spamTexts.some((spamText) =>
          // Check text
          notification.note?.text?.includes(spamText) ||
          // Check media url
          notification.note?.files?.some((media) => media.url?.includes(spamText)) ||
          // Check image md5
          imageMD5s.includes(spamText),
        );

        console.debug('found =', found);
        // eslint-disable-next-line no-continue
        if (!found) continue;

        // report target
        console.debug('[spam found] notification =', notification.note?.text);
        console.debug('notification.userId =', notification.userId);
        console.debug('notification.user?.id =', notification.user?.id);
        console.debug('notification.user?.name =', notification.user?.name);
        console.debug('notification.user?.username =', notification.user?.username);
        console.debug('notification.note?.id =', notification.note?.id);

        // Report spam ( When 200OK, no value is returned )
        console.debug('[reportAbuse] notification.userId =', notification.userId);
        await retry(() => reportAbuse({ provider, userId: notification.userId, comment: 'spam' }));

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

        // Delete note ( When 200OK, no value is returned )
        console.debug('[deleteNote] noteId =', notification.note?.id);
        await retry(() => deleteNote({ provider, noteId: notification.note?.id }));

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
