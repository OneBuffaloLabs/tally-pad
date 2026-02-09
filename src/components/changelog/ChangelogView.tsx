'use client';

// --- React ---
import React from 'react';

// --- Next/Router ---
import Link from 'next/link';

// --- Icons ---
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faRocket,
  faWrench,
  faStar,
  faBug,
  faScroll,
} from '@fortawesome/free-solid-svg-icons';

// --- Types ---
import { ChangeLogEntry, ChangeType } from '@/lib/changelog';

// --- Helper Components ---
const ChangeIcon = ({ type }: { type: ChangeType }) => {
  switch (type) {
    case 'added':
      return <FontAwesomeIcon icon={faStar} className='text-green-500 w-4 h-4 mt-1' />;
    case 'changed':
      return <FontAwesomeIcon icon={faWrench} className='text-orange-400 w-4 h-4 mt-1' />;
    case 'fixed':
      return <FontAwesomeIcon icon={faBug} className='text-red-400 w-4 h-4 mt-1' />;
    default:
      return <FontAwesomeIcon icon={faScroll} className='text-secondary w-4 h-4 mt-1' />;
  }
};

const ChangeLabel = ({ type }: { type: ChangeType }) => {
  const styles = {
    added: 'bg-green-500/10 text-green-600 border-green-200',
    changed: 'bg-orange-500/10 text-orange-600 border-orange-200',
    fixed: 'bg-red-500/10 text-red-600 border-red-200',
  };

  return (
    <span
      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${styles[type]}`}>
      {type}
    </span>
  );
};

interface ChangelogViewProps {
  data: ChangeLogEntry[];
}

export default function ChangelogView({ data }: ChangelogViewProps) {
  if (!data || data.length === 0) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center text-foreground/50'>
        <p>No changelog data found.</p>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-background text-foreground selection:bg-primary/20'>
      {/* Header */}
      <header className='sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border'>
        <div className='max-w-3xl mx-auto px-4 h-16 flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <Link
              href='/app'
              className='w-10 h-10 flex items-center justify-center rounded-full hover:bg-foreground/5 text-foreground/60 hover:text-primary transition-colors'>
              <FontAwesomeIcon icon={faArrowLeft} />
            </Link>
            <h1 className='text-xl font-bold flex items-center gap-2'>
              <span className='text-primary'>What&apos;s New</span>
              <span className='text-foreground/40 font-normal text-sm hidden sm:inline-block'>
                | TallyPad Updates
              </span>
            </h1>
          </div>
          <div className='text-xs font-medium text-foreground/40 bg-foreground/5 px-3 py-1 rounded-full'>
            v{data[0].version}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className='max-w-3xl mx-auto px-4 py-8 sm:py-12'>
        <div className='relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent'>
          {data.map((entry, index) => (
            <div
              key={entry.version}
              className='relative flex flex-col md:flex-row items-start gap-6 md:gap-10 group'
              style={{ animation: `fadeIn 0.5s ease-out ${index * 0.1}s backwards` }}>
              {/* Timeline Marker */}
              <div className='absolute left-0 md:left-1/2 md:-ml-3.5 mt-1.5 w-7 h-7 rounded-full border-4 border-background bg-secondary flex items-center justify-center shadow-sm z-10 group-hover:scale-110 transition-transform duration-300'>
                {entry.isLatest ? (
                  <div className='w-2.5 h-2.5 bg-accent rounded-full animate-pulse' />
                ) : (
                  <div className='w-2 h-2 bg-background/50 rounded-full' />
                )}
              </div>

              {/* Date Column (Desktop: Left, Mobile: Top) */}
              <div className='md:w-1/2 md:text-right pl-10 md:pl-0 md:pr-10 pt-1.5'>
                <div className='flex flex-col md:items-end'>
                  <span
                    className={`text-2xl font-bold tracking-tight ${entry.isLatest ? 'text-primary' : 'text-foreground'}`}>
                    v{entry.version}
                  </span>
                  <span className='text-sm font-medium text-foreground/50 mt-1'>{entry.date}</span>
                  {entry.isLatest && (
                    <span className='inline-block mt-2 px-3 py-1 bg-accent text-secondary text-xs font-bold rounded-full shadow-sm'>
                      Latest Release
                    </span>
                  )}
                </div>
              </div>

              {/* Content Card (Desktop: Right, Mobile: Bottom) */}
              <div className='md:w-1/2 pl-10 md:pl-0 w-full'>
                <div className='bg-background border border-border rounded-xl p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group-hover:border-primary/30'>
                  {entry.changes.map((changeGroup, idx) => (
                    <div key={idx} className='mb-6 last:mb-0'>
                      <div className='flex items-center gap-2 mb-3'>
                        <ChangeLabel type={changeGroup.type} />
                      </div>
                      <ul className='space-y-3'>
                        {changeGroup.items.map((item, itemIdx) => (
                          <li
                            key={itemIdx}
                            className='flex gap-3 text-sm text-foreground/80 leading-relaxed'>
                            <ChangeIcon type={changeGroup.type} />
                            <span
                              dangerouslySetInnerHTML={{
                                __html: item
                                  .replace(
                                    /\*\*(.*?)\*\*/g,
                                    '<strong class="text-foreground font-semibold">$1</strong>'
                                  )
                                  // This line adds support for _text_ -> italic
                                  .replace(/_(.*?)_/g, '<em class="italic">$1</em>'),
                              }}
                            />
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}

                  {/* Decorative Rocket for Launch Version */}
                  {entry.version === '1.0.0' && (
                    <div className='mt-4 pt-4 border-t border-border flex items-center justify-center text-foreground/40 gap-2 text-xs uppercase tracking-widest font-bold'>
                      <FontAwesomeIcon icon={faRocket} className='text-accent' />
                      Liftoff
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Message */}
        <div className='text-center mt-16 pb-8'>
          <p className='text-foreground/40 text-sm'>That&apos;s all for now. Go play some games!</p>
        </div>
      </main>

      {/* Animation Styles */}
      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
}
