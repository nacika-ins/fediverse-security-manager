'use client';

import { NextPage } from 'next';
import React from 'react';
import { addDomainBlock, get } from '@/app/delayed-server-list/actions';
import { DelayedServerListContainer } from '@/components/organisms/DelayedServerListContainer';

const Page: NextPage = () => (
  <main className="relative py-6 lg:gap-10 lg:py-8">
    <div className="container flex-1">
      <DelayedServerListContainer get={get} addDomainBlock={addDomainBlock} />
    </div>
  </main>
);

export default Page;
