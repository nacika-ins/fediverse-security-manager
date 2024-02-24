import { TargetProvider } from '@prisma/client';
import axios from 'axios';
import { MisskeyNotes } from '@/features/vendorApis/misskey/response/misskey-notes';
import dayjs from 'dayjs';
import { MisskeyNotifications } from '@/features/vendorApis/misskey/response/misskey-notification';
import { MisskeyReport } from '@/features/vendorApis/misskey/response/misskey-report';
import { FederationInstance } from '@/features/vendorApis/misskey/response/misskey-federation-instance';

export const getGlobalTimeline = async ({
  provider,
  untilId,
}: {
  provider: TargetProvider;
  untilId: string | undefined | null;
}) =>
  axios
    .post<MisskeyNotes>(
      `${provider.apiEndpoint}/notes/global-timeline`?.replace('//', '/'),
      {
        i: provider.apiToken,
        limit: 40,
        untilId,
      },
      {
        headers: {
          Authorization: `Bearer ${provider.apiToken}`,
          'Content-Type': 'application/json',
        },
      },
    )
    .then((res) =>
      res.data.sort(
        (
          a: { createdAt: string },
          b: {
            createdAt: string;
          },
        ) => (dayjs(a.createdAt).isBefore(dayjs(b.createdAt)) ? 1 : -1),
      ),
    )
    .catch((err) => {
      console.debug('err =', err.response?.data);
      return [] as MisskeyNotes;
    });
export const getNotifications = async ({
  provider,
  untilId,
}: {
  provider: TargetProvider;
  untilId: string | undefined | null;
}) =>
  axios
    .post<MisskeyNotifications>(
      `${provider.apiEndpoint}/i/notifications`?.replace('//', '/'),
      {
        i: provider.apiToken,
        limit: 40,
        unreadOnly: false,
        markAsRead: true,
        includeTypes: ['mention', 'reply'],
        excludeTypes: ['follow'],
        untilId,
      },
      {
        headers: {
          Authorization: `Bearer ${provider.apiToken}`,
          'Content-Type': 'application/json',
        },
      },
    )
    .then((res) =>
      res.data.sort(
        (
          a: { createdAt: string },
          b: {
            createdAt: string;
          },
        ) => (dayjs(a.createdAt).isBefore(dayjs(b.createdAt)) ? 1 : -1),
      ),
    )
    .catch((err) => {
      console.debug('err =', err.response?.data);
      return [];
    });
export const reportAbuse = async ({
  provider,
  userId,
  comment,
}: {
  provider: TargetProvider;
  userId: string;
  comment: string;
}) =>
  axios
    .post<void>(
      `${provider.apiEndpoint}/users/report-abuse`?.replace('//', '/'),
      {
        i: provider.apiToken,
        userId,
        comment,
      },
      {
        headers: {
          Authorization: `Bearer ${provider.apiToken}`,
          'Content-Type': 'application/json',
        },
      },
    )
    .then((res) => res.data)
    .catch((err) => {
      console.debug('err =', err.response?.data);
      return [];
    });
export const resolveAbuseUserReport = async ({
  provider,
  reportId,
}: {
  provider: TargetProvider;
  reportId: string;
}) =>
  axios
    .post<void>(
      `${provider.apiEndpoint}/admin/resolve-abuse-user-report`?.replace(
        '//',
        '/',
      ),
      {
        i: provider.adminApiToken,
        reportId,
        forward: true,
      },
      {
        headers: {
          Authorization: `Bearer ${provider.apiToken}`,
          'Content-Type': 'application/json',
        },
      },
    )
    .then((res) => res.data)
    .catch((err) => {
      console.debug('err =', err.response?.data);
      return [];
    });
export const abuseUserReports = async ({
  provider,
}: {
  provider: TargetProvider;
}) =>
  axios
    .post<MisskeyReport[]>(
      `${provider.apiEndpoint}/admin/abuse-user-reports`?.replace('//', '/'),
      {
        i: provider.adminApiToken,
        limit: 1,
      },
      {
        headers: {
          Authorization: `Bearer ${provider.apiToken}`,
          'Content-Type': 'application/json',
        },
      },
    )
    .then((res) => res.data)
    .catch((err) => {
      console.debug('err =', err.response?.data);
      return [];
    });
export const suspendUser = async ({
  provider,
  userId,
}: {
  provider: TargetProvider;
  userId: string;
}) =>
  axios
    .post<void>(
      `${provider.apiEndpoint}/admin/suspend-user`?.replace('//', '/'),
      {
        i: provider.adminApiToken,
        userId,
      },
      {
        headers: {
          Authorization: `Bearer ${provider.apiToken}`,
          'Content-Type': 'application/json',
        },
      },
    )
    .then((res) => res.data)
    .catch((err) => {
      console.debug('err =', err.response?.data);
      return [];
    });
export const deleteNote = async ({
  provider,
  noteId,
}: {
  provider: TargetProvider;
  noteId: string;
}) =>
  axios
    .post<void>(
      `${provider.apiEndpoint}/notes/delete`?.replace('//', '/'),
      {
        i: provider.adminApiToken,
        noteId,
      },
      {
        headers: {
          Authorization: `Bearer ${provider.apiToken}`,
          'Content-Type': 'application/json',
        },
      },
    )
    .then((res) => res.data)
    .catch((err) => {
      console.debug('err =', err.response?.data);
      return [];
    });

export const getFederationInstances = async ({
  provider,
  host,
  blocked,
  notResponding,
  suspended,
  federating,
  subscribing,
  publishing,
  limit,
  offset,
  sort,
}: {
  provider: TargetProvider;
  host?: string;
  blocked?: boolean;
  notResponding?: boolean;
  suspended?: boolean;
  federating?: boolean;
  subscribing?: boolean;
  publishing?: boolean;
  limit?: number;
  offset?: number;
  sort: string;
}) =>
  axios
    .post<FederationInstance[]>(
      `${provider.apiEndpoint}/federation/instances`?.replace('//', '/'),
      {
        i: provider.adminApiToken,
        host,
        blocked,
        notResponding,
        suspended,
        federating,
        subscribing,
        publishing,
        limit,
        offset,
        sort,
      },
      {
        headers: {
          Authorization: `Bearer ${provider.apiToken}`,
          'Content-Type': 'application/json',
        },
      },
    )
    .then((res) => res.data)
    .catch((err) => {
      console.debug('err =', err.response?.data);
      return [];
    });

export const updateFederationInstance = async ({
  provider,
  host,
  isSuspended,
}: {
  provider: TargetProvider;
  host: string;
  isSuspended: boolean;
}) =>
  axios
    .post<void>(
      `${provider.apiEndpoint}/admin/federation/update-instance`?.replace(
        '//',
        '/',
      ),
      {
        i: provider.adminApiToken,
        host,
        isSuspended,
      },
      {
        headers: {
          Authorization: `Bearer ${provider.apiToken}`,
          'Content-Type': 'application/json',
        },
      },
    )
    .then((res) => res.data)
    .catch((err) => {
      console.debug('err =', err.response?.data);
      return [];
    });

export const removeFederationAllFollowing = async ({
  provider,
  host,
}: {
  provider: TargetProvider;
  host: string;
}) =>
  axios
    .post<void>(
      `${provider.apiEndpoint}/admin/federation/remove-all-following`?.replace(
        '//',
        '/',
      ),
      {
        i: provider.adminApiToken,
        host,
      },
      {
        headers: {
          Authorization: `Bearer ${provider.apiToken}`,
          'Content-Type': 'application/json',
        },
      },
    )
    .then((res) => res.data)
    .catch((err) => {
      console.debug('err =', err.response?.data);
      return [];
    });
