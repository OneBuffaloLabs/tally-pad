'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Game } from '@/types';
import { getGame, initDB } from '@/lib/database';

// This line tells Next.js to render this page dynamically at request time.
export const dynamic = 'force-dynamic';

export default function GamePage() {
  const [game, setGame] = useState<Game | null>(null);
  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    const fetchGame = async () => {
      if (id) {
        await initDB(); // Ensure DB is initialized
        const gameData = await getGame(id);
        setGame(gameData);
      }
    };
    fetchGame();
  }, [id]);

  if (!game) {
    return <div>Loading...</div>;
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
}
