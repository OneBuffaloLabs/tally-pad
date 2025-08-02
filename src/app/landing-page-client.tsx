'use client';

import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDice, faArrowRight } from '@fortawesome/free-solid-svg-icons';
// --- Analytics ---
import { logEvent } from '@/lib/analytics';

// --- Header Component ---
export const Header = () => {
  return (
    <header className='p-4 flex justify-between items-center sticky top-0 bg-background/80 backdrop-blur-sm z-50'>
      <h1 className='text-xl font-bold'>TallyPad</h1>
      <Link
        href='/app'
        onClick={() => logEvent('Navigation', 'Click', 'Launch App Header')}
        className='bg-primary/10 text-primary font-semibold px-4 py-2 rounded-full text-sm hover:bg-primary/20 transition-colors'>
        Launch App
      </Link>
    </header>
  );
};

// --- Hero Section Component ---
export const HeroSection = () => {
  return (
    <main className='px-4 py-16 sm:py-24 text-center'>
      <div className='max-w-3xl mx-auto'>
        <div className='flex justify-center items-center gap-6 mb-6'>
          <FontAwesomeIcon icon={faDice} className='text-accent' size='3x' />
          <span className='text-5xl font-bold text-secondary'>+</span>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-16 w-16 text-accent'
            viewBox='0 0 24 24'
            fill='currentColor'>
            <path d='M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm-1 14H5c-.55 0-1-.45-1-1V7c0-.55.45-1 1-1h14c.55 0 1 .45 1 1v10c0 .55-.45 1-1 1z' />
          </svg>
        </div>

        <h2 className='text-4xl sm:text-6xl font-extrabold text-foreground tracking-tight'>
          The last scoresheet you&apos;ll ever need.
        </h2>
        <p className='mt-4 text-lg text-foreground/70 max-w-xl mx-auto'>
          TallyPad is a simple, beautiful, and free scorekeeper for all your favorite card and board
          games. Focus on the fun, not the math.
        </p>
        <Link
          href='/app'
          onClick={() => logEvent('Conversion', 'Click', 'Get Started Hero')}
          className='mt-8 inline-flex items-center gap-2 bg-primary text-white font-semibold px-8 py-3 rounded-full text-lg shadow-lg hover:scale-105 hover:shadow-xl transition-transform'>
          Get Started
          <FontAwesomeIcon icon={faArrowRight} className='w-4 h-4' />
        </Link>
      </div>
    </main>
  );
};

// --- Final CTA Section Component ---
export const FinalCTA = () => {
  return (
    <section className='bg-secondary text-white py-20'>
      <div className='max-w-3xl mx-auto text-center px-4'>
        <h2 className='text-4xl font-bold'>Ready to Ditch the Paper?</h2>
        <p className='mt-4 text-lg opacity-80'>
          Upgrade your game night with a modern, easy-to-use scoresheet.
        </p>
        <Link
          href='/app'
          onClick={() => logEvent('Conversion', 'Click', 'Start Scoring CTA')}
          className='mt-8 inline-flex items-center gap-2 bg-primary text-white font-semibold px-8 py-3 rounded-full text-lg shadow-lg hover:scale-105 hover:shadow-xl transition-transform'>
          Start Scoring for Free
          <FontAwesomeIcon icon={faArrowRight} className='w-4 h-4' />
        </Link>
      </div>
    </section>
  );
};
