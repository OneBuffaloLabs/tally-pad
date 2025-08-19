'use client';

import { useState, useMemo, useEffect } from 'react';
import { useDb } from '@/contexts/DbContext';
import { updateGame } from '@/lib/database';
import Link from 'next/link';
import { Game } from '@/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faTrophy } from '@fortawesome/free-solid-svg-icons';

interface GolfScorecardProps {
  game: Game;
}

export default function GolfScorecard({ game: initialGame }: GolfScorecardProps) {
  const { db } = useDb();
  const [game, setGame] = useState(initialGame);
  const [editingCell, setEditingCell] = useState<{
    player: string;
    holeIndex: number;
  } | null>(null);
  const [scoreInput, setScoreInput] = useState('');
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [winners, setWinners] = useState<{ name: string; score: number }[]>([]);
  const isCompleted = game.status === 'Completed';

  const totals = useMemo(() => {
    const playerTotals: { [key: string]: number } = {};
    game.players.forEach((player) => {
      const playerScores = game.scores?.[player]?.rounds || [];
      playerTotals[player] = playerScores.reduce((acc, score) => acc + (score || 0), 0);
    });
    return playerTotals;
  }, [game.scores, game.players]);

  const totalPar = useMemo(() => {
    return (game.golfRounds || []).reduce((acc, round) => acc + round.par, 0);
  }, [game.golfRounds]);

  const winningScore = useMemo(() => {
    const scores = Object.values(totals);
    return scores.length > 0 ? Math.min(...scores) : 0;
  }, [totals]);

  useEffect(() => {
    if (isCompleted) {
      const currentWinners = game.players
        .filter((p) => totals[p] === winningScore)
        .map((name) => ({ name, score: winningScore }));
      setWinners(currentWinners);
    }
  }, [isCompleted, game.players, totals, winningScore]);

  const updateAndSetGame = async (updates: Partial<Game>) => {
    if (!db || !game._id) return;
    const updatedGame = { ...game, ...updates, lastPlayed: Date.now() };
    setGame(updatedGame);
    await updateGame(db, game._id, { ...updates, lastPlayed: Date.now() });
  };

  const handleScoreChange = async (player: string, holeIndex: number, score: number | null) => {
    if (isCompleted) return;
    const newScores = { ...game.scores };
    if (!newScores[player]) newScores[player] = { rounds: [] };
    const rounds = [...(newScores[player].rounds || [])];
    rounds[holeIndex] = score || 0;
    newScores[player].rounds = rounds;
    await updateAndSetGame({ scores: newScores });
    setEditingCell(null);
    setScoreInput('');
  };

  const handleFinishGame = async () => {
    if (isCompleted || !db || !game._id) return;
    setShowWinnerModal(true);
    await updateAndSetGame({ status: 'Completed' });
  };

  const openModal = (player: string, holeIndex: number) => {
    if (isCompleted) return;
    const currentScore = game.scores?.[player]?.rounds?.[holeIndex];
    setScoreInput(currentScore ? String(currentScore) : '');
    setEditingCell({ player, holeIndex });
  };

  return (
    <div className='p-4 sm:p-6 lg:p-8'>
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
            className='bg-secondary/10 text-secondary font-semibold px-4 py-2 rounded-full text-sm hover:bg-secondary/20 transition-colors'>
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

      <div
        className={`overflow-x-auto shadow-lg rounded-xl ${
          isCompleted ? 'opacity-75 pointer-events-none' : ''
        }`}>
        <table className='min-w-full bg-foreground/5 border-collapse'>
          <thead className='bg-secondary text-white font-extrabold text-lg'>
            <tr>
              <th className='p-3 text-center font-bol tracking-wider w-1/4 border-b-2 border-border'>
                Hole
              </th>
              <th className='p-3 text-center font-bol tracking-wider w-1/4 border-b-2 border-border'>
                Par
              </th>
              {game.players.map((player) => (
                <th
                  key={player}
                  className={`p-3 font-bold tracking-wider text-center border-b-2 border-border ${
                    totals[player] === winningScore && !isCompleted ? 'text-accent' : ''
                  }`}>
                  {player}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {game.golfRounds?.map((round, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-foreground/5' : 'bg-foreground/10'}>
                <td className='p-3 text-center font-semibold text-foreground/80 border-b border-border'>
                  {index + 1}
                </td>
                <td className='p-3 text-center text-foreground/60 border-b border-border'>
                  {round.par}
                </td>
                {game.players.map((player) => (
                  <td
                    key={player}
                    className='p-3 text-center cursor-pointer hover:bg-primary/10 transition-colors font-medium border-b border-border'
                    onClick={() => openModal(player, index)}>
                    {game.scores?.[player]?.rounds?.[index] ?? (
                      <span className='text-foreground/20'>-</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          <tfoot className='bg-secondary text-white font-extrabold text-lg'>
            <tr>
              <td className='p-4 text-center'>Grand Total</td>
              <td className='p-4 text-center'>{totalPar}</td>
              {game.players.map((player) => (
                <td key={player} className='p-4 text-center'>
                  {totals[player] ?? 0}
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>

      {editingCell && (
        <div className='fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50'>
          <div className='bg-background p-6 rounded-lg shadow-2xl w-full max-w-sm border border-border'>
            <h3 className='text-lg font-bold mb-2 text-foreground'>
              Enter Score for Hole {editingCell.holeIndex + 1}
            </h3>
            <p className='text-sm text-foreground/60 mb-4'>
              For <span className='font-bold text-primary'>{editingCell.player}</span>
            </p>
            <input
              type='number'
              value={scoreInput}
              onChange={(e) => {
                if (e.target.value.length <= 2) {
                  setScoreInput(e.target.value);
                }
              }}
              className='w-full p-3 bg-foreground/5 border-2 border-border rounded-lg mb-4 text-center text-2xl font-bold focus:border-primary focus:ring-1 focus:ring-primary'
              placeholder='0'
              autoFocus
            />
            <div className='grid grid-cols-2 gap-2'>
              <button
                onClick={() =>
                  handleScoreChange(
                    editingCell.player,
                    editingCell.holeIndex,
                    parseInt(scoreInput, 10) || 0
                  )
                }
                className='w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-green-700 transition-colors cursor-pointer'>
                Save Score
              </button>
              <button
                onClick={() => setEditingCell(null)}
                className='w-full bg-gray-500 text-white font-semibold py-3 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer'>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
