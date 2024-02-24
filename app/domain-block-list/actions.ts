'use server';

import { z } from 'zod';
import { formSchema } from '@/app/domain-block-list/formSchema';
import { targetProviderRepository } from '@/repositories/target-provider.repository';
import { createRestAPIClient } from 'masto';
import {
  getFederationInstances,
  removeFederationAllFollowing,
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
  }

  return {};
}

export async function removeDomainBlock(
  props: NonNullable<
    Pick<z.infer<typeof formSchema>, 'removeDomain'>
  >['removeDomain'],
) {
  console.debug('props =', props);
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

    const { id } = props;

    if (!id) {
      throw new Error('id is required');
    }

    await adminMasto?.v1.admin.domainBlocks.$select(id).remove();
  } else if (provider.providerType === 'misskey') {
    await updateFederationInstance({
      provider,
      host: domain,
      isSuspended: false,
    });
  }

  return {};
}

export async function get(): Promise<z.infer<typeof formSchema>> {
  return {
    targetProviderId: null,
    targetProviders: await Promise.all(
      (
        (await targetProviderRepository.getTargetProviders()).filter(
          (provider) => !provider.isReportOnly,
        ) ?? []
      ).map(async (provider) => {
        const adminMasto =
          provider.providerType === 'mastodon'
            ? createRestAPIClient({
                url: provider.apiEndpoint,
                accessToken: provider.adminApiToken,
              })
            : null;

        const domains =
          (provider.providerType === 'mastodon'
            ? await adminMasto?.v1.admin.domainBlocks
                .list({ limit: 9999 })
                .then((res) =>
                  res
                    .map((domainBlock) => ({
                      name: domainBlock.domain,
                      id: domainBlock.id,
                    }))
                    .sort((a, b) => a.id.localeCompare(b.id)),
                )
            : provider.providerType === 'misskey'
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
              : []) ?? [];

        return {
          ...provider,
          providerType: provider.providerType as 'mastodon' | 'misskey',
          blockDomains: domains,
        };
      }),
    ),
  };
}
