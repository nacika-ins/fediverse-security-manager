import React, { FC } from 'react';
import { SettingsNav } from '@/components/molecules/SettingsNav';
import { Separator } from '@/components/ui/separator';

export const HomeContainer: FC = () => (
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
      <div className="flex-1 lg:max-w-2xl">Please select a menu</div>
    </div>
  </div>
);
