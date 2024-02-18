import React, { FC, PropsWithChildren, useCallback, useLayoutEffect, useState } from 'react';
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

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Switch } from '@/components/ui/switch';

import Link from 'next/link';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Cross1Icon, RocketIcon } from '@radix-ui/react-icons';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formSchema } from '@/app/automatic-spam-reporting/formSchema';
import { get, update } from '@/app/automatic-spam-reporting/actions';
import { Skeleton } from '@/components/ui/skeleton';

type FormValues = z.infer<typeof formSchema>;

// This can come from your database or API.
const defaultValues: Partial<FormValues> = {
  serviceFlag: {
    automaticSpamReporting: false,
  },
  targetProviders: [],
};

export const SettingContainer: FC<{ update: typeof update; get: typeof get } & PropsWithChildren> = ({ update, get }) => {

  const [loading, setLoading] = useState(true);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: 'onChange',
  });

  const onSubmit = useCallback(async (data: FormValues) => {
    await update(data).catch((error) => {
      toast({
        title: 'Failed to update',
        duration: 2000,
        variant: 'destructive',
      });
    }).then(() => {
      toast({
        title: 'Updated',
        duration: 2000,
        variant: 'default',
      });
    });
  }, [update]);

  useLayoutEffect(() => {
    setLoading(true);
    get().then((data) => {
      form.reset(data);
    }).finally(() => {
      setLoading(false);
    });

  }, [form, get]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'targetProviders',
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

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                <FormField
                  control={form.control}
                  name="serviceFlag.automaticSpamReporting"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Enable automatic spam reporting</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Switch onCheckedChange={field.onChange} checked={field.value} /> Enable
                        </div>
                      </FormControl>
                      <FormDescription>
                        If this feature is enabled, the system will periodically patrol
                        the notification timeline and automatically report any spam and automatically resolve the
                        spam.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <h2 className="font-bold">Target providers</h2>
                <div className="flex flex-col gap-8">
                  {fields.map((field, index) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <Card key={`targetProviders.${index}`} className={cn('w-full', 'relative')}>
                      <CardHeader>
                        <CardTitle># {index + 1}</CardTitle>
                      </CardHeader>
                      <CardContent className="grid gap-4">
                        <div>
                          <div className=" flex items-center space-x-4 rounded-md border p-4 mb-4">
                            <RocketIcon />
                            <div className="flex-1 space-y-1">
                              <p className="text-sm font-medium leading-none">
                                Enable
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Monitor the timeline.
                              </p>
                            </div>
                            <FormField
                              control={form.control}
                              name={`targetProviders.${index}.enabled`}
                              render={({ field }) => (
                                <Switch onCheckedChange={field.onChange} checked={field.value} />
                              )}
                            />
                          </div>
                          <div>
                            <FormField
                              control={form.control}
                              name={`targetProviders.${index}.name`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>
                                    Service name
                                  </FormLabel>
                                  <FormDescription>
                                    Please enter the name of the service
                                  </FormDescription>
                                  <FormControl>
                                    <div className="relative">
                                      <Input {...field} />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        <div>
                          <FormField
                            control={form.control}
                            name={`targetProviders.${index}.providerType`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  Provider type
                                </FormLabel>
                                <FormDescription>
                                  Please select your provider type
                                </FormDescription>
                                <FormControl>
                                  <div className="relative">
                                    <Select {...field} onValueChange={field.onChange}>
                                      <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Provider" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="mastodon">Mastodon</SelectItem>
                                        <SelectItem value="misskey">Misskey</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div>
                          <FormField
                            control={form.control}
                            name={`targetProviders.${index}.apiEndpoint`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  API endpoint
                                </FormLabel>
                                <FormDescription>
                                  Please enter an API endpoint
                                </FormDescription>
                                <FormControl>
                                  <div className="relative">
                                    <Input {...field} />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div>
                          <FormField
                            control={form.control}
                            name={`targetProviders.${index}.apiToken`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  Reporter API token
                                </FormLabel>
                                <FormDescription>
                                  Please enter an Reporter API token
                                </FormDescription>
                                <FormControl>
                                  <div className="relative">
                                    <Input {...field} />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div>
                          <FormField
                            control={form.control}
                            name={`targetProviders.${index}.adminApiToken`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  Admin API token
                                </FormLabel>
                                <FormDescription>
                                  Please enter an Admin API token
                                </FormDescription>
                                <FormControl>
                                  <div className="relative">
                                    <Input {...field} />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                      </CardContent>
                      <div className="absolute right-1 top-1">
                        <Button variant="ghost" size="icon" onClick={() => remove(index)}>
                          <Cross1Icon className="w-4 h-4 text-gray-400" />
                        </Button>
                      </div>
                    </Card>

                  ))}
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => append({
                        apiEndpoint: '',
                        apiToken: '',
                        enabled: true,
                        name: '',
                        providerType: 'mastodon',
                        adminApiToken: '',
                      })}
                    >
                      Add provider
                    </Button>
                  </div>

                </div>

                {/* <FormField */}
                {/*  control={form.control} */}
                {/*  name="email" */}
                {/*  render={({ field }) => ( */}
                {/*    <FormItem> */}
                {/*      <FormLabel>Email</FormLabel> */}
                {/*      <Select */}
                {/*        onValueChange={field.onChange} */}
                {/*        defaultValue={field.value} */}
                {/*      > */}
                {/*        <FormControl> */}
                {/*          <SelectTrigger> */}
                {/*            <SelectValue placeholder="Select a verified email to display" /> */}
                {/*          </SelectTrigger> */}
                {/*        </FormControl> */}
                {/*        <SelectContent> */}
                {/*          <SelectItem value="m@example.com"> */}
                {/*            m@example.com */}
                {/*          </SelectItem> */}
                {/*          <SelectItem value="m@google.com"> */}
                {/*            m@google.com */}
                {/*          </SelectItem> */}
                {/*          <SelectItem value="m@support.com"> */}
                {/*            m@support.com */}
                {/*          </SelectItem> */}
                {/*        </SelectContent> */}
                {/*      </Select> */}
                {/*      <FormDescription> */}
                {/*        You can manage verified email addresses in your{' '} */}
                {/*        <Link href="/examples/forms">email settings</Link>. */}
                {/*      </FormDescription> */}
                {/*      <FormMessage /> */}
                {/*    </FormItem> */}
                {/*  )} */}
                {/* /> */}
                {/* <FormField */}
                {/*  control={form.control} */}
                {/*  name="bio" */}
                {/*  render={({ field }) => ( */}
                {/*    <FormItem> */}
                {/*      <FormLabel>Bio</FormLabel> */}
                {/*      <FormControl> */}
                {/*        <Textarea */}
                {/*          placeholder="Tell us a little bit about yourself" */}
                {/*          className="resize-none" */}
                {/*          {...field} */}
                {/*        /> */}
                {/*      </FormControl> */}
                {/*      <FormDescription> */}
                {/*        You can <span>@mention</span> other users and */}
                {/*        organizations to link to them. */}
                {/*      </FormDescription> */}
                {/*      <FormMessage /> */}
                {/*    </FormItem> */}
                {/*  )} */}
                {/* /> */}
                {/* <div> */}
                {/*  {fields.map((field, index) => ( */}
                {/*    <FormField */}
                {/*      control={form.control} */}
                {/*      key={field.id} */}
                {/*      name={`urls.${index}.value`} */}
                {/*      render={({ field }) => ( */}
                {/*        <FormItem> */}
                {/*          <FormLabel className={cn(index !== 0 && 'sr-only')}> */}
                {/*            URLs */}
                {/*          </FormLabel> */}
                {/*          <FormDescription */}
                {/*            className={cn(index !== 0 && 'sr-only')} */}
                {/*          > */}
                {/*            Add links to your website, blog, or social media */}
                {/*            profiles. */}
                {/*          </FormDescription> */}
                {/*          <FormControl> */}
                {/*            <Input {...field} /> */}
                {/*          </FormControl> */}
                {/*          <FormMessage /> */}
                {/*        </FormItem> */}
                {/*      )} */}
                {/*    /> */}
                {/*  ))} */}
                {/*  <Button */}
                {/*    type="button" */}
                {/*    variant="outline" */}
                {/*    size="sm" */}
                {/*    className="mt-2" */}
                {/*    onClick={() => append({ value: '' })} */}
                {/*  > */}
                {/*    Add URL */}
                {/*  </Button> */}
                {/* </div> */}
                <Button type="submit">Update</Button>
              </form>
            </Form>
          )}
        </div>
      </div>
    </div>
  );
};
