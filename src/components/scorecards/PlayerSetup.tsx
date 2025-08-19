'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faUserPlus, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

interface PlayerSetupProps {
  gameType: string;
  players: string[];
  setPlayers: (players: string[]) => void;
  onBack: () => void;
  onNext: () => void;
}

export default function PlayerSetup({
  gameType,
  players,
  setPlayers,
  onBack,
  onNext,
}: PlayerSetupProps) {
  const [playerName, setPlayerName] = useState('');
  const [error, setError] = useState('');

  const handleAddPlayer = () => {
    const trimmedName = playerName.trim();
    if (trimmedName !== '') {
      if (players.includes(trimmedName)) {
        setError('Player name already exists.');
      } else {
        setPlayers([...players, trimmedName]);
        setPlayerName('');
        setError('');
      }
    }
  };

  const handleRemovePlayer = (index: number) => {
    setPlayers(players.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div className='flex justify-between items-center mb-4'>
        <h2 className='text-3xl font-bold text-foreground'>Add Players for {gameType}</h2>
        <button
          onClick={onBack}
          className='text-sm text-secondary font-semibold hover:underline cursor-pointer'>
          <FontAwesomeIcon icon={faArrowLeft} className='mr-2' />
          Back to Games
        </button>
      </div>
      <div className='flex gap-2 mb-4'>
        <input
          type='text'
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder='Enter player name'
          className={`flex-grow p-2 border rounded-lg ${error ? 'border-red-500' : ''}`}
        />
        <button
          onClick={handleAddPlayer}
          className='bg-primary text-white font-semibold px-4 py-2 rounded-lg cursor-pointer'>
          <FontAwesomeIcon icon={faUserPlus} className='mr-2' />
          Add
        </button>
      </div>
      {error && <p className='text-red-500 text-sm mb-4'>{error}</p>}
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
        <button
          onClick={onNext}
          className='w-full bg-green-500 text-white font-bold py-3 rounded-lg cursor-pointer'>
          Next
        </button>
      )}
    </div>
  );
}
