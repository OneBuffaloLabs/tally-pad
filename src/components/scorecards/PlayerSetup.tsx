'use client';

// --- React ---
import { useState, useEffect } from 'react';
// --- Icons ---
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
  // Local state for dynamic addition
  const [newPlayerName, setNewPlayerName] = useState('');
  const [error, setError] = useState('');

  // Fixed player mode (e.g. Spades)
  const isFixedPlayers = gameType === 'Spades';
  const fixedCount = 4;

  // Ensure we have the right number of slots for fixed games
  useEffect(() => {
    if (isFixedPlayers && players.length !== fixedCount) {
      // Initialize with empty strings if not already set correctly
      setPlayers(Array(fixedCount).fill(''));
    }
  }, [isFixedPlayers, players.length, setPlayers]);

  // --- Handlers for Dynamic Mode ---
  const handleAddPlayer = () => {
    const trimmedName = newPlayerName.trim();
    if (trimmedName !== '') {
      if (players.includes(trimmedName)) {
        setError('Player name already exists.');
      } else {
        setPlayers([...players, trimmedName]);
        setNewPlayerName('');
        setError('');
      }
    }
  };

  const handleRemovePlayer = (index: number) => {
    setPlayers(players.filter((_, i) => i !== index));
    setError('');
  };

  // --- Handlers for Fixed Mode ---
  const handleFixedPlayerChange = (index: number, name: string) => {
    const newPlayers = [...players];
    newPlayers[index] = name;
    setPlayers(newPlayers);
    setError('');
  };

  // --- Common Navigation ---
  const handleNext = () => {
    if (isFixedPlayers) {
      if (players.some((p) => !p.trim())) {
        setError(`All ${fixedCount} players must have a name.`);
        return;
      }
      // Check for duplicates
      const uniqueNames = new Set(players.map((p) => p.trim()));
      if (uniqueNames.size !== players.length) {
        setError('Player names must be unique.');
        return;
      }
    } else {
      if (players.length === 0) {
        return; // Should be disabled anyway
      }
    }

    onNext();
  };

  return (
    <div>
      <div className='flex justify-between items-center mb-4'>
        <h2 className='text-3xl font-bold text-foreground'>
          {isFixedPlayers ? `Set Up ${fixedCount} Players` : `Add Players for ${gameType}`}
        </h2>
        <button
          onClick={onBack}
          className='text-sm text-secondary font-semibold hover:underline cursor-pointer'>
          <FontAwesomeIcon icon={faArrowLeft} className='mr-2' />
          Back to Games
        </button>
      </div>

      {isFixedPlayers ? (
        <div className='bg-foreground/5 p-4 rounded-lg mb-4'>
          <p className='text-sm text-foreground/70 mb-4'>
            Spades requires exactly 4 players.
            <br />
            <span className='text-xs italic'>(Team 1: Players 1 & 3, Team 2: Players 2 & 4)</span>
          </p>
          <div className='grid grid-cols-1 gap-3'>
            {players.map((name, index) => (
              <div key={index} className='flex items-center gap-3'>
                <span className='w-20 font-bold text-sm text-foreground/60'>
                  Player {index + 1}
                </span>
                <input
                  type='text'
                  value={name}
                  onChange={(e) => handleFixedPlayerChange(index, e.target.value)}
                  placeholder={`Name for Player ${index + 1}`}
                  className='flex-grow p-2 border rounded-lg focus:border-primary focus:ring-1 focus:ring-primary'
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className='flex gap-2 mb-4'>
            <input
              type='text'
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
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

          <ul className='space-y-2 mb-4'>
            {players.map((player, index) => (
              <li
                key={index}
                className='p-2 bg-foreground/5 rounded-lg flex justify-between items-center'>
                <span>{player}</span>
                <button
                  onClick={() => handleRemovePlayer(index)}
                  className='text-red-500 cursor-pointer hover:text-red-700'>
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {error && <p className='text-red-500 text-sm mb-4 font-bold'>{error}</p>}

      <button
        onClick={handleNext}
        disabled={players.length === 0 && !isFixedPlayers}
        className='w-full bg-green-500 text-white font-bold py-3 rounded-lg cursor-pointer hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'>
        Next
      </button>
    </div>
  );
}
