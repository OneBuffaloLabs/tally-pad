'use client';

import { useState, useMemo, useEffect } from 'react';
import { useDb } from '@/contexts/DbContext';
import { updateGame } from '@/lib/database';
import Link from 'next/link';
import { Game } from '@/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faTrophy, faPlus, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';

// --- Type Definitions for this Component ---
interface Phase10ScorecardProps {
  game: Game;
}
interface PlayerTotals {
  totalScore: number;
  phasesCompleted: number;
}

// --- Constants ---
const phases = [
  '2 sets of 3',
  '1 set of 3 + 1 run of 4',
  '1 set of 4 + 1 run of 4',
  '1 run of 7',
  '1 run of 8',
  '1 run of 9',
  '2 sets of 4',
  '7 cards of one color',
  '1 set of 5 + 1 set of 2',
  '1 set of 5 + 1 set of 3',
];

export default function Phase10Scorecard({ game: initialGame }: Phase10ScorecardProps) {
  const { db } = useDb();
  const [game, setGame] = useState(initialGame);
  const [editingCell, setEditingCell] = useState<{
    player: string;
    phaseIndex: number;
  } | null>(null);
  const [scoreInput, setScoreInput] = useState('');
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [winners, setWinners] = useState<{ name: string; score: number }[]>([]);
  const isCompleted = game.status === 'Completed';

  const totals = useMemo(() => {
    const playerTotals: { [key: string]: PlayerTotals } = {};
    game.players.forEach((player) => {
      const playerScores = game.scores?.[player] || {};
      let totalScore = 0;
      let phasesCompleted = 0;
      phases.forEach((_, index) => {
        if (typeof playerScores[`phase-${index}-score`] === 'number') {
          totalScore += playerScores[`phase-${index}-score`] as number;
        }
        if (playerScores[`phase-${index}-completed`]) {
          phasesCompleted++;
        }
      });
      playerTotals[player] = {
        totalScore,
        phasesCompleted,
      };
    });
    return playerTotals;
  }, [game.scores, game.players]);

  // Calculate winners when the component loads if the game is already completed
  useEffect(() => {
    if (isCompleted) {
      calculateWinners();
    }
  }, [isCompleted, game.players, totals]);

  const calculateWinners = () => {
    let phase10Completers: string[] = [];
    game.players.forEach((player) => {
      if (totals[player]?.phasesCompleted === 10) {
        phase10Completers.push(player);
      }
    });

    if (phase10Completers.length > 0) {
      let lowestScore = Infinity;
      let currentWinners: { name: string; score: number }[] = [];
      phase10Completers.forEach((player) => {
        const playerScore = totals[player]?.totalScore ?? 0;
        if (playerScore < lowestScore) {
          lowestScore = playerScore;
          currentWinners = [{ name: player, score: playerScore }];
        } else if (playerScore === lowestScore) {
          currentWinners.push({ name: player, score: playerScore });
        }
      });
      setWinners(currentWinners);
    } else {
      // Handle scenario where game is finished but no one completed phase 10
      let highestPhase = -1;
      game.players.forEach((player) => {
        const playerPhases = totals[player]?.phasesCompleted ?? 0;
        if (playerPhases > highestPhase) {
          highestPhase = playerPhases;
        }
      });

      const playersOnHighestPhase = game.players.filter(
        (player) => (totals[player]?.phasesCompleted ?? 0) === highestPhase
      );

      let lowestScore = Infinity;
      let currentWinners: { name: string; score: number }[] = [];
      playersOnHighestPhase.forEach((player) => {
        const playerScore = totals[player]?.totalScore ?? 0;
        if (playerScore < lowestScore) {
          lowestScore = playerScore;
          currentWinners = [{ name: player, score: playerScore }];
        } else if (playerScore === lowestScore) {
          currentWinners.push({ name: player, score: playerScore });
        }
      });
      setWinners(currentWinners);
    }
  };

  const updateAndSetGame = async (updates: Partial<Game>) => {
    if (!db || !game._id) return;
    const updatedGame = { ...game, ...updates };
    setGame(updatedGame);
    await updateGame(db, game._id, updates);
  };

  const handleScoreChange = async (player: string, phaseIndex: number, score: number | null) => {
    if (isCompleted || !db || !game._id) return;

    const newScores = { ...game.scores };
    if (!newScores[player]) newScores[player] = {};
    if (score === null) {
      delete newScores[player][`phase-${phaseIndex}-score`];
    } else {
      newScores[player][`phase-${phaseIndex}-score`] = score;
    }

    await updateAndSetGame({ scores: newScores });
    setEditingCell(null);
    setScoreInput('');
  };

  const handlePhaseCompletionToggle = async (player: string, phaseIndex: number) => {
    if (isCompleted || !db || !game._id) return;
    const newScores = { ...game.scores };
    if (!newScores[player]) newScores[player] = {};

    const currentStatus = newScores[player][`phase-${phaseIndex}-completed`];
    newScores[player][`phase-${phaseIndex}-completed`] = !currentStatus;

    await updateAndSetGame({ scores: newScores });
  };

  const handleFinishGame = async () => {
    if (isCompleted || !db || !game._id) return;
    calculateWinners();
    setShowWinnerModal(true);
    await updateAndSetGame({ status: 'Completed' });
  };

  const openModal = (player: string, phaseIndex: number) => {
    if (isCompleted) return; // Prevent opening modal for completed games
    const currentScore = game.scores?.[player]?.[`phase-${phaseIndex}-score`];
    const scoreString =
      currentScore !== undefined && currentScore !== null ? String(currentScore) : '';
    setScoreInput(scoreString);
    setEditingCell({ player, phaseIndex });
  };

  const getActivePhaseIndex = (player: string): number => {
    for (let i = 0; i < phases.length; i++) {
      if (!game.scores?.[player]?.[`phase-${i}-completed`]) {
        return i;
      }
    }
    return -1; // All phases completed
  };

  return (
    <div className='p-4 sm:p-6 lg:p-8'>
      {/* Header */}
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

      {/* Winner Banner */}
      {isCompleted && winners.length > 0 && (
        <div className='bg-primary/10 border-l-4 border-primary text-green-800 dark:text-primary p-4 rounded-lg mb-6'>
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

      {/* Score Table */}
      <div
        className={`overflow-x-auto shadow-lg rounded-xl ${
          isCompleted ? 'opacity-75 pointer-events-none' : ''
        }`}>
        <div className='min-w-full bg-white dark:bg-foreground/5'>
          {/* Sticky Header */}
          <div className='sticky top-0 bg-gray-50 dark:bg-foreground/10 z-10 grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 border-b-2 border-border'>
            <div className='p-3 font-bold text-secondary text-sm tracking-wider col-span-1'>
              Phase
            </div>
            {game.players.map((player) => (
              <div
                key={player}
                className='p-3 font-bold text-secondary text-sm tracking-wider text-center col-span-1'>
                <div className='truncate'>{player}</div>
                <div className='text-2xl text-foreground font-extrabold'>
                  {totals[player]?.totalScore ?? 0}
                </div>
              </div>
            ))}
          </div>

          {/* Score Rows */}
          <div>
            {phases.map((phase, phaseIndex) => {
              return (
                <div
                  key={phase}
                  className='grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 border-b border-border'>
                  <div className='p-3 font-semibold text-foreground/80 col-span-1'>
                    <span className='font-bold text-primary'>{phaseIndex + 1}: </span>
                    {phase}
                  </div>
                  {game.players.map((player) => {
                    const isPhaseCompleted =
                      !!game.scores?.[player]?.[`phase-${phaseIndex}-completed`];
                    const isActivePhase = getActivePhaseIndex(player) === phaseIndex;
                    return (
                      <div
                        key={player}
                        className={`p-3 text-center col-span-1 flex items-center justify-center gap-2 transition-colors ${
                          isPhaseCompleted ? 'bg-gray-100 dark:bg-foreground/5' : ''
                        } ${isActivePhase ? 'bg-accent/20' : ''}`}>
                        <button
                          onClick={() => handlePhaseCompletionToggle(player, phaseIndex)}
                          className={`w-6 h-6 rounded-md flex items-center justify-center border-2 transition-colors ${
                            isPhaseCompleted
                              ? 'bg-primary border-primary text-white'
                              : 'bg-transparent border-border hover:border-primary'
                          }`}>
                          {isPhaseCompleted && <FontAwesomeIcon icon={faCheck} size='xs' />}
                        </button>
                        <div
                          className='font-medium cursor-pointer p-2 rounded-md hover:bg-primary/10 w-16 text-center'
                          onClick={() => openModal(player, phaseIndex)}>
                          {game.scores?.[player]?.[`phase-${phaseIndex}-score`] ?? (
                            <span className='text-foreground/20'>-</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Score Input Modal */}
      {editingCell && (
        <div className='fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50'>
          <div className='bg-background p-6 rounded-lg shadow-2xl w-full max-w-sm border border-border'>
            <h3 className='text-lg font-bold mb-2 text-foreground'>Enter Score for Round</h3>
            <p className='text-sm text-foreground/60 mb-4'>
              For <span className='font-bold text-primary'>{editingCell.player}</span>
            </p>
            <input
              type='number'
              value={scoreInput}
              onChange={(e) => {
                if (e.target.value.length <= 3) {
                  setScoreInput(e.target.value);
                }
              }}
              className='w-full p-3 bg-white dark:bg-foreground/5 border-2 border-border rounded-lg mb-4 text-center text-2xl font-bold focus:border-primary focus:ring-1 focus:ring-primary'
              placeholder='0'
              autoFocus
            />
            <div className='grid grid-cols-2 gap-2'>
              <button
                onClick={() =>
                  handleScoreChange(
                    editingCell.player,
                    editingCell.phaseIndex,
                    parseInt(scoreInput, 10) || 0
                  )
                }
                className='w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-green-700 transition-colors cursor-pointer'>
                Save Score
              </button>
              <button
                onClick={() => handleScoreChange(editingCell.player, editingCell.phaseIndex, null)}
                className='w-full bg-gray-500 text-white font-semibold py-3 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer'>
                Clear
              </button>
            </div>
            <button
              onClick={() => setEditingCell(null)}
              className='w-full text-center text-sm text-foreground/60 hover:text-primary cursor-pointer mt-4'>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Winner Modal */}
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
                className='w-full bg-secondary text-white font-bold py-3 rounded-lg hover:bg-blue-800 transition-colors'>
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
    </div>
  );
}
