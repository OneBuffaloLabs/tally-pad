'use client';

import Link from 'next/link';
import { logEvent } from '@/lib/analytics';

export const Footer = () => {
  const startYear = 2025;
  const currentYear = new Date().getFullYear();
  const yearDisplay = startYear === currentYear ? startYear : `${startYear} - ${currentYear}`;

  return (
    <footer className='text-center p-8 text-foreground/50'>
      <div className='flex justify-center gap-4 mb-4'>
        <Link
          href='/privacy'
          onClick={() => logEvent('Navigation', 'Click', 'Privacy Policy Footer')}
          className='text-sm hover:text-primary transition-colors'>
          Privacy Policy
        </Link>
        <span className='text-foreground/30'>|</span>
        <Link
          href='/terms'
          onClick={() => logEvent('Navigation', 'Click', 'Terms of Service Footer')}
          className='text-sm hover:text-primary transition-colors'>
          Terms of Service
        </Link>
      </div>
      <p className='text-sm'>&copy; {yearDisplay} TallyPad. An Open Source Project.</p>
      <p className='text-xs mt-2'>
        A{' '}
        <a
          href='https://onebuffalolabs.com'
          target='_blank'
          rel='noopener noreferrer'
          onClick={() => logEvent('Navigation', 'Click', 'One Buffalo Labs Footer')}
          className='font-semibold hover:text-primary transition-colors'>
          One Buffalo Labs
        </a>{' '}
        Project
      </p>
    </footer>
  );
};
