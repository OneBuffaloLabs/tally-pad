'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Game, Phase10Round, GolfRound } from '@/types';
import { useDb } from '@/contexts/DbContext';
import { createGame } from '@/lib/database';
import { generateId } from '@/lib/utils';
import GolfScorecardSetup from '@/components/scorecards/golf/GolfScorecardSetup';

export default function NewGamePage() {
  const { db } = useDb();
  const [step, setStep] = useState(1);
  const [gameType, setGameType] = useState<string | null>(null);
  const [players, setPlayers] = useState<string[]>([]);
  const [playerName, setPlayerName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [holeCount, setHoleCount] = useState(9);
  const [pars, setPars] = useState<number[]>([]);
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
    if (!db || players.length === 0 || !gameType || isSaving) {
      return;
    }
    setIsSaving(true);

    try {
      const initialScores: Game['scores'] = {};
      players.forEach((player) => {
        initialScores[player] = {};
      });

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
        scores: initialScores,
        lastPlayed: Date.now(),
      };

      if (gameType === 'Phase 10') {
        const initialRound: Phase10Round = {};
        players.forEach((player) => {
          initialRound[player] = { score: 0, phaseCompleted: false };
        });
        newGame.phase10Rounds = [initialRound];
      }

      if (gameType === 'Golf' || gameType === 'Putt-Putt') {
        const initialGolfRounds: GolfRound[] = [];
        for (let i = 0; i < holeCount; i++) {
          initialGolfRounds.push({ par: pars[i] || 3 });
        }
        newGame.golfRounds = initialGolfRounds;
      }

      const response = await createGame(db, newGame);
      router.push(`/app/game?id=${response.id}`);
    } catch (error) {
      console.error('Failed to save game:', error);
      setIsSaving(false);
    }
  };

  const handleParChange = (index: number, value: string) => {
    const newPars = [...pars];
    newPars[index] = parseInt(value, 10);
    setPars(newPars);
  };

  return (
    <div className='max-w-xl mx-auto p-4 sm:p-6 lg:p-8'>
      {step === 1 && (
        <div>
          <h2 className='text-3xl font-bold text-foreground mb-4'>Choose a Game</h2>
          <div className='grid grid-cols-1 gap-4'>
            <button
              onClick={() => handleGameSelection('Yahtzee')}
              className='cursor-pointer text-left p-4 bg-foreground/5 rounded-lg border border-border shadow-sm hover:shadow-lg transition-all flex justify-between items-center'>
              <span className='font-bold text-lg'>Yahtzee</span>
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
            <button
              onClick={() => handleGameSelection('Phase 10')}
              className='cursor-pointer text-left p-4 bg-foreground/5 rounded-lg border border-border shadow-sm hover:shadow-lg transition-all flex justify-between items-center'>
              <span className='font-bold text-lg'>Phase 10</span>
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
            <button
              onClick={() => handleGameSelection('Simple Score')}
              className='cursor-pointer text-left p-4 bg-foreground/5 rounded-lg border border-border shadow-sm hover:shadow-lg transition-all flex justify-between items-center'>
              <span className='font-bold text-lg'>Simple Score</span>
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
            <button
              onClick={() => handleGameSelection('Golf')}
              className='cursor-pointer text-left p-4 bg-foreground/5 rounded-lg border border-border shadow-sm hover:shadow-lg transition-all flex justify-between items-center'>
              <span className='font-bold text-lg'>Golf</span>
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
            <button
              onClick={() => handleGameSelection('Putt-Putt')}
              className='cursor-pointer text-left p-4 bg-foreground/5 rounded-lg border border-border shadow-sm hover:shadow-lg transition-all flex justify-between items-center'>
              <span className='font-bold text-lg'>Putt-Putt</span>
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (gameType === 'Golf' || gameType === 'Putt-Putt') && (
        <GolfScorecardSetup
          players={players}
          setPlayers={setPlayers}
          setHoleCount={setHoleCount}
          setStep={setStep}
        />
      )}

      {step === 3 && (gameType === 'Golf' || gameType === 'Putt-Putt') && (
        <div>
          <h2 className='text-3xl font-bold text-foreground mb-4'>Set Par for Each Hole</h2>
          <div className='space-y-2 mb-4'>
            {Array.from({ length: holeCount }).map((_, index) => (
              <div key={index} className='flex items-center gap-4'>
                <label className='w-12 font-bold'>Hole {index + 1}:</label>
                <input
                  type='number'
                  defaultValue={3}
                  onChange={(e) => handleParChange(index, e.target.value)}
                  className='w-24 p-2 border rounded-lg'
                />
              </div>
            ))}
          </div>
          <button
            onClick={handleStartGame}
            disabled={isSaving}
            className='w-full bg-green-500 text-white font-bold py-3 rounded-lg cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed'>
            {isSaving ? 'Saving...' : 'Start Game'}
          </button>
        </div>
      )}

      {step === 2 && gameType !== 'Golf' && gameType !== 'Putt-Putt' && (
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
