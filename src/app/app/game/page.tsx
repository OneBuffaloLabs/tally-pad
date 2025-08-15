'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Game } from '@/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { useDb } from '@/contexts/DbContext';
import { getGame } from '@/lib/database';
// --- Scorecard Components ---
import YahtzeeScorecard from '@/components/scorecards/YahtzeeScorecard';
import Phase10Scorecard from '@/components/scorecards/Phase10Scorecard';

// A component that uses useSearchParams must be wrapped in a Suspense boundary.
const GamePageContent = () => {
  const { db } = useDb();
  const [game, setGame] = useState<Game | null>(null);
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  useEffect(() => {
    const fetchGame = async () => {
      if (db && id) {
        // Check for db
        const gameData = await getGame(db, id); // Pass db instance
        setGame(gameData);
      }
    };
    fetchGame();
  }, [db, id]);

  if (!game) {
    return (
      <div className='flex flex-col items-center justify-center pt-20'>
        <FontAwesomeIcon icon={faSpinner} spin size='3x' className='text-primary' />
        <p className='mt-4 text-foreground/60'>Loading Game...</p>
      </div>
    );
  }

  if (game.name === 'Phase 10') {
    return <Phase10Scorecard game={game} />;
  } else if (game.name === 'Yahtzee') {
    return <YahtzeeScorecard game={game} />;
  }

  // Placeholder for other game types
  return (
    <div className='p-4'>
      <h1 className='text-3xl font-bold'>{game.name}</h1>
      <p className='text-gray-600'>{game.date}</p>
      <div className='mt-4'>
        <h2 className='text-2xl font-semibold'>Players</h2>
        <ul className='list-disc list-inside'>
          {game.players.map((player) => (
            <li key={player}>{player}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// Main export for the page that includes the Suspense boundary
export default function GamePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GamePageContent />
    </Suspense>
  );
}
