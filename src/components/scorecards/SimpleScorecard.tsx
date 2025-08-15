'use client';

import { useState, useMemo } from 'react';
import { useDb } from '@/contexts/DbContext';
import { updateGame } from '@/lib/database';
import Link from 'next/link';
import { Game } from '@/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faTrophy, faPlus, faUndo } from '@fortawesome/free-solid-svg-icons';

interface SimpleScorecardProps {
  game: Game;
}

export default function SimpleScorecard({ game: initialGame }: SimpleScorecardProps) {
  const { db } = useDb();
  const [game, setGame] = useState(initialGame);
  const [scoreInput, setScoreInput] = useState('');
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);

  const totals = useMemo(() => {
    const playerTotals: { [key: string]: number } = {};
    game.players.forEach((player) => {
      // This part is now safer. It defaults to an empty array if rounds is undefined.
      const playerScores = game.scores?.[player]?.rounds || [];
      playerTotals[player] = playerScores.reduce((acc, score) => acc + score, 0);
    });
    return playerTotals;
  }, [game.scores, game.players]);

  const updateAndSetGame = async (updates: Partial<Game>) => {
    if (!db || !game._id) return;
    const updatedGame = { ...game, ...updates, lastPlayed: Date.now() };
    setGame(updatedGame);
    await updateGame(db, game._id, { ...updates, lastPlayed: Date.now() });
  };

  const handleAddScore = async () => {
    const score = parseInt(scoreInput, 10);
    if (isNaN(score) || !db || !game._id) return;

    const currentPlayer = game.players[currentPlayerIndex];
    const newScores = JSON.parse(JSON.stringify(game.scores || {}));

    // Safely initialize the player's score object and rounds array if they don't exist
    if (!newScores[currentPlayer]) {
      newScores[currentPlayer] = { rounds: [] };
    }
    if (!newScores[currentPlayer].rounds) {
      newScores[currentPlayer].rounds = [];
    }

    // Now we can safely push without type assertions
    newScores[currentPlayer].rounds.push(score);

    await updateAndSetGame({ scores: newScores });

    setCurrentPlayerIndex((prevIndex) => (prevIndex + 1) % game.players.length);
    setScoreInput('');
  };

  const handleClearLastRound = async () => {
    if (!db || !game._id) return;

    const newScores = JSON.parse(JSON.stringify(game.scores || {}));
    let roundCleared = false;
    game.players.forEach((player) => {
      // Check that the rounds array exists and is not empty before popping
      if (newScores[player]?.rounds?.length > 0) {
        newScores[player].rounds.pop();
        roundCleared = true;
      }
    });

    if (roundCleared) {
      await updateAndSetGame({ scores: newScores });
    }
  };

  const currentPlayer = game.players[currentPlayerIndex];

  return (
    <div className='p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-3xl font-bold text-foreground'>{game.name}</h1>
        <Link
          href='/app'
          className='bg-secondary/10 text-secondary font-semibold px-4 py-2 rounded-full text-sm hover:bg-secondary/20 transition-colors'>
          <FontAwesomeIcon icon={faArrowLeft} className='mr-2' />
          Back to Games
        </Link>
      </div>

      {/* Score Input Section */}
      <div className='bg-background border border-border rounded-lg p-6 mb-8 shadow-sm'>
        <h2 className='text-2xl font-bold text-center text-foreground mb-4'>
          Current Turn: <span className='text-primary'>{currentPlayer}</span>
        </h2>
        <div className='flex flex-col sm:flex-row gap-2'>
          <input
            type='number'
            value={scoreInput}
            onChange={(e) => setScoreInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddScore()}
            placeholder={`Enter score for ${currentPlayer}`}
            className='flex-grow p-3 border-2 border-border rounded-lg text-center text-xl font-bold focus:border-primary focus:ring-1 focus:ring-primary'
            autoFocus
          />
          <button
            onClick={handleAddScore}
            className='bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition-colors flex-shrink-0 cursor-pointer'>
            <FontAwesomeIcon icon={faPlus} className='mr-2' />
            Add Score
          </button>
        </div>
      </div>

      {/* Scores Table */}
      <div className='shadow-lg rounded-xl overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='min-w-full bg-foreground/5'>
            <thead className='bg-secondary'>
              <tr>
                {game.players.map((player) => (
                  <th
                    key={player}
                    className='p-4 font-bold text-gray-200 text-lg tracking-wider text-center'>
                    {player}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className='bg-gray-700 text-white font-extrabold text-2xl'>
                {game.players.map((player) => (
                  <td key={player} className='p-4 text-center'>
                    {totals[player] ?? 0}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
          <div className='p-4 bg-background border-t border-border'>
            <h3 className='font-bold text-foreground mb-2'>Score History</h3>
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
              {game.players.map((player) => (
                <div key={player} className='bg-foreground/5 p-3 rounded'>
                  <h4 className='font-semibold text-primary'>{player}</h4>
                  <ol className='list-decimal list-inside text-foreground/80 text-sm mt-1'>
                    {/* Use optional chaining to safely map over the rounds array */}
                    {game.scores?.[player]?.rounds?.map((score, index) => (
                      <li key={index}>{score} points</li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
            <div className='text-center mt-6'>
              <button
                onClick={handleClearLastRound}
                className='bg-red-600/10 text-red-500 font-semibold px-4 py-2 rounded-full text-sm hover:bg-red-600 hover:text-white transition-colors cursor-pointer'>
                <FontAwesomeIcon icon={faUndo} className='mr-2' />
                Undo Last Round
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
