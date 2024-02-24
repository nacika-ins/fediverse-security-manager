import React, {
  FC,
  PropsWithChildren,
  useCallback,
  useLayoutEffect,
  useState,
} from 'react';
import { SettingsNav } from '@/components/molecules/SettingsNav';
import { useFieldArray, useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Cross1Icon, RocketIcon } from '@radix-ui/react-icons';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  get,
  addDomainBlock,
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

type FormValues = z.infer<typeof formSchema>;

// This can come from your database or API.
const defaultValues: Partial<FormValues> = {
  targetProviderId: null,
};

export const DomainBlockListContainer: FC<
  {
    addDomainBlock: typeof addDomainBlock;
    removeDomainBlock: typeof removeDomainBlock;
    get: typeof get;
  } & PropsWithChildren
> = ({ removeDomainBlock, addDomainBlock, get }) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: 'onChange',
  });

  const { data, mutate, isLoading: loading } = useSWR('targetProviders', get);

  useLayoutEffect(() => {
    if (!data) return;
    form.reset(data);
  }, [data, form]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'targetProviders',
    keyName: '_id',
  });

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
              {fields.map((field, index) => (
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
