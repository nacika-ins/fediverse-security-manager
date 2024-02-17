'use client';

import { NextPage } from 'next';
import { SettingContainer } from '@/components/organisms/SettingContainer';
import React from 'react';
import { get, update } from '@/app/automatic-spam-reporting/actions';

const Page: NextPage = () => (
  <main className="relative py-6 lg:gap-10 lg:py-8">
    <div className="container flex-1">
      <SettingContainer update={update} get={get} />
    </div>
  </main>
);

export default Page;
