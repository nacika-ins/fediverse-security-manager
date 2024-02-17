'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import { MenuButton } from '@/components/atoms/MenuButton';
import { MobileNav } from '@/components/organisms/MobileNav';
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [open, setOpen] = useState(false);

  return (
    <html lang="en">
      <body
        className={cn(
          inter.className,
          'min-h-screen bg-background font-serif antialiased',
        )}
      >
        <div className="relative flex min-h-screen flex-col bg-background">
          <header className="sticky top-0 z-50 w-full border-b border-border/40 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 max-w-screen-2xl items-center">
              <MobileNav open={open} setOpen={setOpen} />
              <div className="flex md:hidden mr-2">
                <MenuButton open={open} setOpen={setOpen} />
              </div>
              <div className="mr-4 flex items-center">
                <a href="/" className="text-xl font-bold mr-8">
                  Fediverse Security Manager
                </a>
                <nav className="items-center text-sm font-medium hidden md:flex">
                  <a
                    href="https://github.com/nacika-ins/fediverse-security-manager"
                    target="_blank"
                    rel="noreferrer"
                  >
                    GitHub
                  </a>
                </nav>
              </div>
            </div>
          </header>
          {children}
          <Toaster />
        </div>
      </body>
    </html>
  );
}
