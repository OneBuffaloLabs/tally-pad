'use client';

import { useState, useEffect } from 'react';
import { useDb } from '@/contexts/DbContext'; // Use the context
import { getAllGames } from '@/lib/database'; // Import the function
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faDice,
  faLayerGroup,
  faGolfBall,
  faClipboardList,
  faSpinner, // Import the spinner icon
} from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { Game } from '@/types';
import Link from 'next/link';

// --- Main App Page Component ---
export default function AppPage() {
  const { db, isLoading } = useDb();
  const [games, setGames] = useState<Game[]>([]);

  useEffect(() => {
    const loadGames = async () => {
      if (db) {
        // Only run if db is initialized
        const savedGames = await getAllGames(db);
        setGames(savedGames);
      }
    };
    loadGames();
  }, [db]); // Rerun when db is available

  // Updated loading state with a spinner
  if (isLoading) {
    return (
      <div className='flex flex-col items-center justify-center pt-20'>
        <FontAwesomeIcon icon={faSpinner} spin size='3x' className='text-primary' />
        <p className='mt-4 text-foreground/60'>Loading Games...</p>
      </div>
    );
  }

  return (
    <div className='relative'>
      {/* Main Content Area */}
      <main className='p-4 sm:p-6 lg:p-8'>
        {games.length === 0 ? <EmptyState /> : <GameList games={games} />}
      </main>

      {/* Floating Action Button (FAB) */}
      <Link
        href='/app/new'
        className='fixed bottom-6 right-6 bg-primary text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:scale-105 hover:shadow-xl transition-transform'
        aria-label='Create new game'>
        <FontAwesomeIcon
          icon={faPlus}
          className='group-hover:rotate-90 transition-transform'
          size='2x'
        />
      </Link>
    </div>
  );
}

// --- Helper function and Child Components ---

// Helper to get an icon based on the game name
const getGameIcon = (gameName: string): IconDefinition => {
  const lowerCaseName = gameName.toLowerCase();
  if (lowerCaseName.includes('putt')) return faGolfBall;
  if (lowerCaseName.includes('rummy') || lowerCaseName.includes('phase')) return faLayerGroup;
  return faDice; // Default icon
};

const GameList = ({ games }: { games: Game[] }) => (
  <>
    <div className='mb-6'>
      <h2 className='text-3xl font-bold text-foreground'>Your Games</h2>
      <p className='text-foreground/60 mt-1'>Here&apos;s what you&apos;ve been playing.</p>
    </div>
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
      {games.map((game) => (
        <GameCard key={game._id} {...game} />
      ))}
    </div>
  </>
);

const GameCard = ({ _id, name, status, date, players }: Game) => {
  const statusStyles =
    status === 'In Progress'
      ? {
          badge: 'bg-accent/20 text-yellow-800 dark:text-accent',
          border: 'border-t-4 border-accent',
        }
      : {
          badge: 'bg-secondary/10 text-secondary',
          border: 'border-t-4 border-secondary/50',
        };

  return (
    <Link
      href={`/app/game?id=${_id}`}
      className={`block bg-white dark:bg-foreground/5 rounded-lg border border-border shadow-sm hover:shadow-lg hover:-translate-y-1.5 transition-all group ${statusStyles.border}`}>
      <div className='p-5'>
        <div className='flex justify-between items-start'>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusStyles.badge}`}>
            {status}
          </span>
          <FontAwesomeIcon icon={getGameIcon(name)} className='text-foreground/20 h-6 w-6' />
        </div>
        <h3 className='font-bold text-xl text-foreground mt-3'>{name}</h3>
        <p className='text-sm text-foreground/60 mt-1'>{date}</p>
        <div className='flex items-center justify-between mt-6'>
          <div className='flex -space-x-2'>
            {players.map((player: string, index: number) => (
              <div
                key={index}
                className='w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center text-xs font-bold border-2 border-white dark:border-foreground/10 group-hover:border-primary/20 transition-colors'>
                {player.charAt(0).toUpperCase()}
              </div>
            ))}
          </div>
          <span className='text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity'>
            Open &rarr;
          </span>
        </div>
      </div>
    </Link>
  );
};

const EmptyState = () => (
  <div className='text-center py-20 flex flex-col items-center'>
    <div className='bg-secondary/10 rounded-full p-6'>
      <FontAwesomeIcon icon={faClipboardList} className='text-secondary' size='4x' />
    </div>
    <h2 className='text-3xl font-bold mt-6'>No Games Yet!</h2>
    <p className='text-foreground/60 mt-2 max-w-sm'>
      It looks like your scoresheet is empty. Tap the &apos;New Game&apos; button to get started.
    </p>
  </div>
);
