import React, {
  FC,
  PropsWithChildren,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import { SettingsNav } from '@/components/molecules/SettingsNav';
import { useFieldArray, useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from '@/lib/utils';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Cross1Icon } from '@radix-ui/react-icons';
import {
  addDomainBlock,
  get,
  removeDomainBlock,
} from '@/app/domain-block-list/actions';
import { Skeleton } from '@/components/ui/skeleton';
import { formSchema } from '@/app/domain-block-list/formSchema';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AddInputModal } from '@/components/molecules/AddInputModal';
import useSWR from 'swr';

export const DomainBlockListContainer: FC<
  {
    addDomainBlock: typeof addDomainBlock;
    removeDomainBlock: typeof removeDomainBlock;
    get: typeof get;
  } & PropsWithChildren
> = ({ removeDomainBlock, addDomainBlock, get }) => {
  const { data, mutate, isLoading: loading } = useSWR('targetProviders', get);

  return (
    <div className="hidden space-y-6 p-10 pb-16 md:block">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Automated anti-spam settings are available.
        </p>
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
                            <TableHead className="w-[100px]">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {field.blockDomains?.map((blockDomain, index) => (
                            <TableRow key={blockDomain.name}>
                              <TableCell>{blockDomain.name}</TableCell>
                              <TableCell>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={async () => {
                                    const result = await removeDomainBlock({
                                      id: blockDomain.id,
                                      domain: blockDomain.name,
                                      targetProviderId: field.id,
                                    });
                                    console.debug('result =', result);
                                    await mutate();
                                  }}
                                >
                                  <Cross1Icon />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>

                      <div className="mt-2">
                        <AddInputModal
                          buttonTitle="Add domain"
                          title="Adding domains to be blocked"
                          description="Add the domain you wish to block. Followers and followers will be removed upon addition."
                          submitButtonTitle="Add"
                          onSubmit={async (data) => {
                            const result = await addDomainBlock({
                              domain: data.value,
                              targetProviderId: field.id,
                            });
                            console.debug('result =', result);
                            await mutate();
                          }}
                        />
                      </div>
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
