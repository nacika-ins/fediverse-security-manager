import React, { FC, PropsWithChildren, useLayoutEffect, useState } from 'react';
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
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Cross1Icon } from '@radix-ui/react-icons';
import { getSpamTexts, saveSpamTexts } from '@/app/spam-text-list/actions';
import { Skeleton } from '@/components/ui/skeleton';

const profileFormSchema = z.object({
  spamTexts: z
    .array(
      z.object({
        value: z.string().min(1, 'Please enter a spam text'),
      }),
    )
    .optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

// This can come from your database or API.
const defaultValues: Partial<ProfileFormValues> = {
  spamTexts: [],
};

export const SpamTextListContainer: FC<{
  update: typeof saveSpamTexts;
  get: typeof getSpamTexts
} & PropsWithChildren> = ({ update, get }) => {

  const [loading, setLoading] = useState(true);
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: 'onChange',
  });
  const { reset } = form;

  const { fields, append, remove } = useFieldArray({
    name: 'spamTexts',
    control: form.control,
  });

  const onSubmit = async (data: ProfileFormValues) => {
    await update(data.spamTexts?.map((spamText) => spamText.value) ?? []);
    toast({
      title: 'Updated spam texts',
      duration: 2000,
      variant: 'default',
    });
  };

  useLayoutEffect(() => {
    setLoading(true);
    get().then((spamTexts) => {
      reset({ spamTexts: spamTexts.map((value) => ({ value })) });
      setLoading(false);
    });
  }, [get, reset]);

  return (
    <div className="space-y-6 py-4 px-10 pb-16 block">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Automated anti-spam settings are available.

        </p>
      </div>
      <Separator className="my-6" />
      <div className="flex flex-col space-y-8 md:flex-row md:space-x-12 md:space-y-0">
        <aside className="-mx-4 md:w-[200px] hidden md:block">
          <SettingsNav />
        </aside>
        <div className="flex-1 md:max-w-2xl">

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
                <div>
                  {fields.map((field, index) => (
                    <FormField
                      control={form.control}
                      key={field.id}
                      name={`spamTexts.${index}.value`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={cn(index !== 0 && 'sr-only')}>
                            Spam texts
                          </FormLabel>
                          <FormDescription
                            className={cn(index !== 0 && 'sr-only')}
                          >
                            Please enter spam text to match
                          </FormDescription>
                          <FormControl>
                            <div className="relative">
                              <Textarea {...field} />
                              <div className="absolute -right-12 -top-0">
                                <Button variant="ghost" size="icon" onClick={() => remove(index)}>
                                  <Cross1Icon className="w-4 h-4 text-gray-400" />
                                </Button>

                              </div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => append({ value: '' })}
                    >
                      Add spam text
                    </Button>
                  </div>

                </div>

                <Button type="submit">Update</Button>
              </form>
            </Form>
          )}
        </div>
      </div>
    </div>
  );
};
