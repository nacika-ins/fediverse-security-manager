'use client';

import { NextPage } from 'next';
import React from 'react';
import { HomeContainer } from '@/components/organisms/HomeContainer';

const Page: NextPage = () => (
  <main className="relative py-6 lg:gap-10 lg:py-8">
    <div className="container flex-1">
      <HomeContainer />
    </div>
  </main>
);

export default Page;
