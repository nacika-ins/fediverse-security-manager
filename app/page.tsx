'use client';

import React from 'react';
import { SettingContainer } from '@/components/organisms/SettingContainer';

export default function Home() {
  return (
    <main className="relative py-6 lg:gap-10 lg:py-8">
      <div className="container flex-1">
        <SettingContainer />
      </div>
    </main>
  );
}
