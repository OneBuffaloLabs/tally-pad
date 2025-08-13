'use client';

import Link from 'next/link';
import { logEvent } from '@/lib/analytics';

export const Footer = () => {
  const startYear = 2025;
  const currentYear = new Date().getFullYear();
  const yearDisplay = startYear === currentYear ? startYear : `${startYear} - ${currentYear}`;

  return (
    <footer className='border-t border-border text-foreground/60'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4'>
        {/* Left Side: Copyright and Project Info */}
        <div className='text-center md:text-left'>
          <p className='text-sm'>&copy; {yearDisplay} TallyPad. An Open Source Project.</p>
          <p className='text-xs mt-1'>
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
        </div>

        {/* Right Side: Legal Links */}
        <div className='flex items-center gap-4'>
          <Link
            href='/privacy'
            onClick={() => logEvent('Navigation', 'Click', 'Privacy Policy Footer')}
            className='text-sm hover:text-primary transition-colors'>
            Privacy Policy
          </Link>
          <span className='text-foreground/20'>|</span>
          <Link
            href='/terms'
            onClick={() => logEvent('Navigation', 'Click', 'Terms of Service Footer')}
            className='text-sm hover:text-primary transition-colors'>
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
};
