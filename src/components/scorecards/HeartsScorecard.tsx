'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useDb } from '@/contexts/DbContext';
import { getGame, updateGame } from '@/lib/database';
import Link from 'next/link';
import { Game, HeartsRound } from '@/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faTrophy, faPlus, faTrash, faMoon } from '@fortawesome/free-solid-svg-icons';

interface HeartsScorecardProps {
  game: Game;
}

interface PlayerStats {
  totalScore: number;
}

interface ScoreInputModalProps {
  player: string;
  round: HeartsRound;
  onSave: (score: number, shotTheMoon: boolean) => void;
  onClose: () => void;
}

const ScoreInputModal = ({ player, round, onSave, onClose }: ScoreInputModalProps) => {
  const [score, setScore] = useState(round[player]?.score.toString() || '0');
  const [shotTheMoon, setShotTheMoon] = useState(round[player]?.shotTheMoon || false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current && !shotTheMoon) {
      inputRef.current.focus();
    }
  }, [shotTheMoon]);

  const handleShootMoonChange = (checked: boolean) => {
    setShotTheMoon(checked);
    if (checked) {
      setScore('0'); // Player gets 0 if they shoot the moon
    }
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50'>
      <div className='bg-background p-6 rounded-lg shadow-2xl w-full max-w-sm border border-border'>
        <h3 className='text-lg font-bold mb-2 text-foreground'>
          Enter Score for <span className='text-primary'>{player}</span>
        </h3>

        <div className='mb-6 bg-foreground/5 p-3 rounded-lg flex items-center gap-3'>
          <input
            type='checkbox'
            id='shotTheMoonCheckbox'
            checked={shotTheMoon}
            onChange={(e) => handleShootMoonChange(e.target.checked)}
            className='h-5 w-5 rounded border-gray-300 text-accent focus:ring-accent cursor-pointer'
          />
          <label
            htmlFor='shotTheMoonCheckbox'
            className='text-foreground font-bold cursor-pointer flex items-center gap-2'>
            <FontAwesomeIcon
              icon={faMoon}
              className={shotTheMoon ? 'text-accent' : 'text-foreground/40'}
            />
            Shot the Moon?
          </label>
        </div>

        {!shotTheMoon && (
          <div className='mb-4'>
            <label className='block text-sm font-medium text-foreground/70 mb-1'>
              Points Taken (0-26)
            </label>
            <input
              ref={inputRef}
              type='number'
              min='0'
              max='26'
              value={score}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (!isNaN(val) && val >= 0 && val <= 26) {
                  setScore(e.target.value);
                } else if (e.target.value === '') {
                  setScore('');
                }
              }}
              className='w-full p-3 bg-foreground/5 border-2 border-border rounded-lg text-center text-2xl font-bold focus:border-primary focus:ring-1 focus:ring-primary'
              placeholder='0'
            />
          </div>
        )}

        {shotTheMoon && (
          <p className='text-sm text-foreground/60 mb-4 text-center italic'>
            Active player gets 0 points. All opponents get 26 points.
          </p>
        )}

        <div className='grid grid-cols-2 gap-2'>
          <button
            onClick={() => onSave(parseInt(score, 10) || 0, shotTheMoon)}
            className='w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-green-700 transition-colors cursor-pointer'>
            Save
          </button>
          <button
            onClick={onClose}
            className='w-full bg-gray-500 text-white font-semibold py-3 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer'>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default function HeartsScorecard({ game: initialGame }: HeartsScorecardProps) {
  const { db } = useDb();
  const [game, setGame] = useState(initialGame);
  const [editingCell, setEditingCell] = useState<{ player: string; roundIndex: number } | null>(
    null
  );
  const [showWinnerModal, setShowWinnerModal] = useState(false);

  const isCompleted = game.status === 'Completed';

  // --- Derived State ---
  const playerStats = useMemo<Record<string, PlayerStats>>(() => {
    const stats: Record<string, PlayerStats> = {};
    game.players.forEach((player) => {
      let totalScore = 0;
      (game.heartsRounds || []).forEach((round) => {
        if (round[player]) {
          totalScore += round[player].score;
        }
      });
      stats[player] = { totalScore };
    });
    return stats;
  }, [game.heartsRounds, game.players]);

  const winners = useMemo(() => {
    if (!isCompleted && game.status !== 'Completed') return [];

    let lowestScore = Infinity;
    let currentWinners: { name: string; score: number }[] = [];

    game.players.forEach((player) => {
      const playerScore = playerStats[player]?.totalScore ?? 0;
      if (playerScore < lowestScore) {
        lowestScore = playerScore;
        currentWinners = [{ name: player, score: playerScore }];
      } else if (playerScore === lowestScore) {
        currentWinners.push({ name: player, score: playerScore });
      }
    });
    return currentWinners;
  }, [isCompleted, game.status, game.players, playerStats]);

  const leader = useMemo(() => {
    let lowestScore = Infinity;
    let leaders: string[] = [];
    game.players.forEach((player) => {
      const score = playerStats[player]?.totalScore ?? 0;
      if (score < lowestScore) {
        lowestScore = score;
        leaders = [player];
      } else if (score === lowestScore) {
        leaders.push(player);
      }
    });
    return leaders;
  }, [playerStats, game.players]);

  // --- Actions ---
  const updateAndSetGame = async (updates: Partial<Game>) => {
    if (!db || !game._id) return;
    try {
      const updatesWithTimestamp = { ...updates, lastPlayed: Date.now() };
      const response = await updateGame(db, game._id, updatesWithTimestamp);
      setGame((currentGame) => ({ ...currentGame, ...updatesWithTimestamp, _rev: response.rev }));
    } catch (error) {
      console.error('Failed to update game:', error);
      if ((error as { name?: string }).name === 'conflict' && game._id) {
        const freshGame = await getGame(db, game._id);
        if (freshGame) setGame(freshGame);
      }
    }
  };

  const handleAddRound = () => {
    if (isCompleted) return;
    const newRound: HeartsRound = {};
    game.players.forEach((player) => {
      newRound[player] = { score: 0, shotTheMoon: false };
    });
    const newRounds = [...(game.heartsRounds || []), newRound];
    updateAndSetGame({ heartsRounds: newRounds });
  };

  const handleRemoveRound = () => {
    if (isCompleted || (game.heartsRounds?.length || 0) <= 1) return;
    const newRounds = (game.heartsRounds || []).slice(0, -1);
    updateAndSetGame({ heartsRounds: newRounds });
  };

  const handleScoreChange = (
    player: string,
    roundIndex: number,
    score: number,
    shotTheMoon: boolean
  ) => {
    const newRounds = JSON.parse(JSON.stringify(game.heartsRounds || []));
    if (!newRounds[roundIndex]) newRounds[roundIndex] = {};

    // Standard update for the active player
    newRounds[roundIndex][player] = { score, shotTheMoon };

    // "Shoot the Moon" Logic:
    // If THIS player shot the moon, force all OTHER players to have 26 points and shotTheMoon = false
    if (shotTheMoon) {
      game.players.forEach((p) => {
        if (p !== player) {
          newRounds[roundIndex][p] = { score: 26, shotTheMoon: false };
        }
      });
    } else {
      // If this player was PREVIOUSLY shooting the moon but unchecked it,
      // we might want to reset the others, but standard scoring usually implies manual entry anyway.
      // For safety/UX, if we uncheck 'Shoot the Moon', we don't auto-reset others to 0
      // because they might have actual points. We just save the current player's change.
      // However, we must ensure no TWO players have "shotTheMoon" true in the same round.
      // (Though logically impossible in Hearts, the UI should enforce it).
      // Since we only edit one cell at a time, the logic above handles the 'setting' of true.
    }

    updateAndSetGame({ heartsRounds: newRounds });
    setEditingCell(null);
  };

  const handleFinishGame = async () => {
    if (isCompleted || !db || !game._id) return;
    setShowWinnerModal(true);
    await updateAndSetGame({ status: 'Completed' });
  };

  return (
    <div className='p-4 sm:p-6 lg:p-8'>
      {/* Header & Controls */}
      <div className='flex flex-col sm:flex-row justify-between items-center mb-6 gap-4'>
        <h1 className='text-3xl font-bold text-foreground'>{game.name}</h1>
        <div className='flex items-center gap-2 flex-wrap justify-center'>
          <button
            onClick={handleAddRound}
            disabled={isCompleted}
            className='bg-secondary cursor-pointer text-white font-semibold px-4 py-2 rounded-full text-sm hover:bg-blue-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed'>
            <FontAwesomeIcon icon={faPlus} className='mr-2' />
            Add Hand
          </button>
          <button
            onClick={handleRemoveRound}
            disabled={isCompleted || (game.heartsRounds?.length || 0) <= 1}
            className='bg-red-600 cursor-pointer text-white font-semibold px-4 py-2 rounded-full text-sm hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed'>
            <FontAwesomeIcon icon={faTrash} className='mr-2' />
            Remove Hand
          </button>
          <button
            onClick={handleFinishGame}
            disabled={isCompleted}
            className='bg-primary cursor-pointer text-white font-semibold px-4 py-2 rounded-full text-sm hover:bg-green-700 transition-colors disabled:bg-gray-400'>
            <FontAwesomeIcon icon={faTrophy} className='mr-2' />
            Finish
          </button>
          <Link
            href='/app'
            className='bg-gray-200 text-foreground font-semibold px-4 py-2 rounded-full text-sm hover:bg-foreground/20 transition-colors'>
            <FontAwesomeIcon icon={faArrowLeft} className='mr-2' />
            Back
          </Link>
        </div>
      </div>

      {/* Winner Banner */}
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

      {/* Score Table */}
      <div
        className={`shadow-lg rounded-xl overflow-hidden ${isCompleted ? 'opacity-75 pointer-events-none' : ''}`}>
        <div className='overflow-x-auto'>
          <table className='min-w-full bg-foreground/5'>
            <thead className='sticky bg-secondary z-20'>
              <tr>
                <th className='p-3 font-bold text-gray-200 text-sm tracking-wider text-left min-w-[80px]'>
                  Hand
                </th>
                {game.players.map((player) => (
                  <th
                    key={player}
                    className={`p-3 font-bold text-sm tracking-wider text-center min-w-[100px] ${leader.includes(player) && !isCompleted ? 'text-accent' : 'text-gray-200'}`}>
                    <div className='text-lg font-extrabold truncate'>{player}</div>
                    {leader.includes(player) && !isCompleted && (
                      <div className='text-xs font-normal opacity-80'>Winning</div>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className='divide-y divide-border'>
              {(game.heartsRounds || []).map((round, roundIndex) => (
                <tr key={roundIndex} className='bg-foreground/5 even:bg-gray-50'>
                  <td className='p-3 text-left font-bold text-foreground/70'>{roundIndex + 1}</td>
                  {game.players.map((player) => (
                    <td
                      key={player}
                      onClick={() => setEditingCell({ player, roundIndex })}
                      className='p-3 text-center cursor-pointer hover:bg-primary/10 transition-colors relative'>
                      <span
                        className={`font-medium ${round[player]?.shotTheMoon ? 'text-accent font-bold' : ''}`}>
                        {round[player]?.score ?? '-'}
                      </span>
                      {round[player]?.shotTheMoon && (
                        <div className='absolute top-1 right-1 text-accent'>
                          <FontAwesomeIcon icon={faMoon} size='xs' />
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
            <tfoot className='sticky bottom-0 bg-gray-700 z-10'>
              <tr>
                <td className='p-2 text-left font-bold text-gray-200'>Total</td>
                {game.players.map((player) => (
                  <td key={player} className='p-2 text-center font-bold text-lg text-gray-200'>
                    {playerStats[player]?.totalScore ?? 0}
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Modals */}
      {editingCell && (
        <ScoreInputModal
          player={editingCell.player}
          round={(game.heartsRounds || [])[editingCell.roundIndex] || {}}
          onSave={(score, shotTheMoon) =>
            handleScoreChange(editingCell.player, editingCell.roundIndex, score, shotTheMoon)
          }
          onClose={() => setEditingCell(null)}
        />
      )}

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
    </div>
  );
}
