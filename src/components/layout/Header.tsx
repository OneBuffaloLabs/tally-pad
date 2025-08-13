'use client';

import Link from 'next/link';
import Image from 'next/image'; // Import the Next.js Image component
import { logEvent } from '@/lib/analytics';

export const Header = () => {
  return (
    <header className='p-4 flex justify-between items-center sticky top-0 bg-background/80 backdrop-blur-sm z-50 border-b border-border'>
      <Link
        href='/'
        onClick={() => logEvent('Navigation', 'Click', 'Logo Header')}
        className='flex items-center gap-2 text-xl font-bold text-primary hover:opacity-80 transition-opacity'>
        <Image
          src='/assets/logos/tally-pad.svg'
          alt='TallyPad Logo'
          width={40}
          height={40}
          className='h-10 w-10' // Control responsive size
        />
        <span>TallyPad</span>
      </Link>
      <Link
        href='/app'
        onClick={() => logEvent('Navigation', 'Click', 'Launch App Header')}
        className='bg-primary/10 text-primary font-semibold px-4 py-2 rounded-full text-sm hover:bg-primary/20 transition-colors'>
        Launch App
      </Link>
    </header>
  );
};
