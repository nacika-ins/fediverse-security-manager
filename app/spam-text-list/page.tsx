'use client';

import { NextPage } from 'next';
import React from 'react';
import { SpamTextListContainer } from '@/components/organisms/SpamTextListContainer';
import { saveSpamTexts, getSpamTexts } from '@/app/spam-text-list/actions';

const Page: NextPage = () => (
    <main className="relative py-6 lg:gap-10 lg:py-8">
      <div className="container flex-1">
        <SpamTextListContainer update={saveSpamTexts} get={getSpamTexts} />
      </div>
    </main>
  );

export default Page;
