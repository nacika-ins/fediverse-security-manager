'use server';

import { z } from 'zod';
import { formSchema } from '@/app/delayed-server-list/formSchema';
import { targetProviderRepository } from '@/repositories/target-provider.repository';
import { createRestAPIClient } from 'masto';
import {
  getAdminQueueDeliverDelayed,
  getAdminQueueInboxDelayed,
  getblockedHostsOfMeta,
  getFederationInstances,
  removeFederationAllFollowing,
  updateblockedHostsOfMeta,
  updateFederationInstance,
} from '@/features/vendorApis/misskey';

export async function addDomainBlock(
  props: NonNullable<
    Pick<z.infer<typeof formSchema>, 'addDomain'>
  >['addDomain'],
) {
  if (!props) {
    throw new Error('props is required');
  }
  const { domain, targetProviderId } = props;

  if (!domain) {
    throw new Error('domain is required');
  }

  if (!targetProviderId) {
    throw new Error('targetProviderId is required');
  }

  const provider =
    await targetProviderRepository.getTargetProvider(targetProviderId);

  if (!provider) {
    throw new Error('provider not found');
  }

  if (provider.providerType === 'mastodon') {
    const adminMasto = createRestAPIClient({
      url: provider.apiEndpoint,
      accessToken: provider.adminApiToken,
    });

    await adminMasto?.v1.admin.domainBlocks.create({
      domain,
      severity: 'suspend',
    });
  } else if (provider.providerType === 'misskey') {
    await updateFederationInstance({
      provider,
      host: domain,
      isSuspended: true,
    });
    await removeFederationAllFollowing({
      provider,
      host: domain,
    });
    const blockedHosts = await getblockedHostsOfMeta({
      provider,
    });
    if (!blockedHosts.includes(domain)) {
      await updateblockedHostsOfMeta({
        provider,
        blockedHosts: Array.from(new Set([...blockedHosts, domain]).values()),
      });
    }
  }

  return {};
}

export async function get(): Promise<z.infer<typeof formSchema>> {
  return {
    targetProviderId: null,
    targetProviders: await Promise.all(
      (
        (await targetProviderRepository.getTargetProviders()).filter(
          (provider) =>
            !provider.isReportOnly && provider.providerType !== 'mastodon',
        ) ?? []
      ).map(async (provider) => {
        // noinspection JSUnusedLocalSymbols
        // eslint-disable-next-line no-unused-vars
        const adminMasto =
          provider.providerType === 'mastodon'
            ? createRestAPIClient({
                url: provider.apiEndpoint,
                accessToken: provider.adminApiToken,
              })
            : null;

        const blockedHosts =
          provider.providerType === 'misskey'
            ? await getFederationInstances({
                provider,
                suspended: true,
                sort: '+pubSub',
                limit: 100,
              }).then((res) =>
                res.map((instance) => ({
                  name: instance.host,
                  id: instance.id,
                })),
              )
            : [];

        const domains =
          provider.providerType === 'mastodon'
            ? [] // API does not exist.
            : provider.providerType === 'misskey'
              ? Array.from(
                  [
                    (await getAdminQueueInboxDelayed({
                      provider,
                    }).then((res) =>
                      res.map((instance) => ({
                        name: instance[0],
                        queue: instance[1],
                        isBlocked:
                          blockedHosts?.some(
                            (domain) => domain.name === instance[0],
                          ) ?? false,
                      })),
                    )) ?? [],
                    (await getAdminQueueDeliverDelayed({
                      provider,
                    }).then((res) =>
                      res.map((instance) => ({
                        name: instance[0],
                        queue: instance[1],
                        isBlocked:
                          blockedHosts?.some(
                            (domain) => domain.name === instance[0],
                          ) ?? false,
                      })),
                    )) ?? [],
                  ]
                    .flat()
                    .reduce<
                      { name: string; queue: number; isBlocked: boolean }[]
                    >((acc, cur) => {
                      const domain = acc.find(
                        (domain) => domain.name === cur.name,
                      );
                      if (domain) {
                        domain.queue += cur.queue;
                      } else {
                        acc.push(cur);
                      }
                      return acc;
                    }, [])
                    .sort((a, b) => b.queue - a.queue),
                )
              : [];

        return {
          ...provider,
          providerType: provider.providerType as 'mastodon' | 'misskey',
          delayedServers: domains,
        };
      }),
    ),
  };
}
