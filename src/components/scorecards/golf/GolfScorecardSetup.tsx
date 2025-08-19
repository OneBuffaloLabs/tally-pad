'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faUserPlus } from '@fortawesome/free-solid-svg-icons';

interface GolfScorecardSetupProps {
  players: string[];
  setPlayers: (players: string[]) => void;
  setHoleCount: (count: number) => void;
  setStep: (step: number) => void;
}

export default function GolfScorecardSetup({
  players,
  setPlayers,
  setHoleCount,
  setStep,
}: GolfScorecardSetupProps) {
  const [playerName, setPlayerName] = useState('');

  const handleAddPlayer = () => {
    if (playerName.trim() !== '') {
      setPlayers([...players, playerName.trim()]);
      setPlayerName('');
    }
  };

  const handleRemovePlayer = (index: number) => {
    setPlayers(players.filter((_, i) => i !== index));
  };

  const handleHoleSelection = (count: number) => {
    setHoleCount(count);
    setStep(3);
  };

  return (
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
          className='bg-primary text-white font-semibold px-4 py-2 rounded-lg cursor-pointer'>
          <FontAwesomeIcon icon={faUserPlus} className='mr-2' />
          Add
        </button>
      </div>
      <ul className='space-y-2 mb-4'>
        {players.map((player, index) => (
          <li
            key={index}
            className='p-2 bg-foreground/5 rounded-lg flex justify-between items-center'>
            <span>{player}</span>
            <button
              onClick={() => handleRemovePlayer(index)}
              className='text-red-500 cursor-pointer'>
              <FontAwesomeIcon icon={faTrash} />
            </button>
          </li>
        ))}
      </ul>
      {players.length > 0 && (
        <div>
          <h2 className='text-3xl font-bold text-foreground my-4'>Choose Number of Holes</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <button
              onClick={() => handleHoleSelection(9)}
              className='cursor-pointer text-left p-4 bg-foreground/5 rounded-lg border border-border shadow-sm hover:shadow-lg transition-all'>
              9 Holes
            </button>
            <button
              onClick={() => handleHoleSelection(18)}
              className='cursor-pointer text-left p-4 bg-foreground/5 rounded-lg border border-border shadow-sm hover:shadow-lg transition-all'>
              18 Holes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
