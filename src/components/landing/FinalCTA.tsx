'use client';

import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { logEvent } from '@/lib/analytics';

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
