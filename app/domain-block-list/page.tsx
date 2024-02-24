'use client';

import { NextPage } from 'next';
import React from 'react';
import { DomainBlockListContainer } from '@/components/organisms/DomainBlockListContainer';
import {
  addDomainBlock,
  get,
  removeDomainBlock,
} from '@/app/domain-block-list/actions';

const Page: NextPage = () => (
  <main className="relative py-6 lg:gap-10 lg:py-8">
    <div className="container flex-1">
      <DomainBlockListContainer
        get={get}
        addDomainBlock={addDomainBlock}
        removeDomainBlock={removeDomainBlock}
      />
    </div>
  </main>
);

export default Page;
