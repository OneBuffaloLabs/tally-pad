'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useDb } from '@/contexts/DbContext';
import { updateGame } from '@/lib/database';
import Link from 'next/link';
import { Game } from '@/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faPlus,
  faUndo,
  faSort,
  faPen,
  faTimes,
  faTrophy,
} from '@fortawesome/free-solid-svg-icons';

interface SimpleScorecardProps {
  game: Game;
}

export default function SimpleScorecard({ game: initialGame }: SimpleScorecardProps) {
  const { db } = useDb();
  const [game, setGame] = useState(initialGame);
  const [scoreInput, setScoreInput] = useState('');
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [sortedPlayers, setSortedPlayers] = useState<string[]>(initialGame.players);
  const [sortAsc, setSortAsc] = useState(false);
  const [editingScore, setEditingScore] = useState<{
    player: string;
    index: number;
  } | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [winners, setWinners] = useState<{ name: string; score: number }[]>([]);
  const isCompleted = game.status === 'Completed';

  const totals = useMemo(() => {
    const playerTotals: { [key: string]: number } = {};
    game.players.forEach((player) => {
      const playerScores = game.scores?.[player]?.rounds || [];
      playerTotals[player] = playerScores.reduce((acc, score) => acc + score, 0);
    });
    return playerTotals;
  }, [game.scores, game.players]);

  const winningScore = useMemo(() => Math.max(0, ...Object.values(totals)), [totals]);

  const calculateWinners = useCallback(() => {
    if (winningScore > 0) {
      const currentWinners = game.players
        .filter((p) => totals[p] === winningScore)
        .map((name) => ({ name, score: winningScore }));
      setWinners(currentWinners);
    }
  }, [game.players, totals, winningScore]);

  useEffect(() => {
    if (isCompleted) {
      calculateWinners();
    }
  }, [isCompleted, calculateWinners]);

  useEffect(() => {
    setSortedPlayers(
      [...game.players].sort((a, b) => {
        const scoreA = totals[a] ?? 0;
        const scoreB = totals[b] ?? 0;
        return sortAsc ? scoreA - scoreB : scoreB - scoreA;
      })
    );
  }, [totals, game.players, sortAsc]);

  const updateAndSetGame = async (updates: Partial<Game>) => {
    if (!db || !game._id) return;
    const updatedGame = { ...game, ...updates, lastPlayed: Date.now() };
    setGame(updatedGame);
    await updateGame(db, game._id, { ...updates, lastPlayed: Date.now() });
  };

  const handleAddScore = async () => {
    if (isCompleted) return;
    const score = parseInt(scoreInput, 10);
    if (isNaN(score) || !db || !game._id) return;

    const currentPlayer = game.players[currentPlayerIndex];
    const newScores = JSON.parse(JSON.stringify(game.scores || {}));
    if (!newScores[currentPlayer]) newScores[currentPlayer] = { rounds: [] };
    if (!newScores[currentPlayer].rounds) newScores[currentPlayer].rounds = [];
    newScores[currentPlayer].rounds.push(score);

    await updateAndSetGame({ scores: newScores });
    setCurrentPlayerIndex((prevIndex) => (prevIndex + 1) % game.players.length);
    setScoreInput('');
  };

  const handleEditScore = async () => {
    if (isCompleted || !editingScore) return;
    const newScore = parseInt(editingValue, 10);
    if (isNaN(newScore) || !db || !game._id) return;

    const { player, index } = editingScore;
    const newScores = JSON.parse(JSON.stringify(game.scores || {}));
    if (newScores[player]?.rounds?.[index] !== undefined) {
      newScores[player].rounds[index] = newScore;
      await updateAndSetGame({ scores: newScores });
    }
    setEditingScore(null);
    setEditingValue('');
  };

  const handleOpenEditModal = (player: string, index: number) => {
    if (isCompleted) return;
    const score = game.scores?.[player]?.rounds?.[index];
    if (typeof score === 'number') {
      setEditingScore({ player, index });
      setEditingValue(String(score));
    }
  };

  const handleClearLastRound = async () => {
    if (isCompleted || !db || !game._id) return;
    const newScores = JSON.parse(JSON.stringify(game.scores || {}));
    let roundCleared = false;
    game.players.forEach((player) => {
      if (newScores[player]?.rounds?.length > 0) {
        newScores[player].rounds.pop();
        roundCleared = true;
      }
    });

    if (roundCleared) await updateAndSetGame({ scores: newScores });
  };

  const handleFinishGame = async () => {
    if (isCompleted || !db || !game._id) return;
    calculateWinners();
    setShowWinnerModal(true);
    await updateAndSetGame({ status: 'Completed' });
  };

  const currentPlayer = game.players[currentPlayerIndex];

  return (
    <div className='p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-3xl font-bold text-foreground'>{game.name}</h1>
        <div className='flex items-center gap-2'>
          <button
            onClick={handleFinishGame}
            disabled={isCompleted}
            className='bg-primary text-white font-semibold px-4 py-2 rounded-full text-sm hover:bg-green-700 transition-colors cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed'>
            <FontAwesomeIcon icon={faTrophy} className='mr-2' />
            {isCompleted ? 'Game Finished' : 'Finish Game'}
          </button>
          <Link
            href='/app'
            className='bg-secondary/10 text-secondary font-semibold px-4 py-2 rounded-full text-sm hover:bg-secondary/20 transition-colors cursor-pointer'>
            <FontAwesomeIcon icon={faArrowLeft} className='mr-2' />
            Back to Games
          </Link>
        </div>
      </div>

      {isCompleted && winners.length > 0 && (
        <div className='bg-primary/10 border-l-4 border-primary text-primary p-4 rounded-lg mb-6'>
          <div className='flex items-center'>
            <FontAwesomeIcon icon={faTrophy} className='mr-3' size='2x' />
            <div>
              <h3 className='font-bold text-lg'>
                {winners.length > 1 ? "It's a Tie!" : 'Winner!'}
              </h3>
              {winners.map((winner) => (
                <p key={winner.name}>
                  <span className='font-semibold'>{winner.name}</span> with a score of{' '}
                  {winner.score}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className={`${isCompleted ? 'opacity-75 pointer-events-none' : ''}`}>
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

        <div className='shadow-lg rounded-xl overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='min-w-full bg-foreground/5'>
              <thead className='bg-secondary'>
                <tr>
                  {sortedPlayers.map((player) => {
                    const isWinning = totals[player] === winningScore && winningScore > 0;
                    return (
                      <th
                        key={player}
                        className={`p-4 font-bold text-gray-200 text-lg tracking-wider text-center transition-colors ${
                          isWinning ? 'bg-accent text-secondary' : ''
                        }`}>
                        {player}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                <tr className='bg-gray-700 text-white font-extrabold text-2xl'>
                  {sortedPlayers.map((player) => (
                    <td key={player} className='p-4 text-center'>
                      {totals[player] ?? 0}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
            <div className='p-4 bg-background border-t border-border'>
              <div className='flex justify-between items-center mb-2'>
                <h3 className='font-bold text-foreground'>Score History</h3>
                <button
                  onClick={() => setSortAsc(!sortAsc)}
                  className='text-sm bg-foreground/5 text-foreground/80 font-semibold px-3 py-1 rounded-full hover:bg-foreground/10 transition-colors cursor-pointer'>
                  <FontAwesomeIcon icon={faSort} className='mr-2' />
                  Sort
                </button>
              </div>
              <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
                {sortedPlayers.map((player) => (
                  <div key={player} className='bg-foreground/5 p-3 rounded'>
                    <h4 className='font-semibold text-primary'>{player}</h4>
                    <ol className='list-decimal list-inside text-foreground/80 text-sm mt-1 space-y-1'>
                      {game.scores?.[player]?.rounds?.map((score, index) => (
                        <li key={index} className='flex justify-between items-center'>
                          <span>{score} points</span>
                          <button
                            onClick={() => handleOpenEditModal(player, index)}
                            className='text-foreground/40 hover:text-primary transition-colors cursor-pointer'>
                            <FontAwesomeIcon icon={faPen} size='xs' />
                          </button>
                        </li>
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

      {showWinnerModal && (
        <div className='fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50'>
          <div className='bg-background p-8 rounded-lg shadow-2xl w-full max-w-md border border-border text-center'>
            <FontAwesomeIcon icon={faTrophy} className='text-accent text-5xl mb-4' />
            <h2 className='text-3xl font-bold text-foreground mb-2'>
              {winners.length > 1 ? "It's a Tie!" : 'Winner!'}
            </h2>
            {winners.map((winner) => (
              <p key={winner.name} className='text-xl text-foreground/80 mb-1'>
                <span className='font-bold text-primary'>{winner.name}</span> with a score of{' '}
                {winner.score}
              </p>
            ))}
            <div className='mt-8 flex flex-col sm:flex-row gap-2'>
              <Link
                href='/app'
                className='w-full bg-secondary text-white font-bold py-3 rounded-lg hover:bg-blue-800 transition-colors cursor-pointer'>
                <FontAwesomeIcon icon={faArrowLeft} className='mr-2' />
                Back to Games
              </Link>
              <Link
                href='/app/new'
                className='w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-green-700 transition-colors'>
                <FontAwesomeIcon icon={faPlus} className='mr-2' />
                New Game
              </Link>
            </div>
          </div>
        </div>
      )}

      {editingScore && (
        <div className='fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50'>
          <div className='bg-background p-6 rounded-lg shadow-2xl w-full max-w-sm border border-border'>
            <div className='flex justify-between items-center mb-4'>
              <h3 className='text-lg font-bold text-foreground'>Edit Score</h3>
              <button
                onClick={() => setEditingScore(null)}
                className='text-foreground/60 cursor-pointer'>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <input
              type='number'
              value={editingValue}
              onChange={(e) => setEditingValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleEditScore()}
              className='w-full p-3 bg-foreground/5 border-2 border-border rounded-lg mb-4 text-center text-2xl font-bold focus:border-primary focus:ring-1 focus:ring-primary'
              autoFocus
            />
            <button
              onClick={handleEditScore}
              className='w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-green-700 transition-colors cursor-pointer'>
              Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
