'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Game } from '@/types';
import { getGame, initDB } from '@/lib/database';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

// A component that uses useSearchParams must be wrapped in a Suspense boundary.
const GamePageContent = () => {
  const [game, setGame] = useState<Game | null>(null);
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  useEffect(() => {
    const fetchGame = async () => {
      if (id) {
        await initDB(); // Ensure DB is initialized
        try {
          const gameData = await getGame(id);
          setGame(gameData);
        } catch (error) {
          console.error('Failed to fetch game:', error);
          // Optionally, set an error state here to show the user
        }
      }
    };
    fetchGame();
  }, [id]);

  if (!game) {
    return (
      <div className='flex flex-col items-center justify-center pt-20'>
        <FontAwesomeIcon icon={faSpinner} spin size='3x' className='text-primary' />
        <p className='mt-4 text-foreground/60'>Loading Game...</p>
      </div>
    );
  }

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
