import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faDice,
  faSave,
  faMobileAlt,
  faPlusCircle,
  faClipboardList,
  faTrophy,
} from '@fortawesome/free-solid-svg-icons';

import { HeroSection, FinalCTA } from './landing-page-client';

// --- Type Definitions for Component Props ---
type FeatureCardProps = {
  icon: IconDefinition;
  title: string;
  description: string;
};

type StepCardProps = {
  icon: IconDefinition;
  step: string;
  title: string;
  description: string;
};

// --- Main Landing Page Component ---
export default function LandingPage() {
  return (
    <>
      {/* Client Components for interactivity */}
      <HeroSection />

      {/* Features Section */}
      <section className='bg-white dark:bg-foreground/5 py-20'>
        <div className='max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 px-4'>
          <FeatureCard
            icon={faDice}
            title='Supports Any Game'
            description='From complex board games to simple card games, create a scoresheet that fits your needs.'
          />
          <FeatureCard
            icon={faSave}
            title='Saves Automatically'
            description='Your games are saved locally in your browser, so you can pick up right where you left off.'
          />
          <FeatureCard
            icon={faMobileAlt}
            title='Mobile Friendly'
            description='Designed to work beautifully on your phone, making it the perfect companion for game night.'
          />
        </div>
      </section>

      {/* How It Works Section */}
      <section className='py-20'>
        <div className='max-w-5xl mx-auto px-4 text-center'>
          <h2 className='text-3xl font-bold mb-2'>Scoring in 3 Easy Steps</h2>
          <p className='text-foreground/60 mb-12'>Get from zero to scoring in seconds.</p>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            <StepCard
              step='1'
              icon={faPlusCircle}
              title='Create Your Game'
              description='Choose a game template and add your players.'
            />
            <StepCard
              step='2'
              icon={faClipboardList}
              title='Tally the Scores'
              description='Easily add scores round by round on a clean, simple interface.'
            />
            <StepCard
              step='3'
              icon={faTrophy}
              title='Declare a Winner'
              description='Totals are calculated automatically. See who comes out on top!'
            />
          </div>
        </div>
      </section>

      {/* Final CTA Section (Client Component) */}
      <FinalCTA />
    </>
  );
}

// --- Child Components ---
const FeatureCard = ({ icon, title, description }: FeatureCardProps) => (
  <div className='flex flex-col items-center text-center'>
    <div className='bg-secondary text-white rounded-full w-16 h-16 flex items-center justify-center'>
      <FontAwesomeIcon icon={icon} size='2x' />
    </div>
    <h3 className='mt-4 text-xl font-bold'>{title}</h3>
    <p className='mt-2 text-foreground/60'>{description}</p>
  </div>
);

const StepCard = ({ icon, step, title, description }: StepCardProps) => (
  <div className='flex flex-col items-center text-center'>
    <div className='relative mb-4'>
      <div className='bg-primary/10 text-primary rounded-full w-20 h-20 flex items-center justify-center'>
        <FontAwesomeIcon icon={icon} size='2x' />
      </div>
      <span className='absolute -top-2 -left-2 bg-primary text-white text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center border-4 border-background'>
        {step}
      </span>
    </div>
    <h3 className='mt-4 text-xl font-bold'>{title}</h3>
    <p className='mt-2 text-foreground/60'>{description}</p>
  </div>
);
