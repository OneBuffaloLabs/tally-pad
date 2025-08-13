'use client';

import Link from 'next/link';
import { logEvent } from '@/lib/analytics';

export const Header = () => {
  return (
    <header className='p-4 flex justify-between items-center sticky top-0 bg-background/80 backdrop-blur-sm z-50'>
      <Link
        href='/'
        onClick={() => logEvent('Navigation', 'Click', 'Logo Header')}
        className='text-xl font-bold text-primary hover:opacity-80 transition-opacity'>
        TallyPad
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
