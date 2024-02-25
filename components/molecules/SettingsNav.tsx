import { FC } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import Image from 'next/image';

const items = [
  {
    title: 'Automatic spam reporting',
    href: '/automatic-spam-reporting',
  },
  {
    title: 'Spam text list',
    href: '/spam-text-list',
  },
  {
    title: 'Domain block list',
    href: '/domain-block-list',
  },
  {
    title: 'Delayed server list',
    href: '/delayed-server-list',
  },
  {
    title: 'Support us on Patreon',
    href: 'https://www.patreon.com/nacika',
    icon: 'patreon',
  },
];

export const SettingsNav: FC = () => {
  const pathname = usePathname();

  return (
    <nav className={cn('flex flex-col')}>
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            buttonVariants({ variant: 'ghost' }),
            pathname === item.href
              ? 'bg-muted hover:bg-muted'
              : 'hover:bg-transparent hover:underline',
            'justify-start',
          )}
        >
          {item.title}
          {item.icon ? (
            <Image
              src="patreon.svg"
              className="m-1"
              alt="patreon"
              width={14}
              height={14}
            />
          ) : null}
        </Link>
      ))}
    </nav>
  );
};
