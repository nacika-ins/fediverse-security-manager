import React, { FC, PropsWithChildren } from 'react';
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
  spamTexts: [
    { value: 'https://shadcn.com' },
    { value: 'http://twitter.com/shadcn' },
  ],
};

export const SpamTextListContainer: FC<PropsWithChildren> = () => {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: 'onChange',
  });

  const { fields, append, remove } = useFieldArray({
    name: 'spamTexts',
    control: form.control,
  });

  function onSubmit(data: ProfileFormValues) {
    toast({
      title: 'You submitted the following values:',
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
  };

  return (
    <div className="space-y-6 p-10 pb-16 block">
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
        </div>
      </div>
    </div>
  );
};
