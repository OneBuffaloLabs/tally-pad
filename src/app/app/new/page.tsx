'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Game } from '@/types';
import { saveGame } from '@/lib/database';
import { generateId } from '@/lib/utils';

export default function NewGamePage() {
  const [step, setStep] = useState(1);
  const [gameType, setGameType] = useState<string | null>(null);
  const [players, setPlayers] = useState<string[]>([]);
  const [playerName, setPlayerName] = useState('');
  const [isSaving, setIsSaving] = useState(false); // New state for loading
  const router = useRouter();

  const handleGameSelection = (type: string) => {
    setGameType(type);
    setStep(2);
  };

  const handleAddPlayer = () => {
    if (playerName.trim() !== '') {
      setPlayers([...players, playerName.trim()]);
      setPlayerName('');
    }
  };

  const handleRemovePlayer = (index: number) => {
    setPlayers(players.filter((_, i) => i !== index));
  };

  const handleStartGame = async () => {
    if (players.length === 0 || !gameType || isSaving) {
      return;
    }

    setIsSaving(true);

    try {
      const newGame: Partial<Game> = {
        id: generateId(),
        name: gameType,
        status: 'In Progress',
        date: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        players,
        scores: [],
      };
      const response = await saveGame(newGame);
      router.push(`/app/game?id=${response.id}`);
    } catch (error) {
      console.error('Failed to save game:', error);
      setIsSaving(false);
    }
  };

  return (
    <div className='max-w-xl mx-auto p-4 sm:p-6 lg:p-8'>
      {step === 1 && (
        <div>
          <h2 className='text-3xl font-bold text-foreground mb-4'>Choose a Game</h2>
          <div className='grid grid-cols-1 gap-4'>
            <button
              onClick={() => handleGameSelection('Yahtzee')}
              className='text-left p-4 bg-white dark:bg-foreground/5 rounded-lg border border-border shadow-sm hover:shadow-lg transition-all flex justify-between items-center'>
              <span className='font-bold text-lg'>Yahtzee</span>
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
            <button
              onClick={() => handleGameSelection('Simple Score')}
              className='text-left p-4 bg-white dark:bg-foreground/5 rounded-lg border border-border shadow-sm hover:shadow-lg transition-all flex justify-between items-center'>
              <span className='font-bold text-lg'>Simple Score</span>
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2 className='text-3xl font-bold text-foreground mb-4'>Add Players</h2>
          <div className='flex gap-2 mb-4'>
            <input
              type='text'
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder='Enter player name'
              className='flex-grow p-2 border rounded-lg'
            />
            <button
              onClick={handleAddPlayer}
              className='bg-primary text-white font-semibold px-4 py-2 rounded-lg'>
              Add
            </button>
          </div>
          <ul className='space-y-2 mb-4'>
            {players.map((player, index) => (
              <li
                key={index}
                className='p-2 bg-gray-100 dark:bg-foreground/5 rounded-lg flex justify-between items-center'>
                <span>{player}</span>
                <button onClick={() => handleRemovePlayer(index)} className='text-red-500'>
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </li>
            ))}
          </ul>
          <button
            onClick={handleStartGame}
            disabled={players.length === 0 || isSaving}
            className='w-full bg-green-500 text-white font-bold py-3 rounded-lg cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed'>
            {isSaving ? 'Saving...' : 'Start Game'}
          </button>
        </div>
      )}
    </div>
  );
}
