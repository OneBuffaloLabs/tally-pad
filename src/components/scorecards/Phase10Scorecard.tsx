'use client';

import { useState, useMemo, useEffect } from 'react';
import { useDb } from '@/contexts/DbContext';
import { getGame, updateGame } from '@/lib/database';
import Link from 'next/link';
import { Game, Phase10Round } from '@/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faTrophy, faPlus, faCheck, faTrash } from '@fortawesome/free-solid-svg-icons';

// --- Type Definitions for this Component ---
interface Phase10ScorecardProps {
  game: Game;
}
interface PlayerStats {
  totalScore: number;
  currentPhase: number;
}

// --- Reusable Components ---
const ScoreInputModal = ({
  player,
  round,
  onSave,
  onClose,
}: {
  player: string;
  round: Phase10Round;
  onSave: (score: number, phaseCompleted: boolean) => void;
  onClose: () => void;
}) => {
  const [score, setScore] = useState(round[player]?.score.toString() || '');
  const [phaseCompleted, setPhaseCompleted] = useState(round[player]?.phaseCompleted || false);

  return (
    <div className='fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50'>
      <div className='bg-background p-6 rounded-lg shadow-2xl w-full max-w-sm border border-border'>
        <h3 className='text-lg font-bold mb-2 text-foreground'>
          Enter Score for <span className='text-primary'>{player}</span>
        </h3>
        <input
          type='number'
          value={score}
          onChange={(e) => e.target.value.length <= 3 && setScore(e.target.value)}
          className='w-full p-3 bg-foreground/5 border-2 border-border rounded-lg mb-4 text-center text-2xl font-bold focus:border-primary focus:ring-1 focus:ring-primary'
          placeholder='0'
          autoFocus
        />
        <div className='flex items-center gap-4 mb-6'>
          <input
            type='checkbox'
            id='phaseCompletedCheckbox'
            checked={phaseCompleted}
            onChange={() => setPhaseCompleted(!phaseCompleted)}
            className='h-6 w-6 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer'
          />
          <label
            htmlFor='phaseCompletedCheckbox'
            className='text-foreground font-medium cursor-pointer'>
            Completed their phase this round?
          </label>
        </div>
        <div className='grid grid-cols-2 gap-2'>
          <button
            onClick={() => onSave(parseInt(score, 10) || 0, phaseCompleted)}
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

export default function Phase10Scorecard({ game: initialGame }: Phase10ScorecardProps) {
  const { db } = useDb();
  const [game, setGame] = useState(initialGame);
  const [editingCell, setEditingCell] = useState<{
    player: string;
    roundIndex: number;
  } | null>(null);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [winners, setWinners] = useState<{ name: string; score: number }[]>([]);
  const isCompleted = game.status === 'Completed';
  const roundCount = game.phase10Rounds?.length || 0;

  const playerStats = useMemo<Record<string, PlayerStats>>(() => {
    const stats: Record<string, PlayerStats> = {};
    game.players.forEach((player) => {
      let totalScore = 0;
      let currentPhase = 1;
      (game.phase10Rounds || []).forEach((round) => {
        if (round[player]) {
          totalScore += round[player].score;
          if (round[player].phaseCompleted) {
            currentPhase++;
          }
        }
      });
      stats[player] = { totalScore, currentPhase };
    });
    return stats;
  }, [game.phase10Rounds, game.players]);

  const canFinishGame = useMemo(
    () => Object.values(playerStats).some((stat) => stat.currentPhase > 10),
    [playerStats]
  );

  const calculateWinners = () => {
    const completers = game.players.filter((p) => (playerStats[p]?.currentPhase ?? 0) > 10);

    if (completers.length > 0) {
      let lowestScore = Infinity;
      let currentWinners: { name: string; score: number }[] = [];
      completers.forEach((player) => {
        const playerScore = playerStats[player]?.totalScore ?? 0;
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

  useEffect(() => {
    if (isCompleted) {
      calculateWinners();
    }
  }, [isCompleted, playerStats]);

  const updateAndSetGame = async (updates: Partial<Game>) => {
    if (!db || !game._id) return;

    try {
      const response = await updateGame(db, game._id, updates);
      setGame((currentGame) => ({
        ...currentGame,
        ...updates,
        _rev: response.rev,
      }));
    } catch (error) {
      console.error('Failed to update game:', error);
      // If a conflict occurs, refetch the latest game state to resolve it
      if ((error as any).name === 'conflict' && game._id) {
        const freshGame = await getGame(db, game._id);
        setGame(freshGame);
      }
    }
  };

  const handleAddRound = () => {
    if (isCompleted || roundCount >= 25) return;
    const newRound: Phase10Round = {};
    game.players.forEach((player) => {
      newRound[player] = { score: 0, phaseCompleted: false };
    });
    const newRounds = [...(game.phase10Rounds || []), newRound];
    updateAndSetGame({ phase10Rounds: newRounds });
  };

  const handleRemoveRound = () => {
    if (isCompleted || roundCount <= 1) return; // Prevent removing the last round
    const newRounds = (game.phase10Rounds || []).slice(0, -1);
    updateAndSetGame({ phase10Rounds: newRounds });
  };

  const handleScoreChange = (
    player: string,
    roundIndex: number,
    score: number,
    phaseCompleted: boolean
  ) => {
    const newRounds = JSON.parse(JSON.stringify(game.phase10Rounds || []));
    newRounds[roundIndex][player] = { score, phaseCompleted };
    updateAndSetGame({ phase10Rounds: newRounds });
    setEditingCell(null);
  };

  const handleFinishGame = async () => {
    if (isCompleted || !canFinishGame || !db || !game._id) return;
    calculateWinners();
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
            disabled={isCompleted || roundCount >= 25}
            className='bg-secondary cursor-pointer text-white font-semibold px-4 py-2 rounded-full text-sm hover:bg-blue-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed'>
            <FontAwesomeIcon icon={faPlus} className='mr-2' />
            Add Round
          </button>
          <button
            onClick={handleRemoveRound}
            disabled={isCompleted || roundCount <= 1}
            className='bg-red-600 cursor-pointer text-white font-semibold px-4 py-2 rounded-full text-sm hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed'>
            <FontAwesomeIcon icon={faTrash} className='mr-2' />
            Remove Round
          </button>
          <button
            onClick={handleFinishGame}
            disabled={isCompleted || !canFinishGame}
            className='bg-primary cursor-pointer text-white font-semibold px-4 py-2 rounded-full text-sm hover:bg-green-700 transition-colors disabled:bg-gray-400'>
            <FontAwesomeIcon icon={faTrophy} className='mr-2' />
            Finish
          </button>
          <Link
            href='/app'
            className='bg-gray-200 text-foregroundfont-semibold px-4 py-2 rounded-full text-sm hover:bg-foreground/20 transition-colors'>
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
        className={`shadow-lg rounded-xl overflow-hidden ${
          isCompleted ? 'opacity-75 pointer-events-none' : ''
        }`}>
        <div className='overflow-x-auto'>
          <table className='min-w-full bg-foreground/5'>
            <thead className='sticky bg-secondary z-20'>
              <tr>
                <th className='p-3 font-bold text-gray-200 text-sm tracking-wider text-left min-w-[100px]'>
                  Round
                </th>
                {game.players.map((player) => (
                  <th
                    key={player}
                    className='p-3 font-bold text-gray-200 text-sm tracking-wider text-center min-w-[120px]'>
                    <div className='text-lg font-extrabold truncate'>{player}</div>
                    <div className='font-semibold text-primary mt-2 text-xl'>
                      {playerStats[player]?.currentPhase > 10 ? (
                        <span className='text-accent flex items-center justify-center gap-2'>
                          Phase 10 <FontAwesomeIcon icon={faTrophy} size='xs' />
                        </span>
                      ) : (
                        `Phase ${playerStats[player]?.currentPhase}`
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className='divide-y divide-border'>
              {(game.phase10Rounds || []).map((round, roundIndex) => (
                <tr key={roundIndex} className='bg-foreground/5 even:bg-gray-50'>
                  <td className='p-3 text-left font-bold text-foreground/70'>{roundIndex + 1}</td>
                  {game.players.map((player) => (
                    <td
                      key={player}
                      onClick={() => setEditingCell({ player, roundIndex })}
                      className='p-3 text-center cursor-pointer hover:bg-primary/10 transition-colors'>
                      <span
                        className={`font-medium ${
                          round[player]?.phaseCompleted ? 'text-primary' : ''
                        }`}>
                        {round[player]?.score ?? '-'}
                      </span>
                      {round[player]?.phaseCompleted && (
                        <FontAwesomeIcon icon={faCheck} className='text-primary ml-1' size='xs' />
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
          round={(game.phase10Rounds || [])[editingCell.roundIndex]}
          onSave={(score, phaseCompleted) =>
            handleScoreChange(editingCell.player, editingCell.roundIndex, score, phaseCompleted)
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
