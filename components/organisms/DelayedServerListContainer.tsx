import React, { FC, PropsWithChildren } from 'react';
import { SettingsNav } from '@/components/molecules/SettingsNav';

import { cn } from '@/lib/utils';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { addDomainBlock, get } from '@/app/delayed-server-list/actions';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import useSWR from 'swr';
import { ConfirmModal } from '@/components/molecules/ConfirmModal';
import { SearchIcon } from 'lucide-react';

export const DelayedServerListContainer: FC<
  {
    addDomainBlock: typeof addDomainBlock;
    get: typeof get;
  } & PropsWithChildren
> = ({ addDomainBlock, get }) => {
  const {
    data,
    mutate,
    isLoading: loading,
  } = useSWR('targetProviders', get, {
    refreshInterval: 10000,
  });

  return (
    <div className="hidden space-y-6 p-10 pb-16 md:block">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Automated anti-spam settings</p>
      </div>
      <Separator className="my-6" />
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="-mx-4 lg:w-1/5">
          <SettingsNav />
        </aside>
        <div className="flex-1 lg:max-w-2xl">
          {loading ? (
            <div className="flex flex-col space-y-3">
              <Skeleton className="h-[125px] w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              {data?.targetProviders.map((field, index) => (
                // eslint-disable-next-line react/no-array-index-key
                <Card
                  key={`targetProviders.${index}`}
                  className={cn('w-full', 'relative')}
                >
                  <CardHeader>
                    <CardTitle>
                      # {index + 1} {field.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-auto">Domain</TableHead>
                            <TableHead className="w-[100px]">Queue</TableHead>
                            <TableHead className="w-[100px]">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {field.delayedServers?.map((domain, index) => (
                            <TableRow key={domain.name}>
                              <TableCell>
                                <div className="flex gap-1 items-center">
                                  <a
                                    className="hover:underline"
                                    href={`https://${domain.name}`}
                                    rel="nofollow noopener noreferrer"
                                    target="_blank"
                                  >
                                    {domain.name}
                                  </a>

                                  <a
                                    className="hover:text-gray-500"
                                    href={`https://www.google.com/search?q=${domain.name}`}
                                    rel="nofollow noopener noreferrer"
                                    target="_blank"
                                  >
                                    <SearchIcon className="w-4 h-4" />
                                  </a>
                                </div>
                              </TableCell>
                              <TableCell>{domain.queue}</TableCell>
                              <TableCell>
                                {domain.isBlocked ? null : (
                                  <ConfirmModal
                                    buttonTitle="Block"
                                    title="Add to Domain Block"
                                    description="If the server is down or very slow, blocking the domain will reduce the load. However, please
                                  note that communication with the server you block will be impossible and your followers will be removed."
                                    submitButtonTitle="Block"
                                    onSubmit={async () => {
                                      const result = await addDomainBlock({
                                        domain: domain.name,
                                        targetProviderId: field.id,
                                      });
                                      console.debug('result =', result);
                                      await mutate();
                                    }}
                                  />
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
