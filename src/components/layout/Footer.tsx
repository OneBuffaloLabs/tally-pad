'use client';

import Link from 'next/link';
import { logEvent } from '@/lib/analytics';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';

export const Footer = () => {
  const startYear = 2025;
  const currentYear = new Date().getFullYear();
  const yearDisplay = startYear === currentYear ? startYear : `${startYear} - ${currentYear}`;

  return (
    <footer className='border-t border-border text-foreground/60 bg-background/50 backdrop-blur-sm mt-auto'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-6'>
        {/* Left Side: Copyright and Project Info */}
        <div className='text-center md:text-left space-y-2'>
          <div className='flex items-center justify-center md:justify-start gap-2 text-sm'>
            <span>&copy; {yearDisplay} TallyPad. An Open Source Project.</span>
            <a
              href='https://github.com/onebuffalolabs/tally-pad' // Replace with your actual repo URL
              target='_blank'
              rel='noopener noreferrer'
              onClick={() => logEvent('Navigation', 'Click', 'GitHub Footer')}
              className='text-foreground/40 hover:text-foreground transition-colors'
              aria-label='View Source on GitHub'>
              <FontAwesomeIcon icon={faGithub} />
            </a>
          </div>
          <p className='text-xs'>
            A{' '}
            <a
              href='https://onebuffalolabs.com'
              target='_blank'
              rel='noopener noreferrer'
              onClick={() => logEvent('Navigation', 'Click', 'One Buffalo Labs Footer')}
              className='font-bold text-primary hover:text-green-600 transition-colors'>
              One Buffalo Labs
            </a>{' '}
            Production
          </p>
        </div>

        {/* Right Side: Navigation Links */}
        <div className='flex flex-wrap justify-center gap-x-4 gap-y-2'>
          <Link
            href='/changelog'
            onClick={() => logEvent('Navigation', 'Click', 'Changelog Footer')}
            className='text-sm font-medium hover:text-primary transition-colors'>
            Changelog
          </Link>
          <span className='text-foreground/20 hidden sm:inline'>|</span>
          <Link
            href='/privacy'
            onClick={() => logEvent('Navigation', 'Click', 'Privacy Policy Footer')}
            className='text-sm hover:text-primary transition-colors'>
            Privacy Policy
          </Link>
          <span className='text-foreground/20 hidden sm:inline'>|</span>
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
