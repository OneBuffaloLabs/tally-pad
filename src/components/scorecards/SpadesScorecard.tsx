'use client';

import { useState, useMemo } from 'react';
import { useDb } from '@/contexts/DbContext';
import { getGame, updateGame } from '@/lib/database';
import Link from 'next/link';
import { Game, SpadesRound } from '@/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faTrophy, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';

interface SpadesScorecardProps {
  game: Game;
}

interface TeamStats {
  totalScore: number;
  totalBags: number;
}

const ScoreInputModal = ({
  roundData,
  onSave,
  onClose,
}: {
  roundData?: SpadesRound;
  onSave: (data: SpadesRound) => void;
  onClose: () => void;
}) => {
  // Team 1 State
  const [t1Bid, setT1Bid] = useState(roundData?.team1.bid?.toString() || '');
  const [t1Tricks, setT1Tricks] = useState(roundData?.team1.tricks?.toString() || '');

  // Team 2 State
  const [t2Bid, setT2Bid] = useState(roundData?.team2.bid?.toString() || '');
  const [t2Tricks, setT2Tricks] = useState(roundData?.team2.tricks?.toString() || '');

  const calculateScore = (bid: number, tricks: number) => {
    if (tricks < bid) {
      return { score: -(bid * 10), bags: 0 };
    } else {
      const bags = tricks - bid;
      return { score: bid * 10 + bags, bags };
    }
  };

  const handleSave = () => {
    const b1 = parseInt(t1Bid) || 0;
    const tr1 = parseInt(t1Tricks) || 0;
    const b2 = parseInt(t2Bid) || 0;
    const tr2 = parseInt(t2Tricks) || 0;

    const t1Result = calculateScore(b1, tr1);
    const t2Result = calculateScore(b2, tr2);

    onSave({
      team1: { bid: b1, tricks: tr1, bags: t1Result.bags, score: t1Result.score },
      team2: { bid: b2, tricks: tr2, bags: t2Result.bags, score: t2Result.score },
    });
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50'>
      <div className='bg-background p-6 rounded-lg shadow-2xl w-full max-w-md border border-border'>
        <h3 className='text-lg font-bold mb-4 text-foreground text-center'>Enter Round Details</h3>

        <div className='grid grid-cols-2 gap-6 mb-6'>
          {/* Team 1 Inputs */}
          <div className='bg-foreground/5 p-4 rounded-lg'>
            <h4 className='font-bold text-primary mb-2 text-center'>Team 1</h4>
            <div className='mb-2'>
              <label className='block text-xs font-bold text-foreground/60 mb-1'>Bid</label>
              <input
                type='number'
                value={t1Bid}
                onChange={(e) => setT1Bid(e.target.value)}
                className='w-full p-2 border border-border rounded text-center font-bold text-lg'
                placeholder='0'
              />
            </div>
            <div>
              <label className='block text-xs font-bold text-foreground/60 mb-1'>Tricks</label>
              <input
                type='number'
                value={t1Tricks}
                onChange={(e) => setT1Tricks(e.target.value)}
                className='w-full p-2 border border-border rounded text-center font-bold text-lg'
                placeholder='0'
              />
            </div>
          </div>

          {/* Team 2 Inputs */}
          <div className='bg-foreground/5 p-4 rounded-lg'>
            <h4 className='font-bold text-secondary mb-2 text-center'>Team 2</h4>
            <div className='mb-2'>
              <label className='block text-xs font-bold text-foreground/60 mb-1'>Bid</label>
              <input
                type='number'
                value={t2Bid}
                onChange={(e) => setT2Bid(e.target.value)}
                className='w-full p-2 border border-border rounded text-center font-bold text-lg'
                placeholder='0'
              />
            </div>
            <div>
              <label className='block text-xs font-bold text-foreground/60 mb-1'>Tricks</label>
              <input
                type='number'
                value={t2Tricks}
                onChange={(e) => setT2Tricks(e.target.value)}
                className='w-full p-2 border border-border rounded text-center font-bold text-lg'
                placeholder='0'
              />
            </div>
          </div>
        </div>

        <div className='grid grid-cols-2 gap-2'>
          <button
            onClick={handleSave}
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

export default function SpadesScorecard({ game: initialGame }: SpadesScorecardProps) {
  const { db } = useDb();
  const [game, setGame] = useState(initialGame);
  const [editingRoundIndex, setEditingRoundIndex] = useState<number | null>(null);
  const [showWinnerModal, setShowWinnerModal] = useState(false);

  const isCompleted = game.status === 'Completed';

  // Team Names (Assumed 4 players: T1 = P1+P3, T2 = P2+P4)
  const team1Name = `${game.players[0]} & ${game.players[2]}`;
  const team2Name = `${game.players[1]} & ${game.players[3]}`;

  // --- Derived State ---
  const teamStats = useMemo<{ team1: TeamStats; team2: TeamStats }>(() => {
    let t1Score = 0;
    let t1Bags = 0;
    let t2Score = 0;
    let t2Bags = 0;

    (game.spadesRounds || []).forEach((round) => {
      // Add raw round scores
      t1Score += round.team1.score;
      t1Bags += round.team1.bags;
      t2Score += round.team2.score;
      t2Bags += round.team2.bags;
    });

    // Calculate Bag Penalties (-100 for every 10 bags)
    // Note: The logic asks to subtract 100 for every 10 bags accumulated.
    const t1Penalty = Math.floor(t1Bags / 10) * 100;
    const t2Penalty = Math.floor(t2Bags / 10) * 100;

    return {
      team1: { totalScore: t1Score - t1Penalty, totalBags: t1Bags },
      team2: { totalScore: t2Score - t2Penalty, totalBags: t2Bags },
    };
  }, [game.spadesRounds]);

  const winners = useMemo(() => {
    if (!isCompleted) return [];

    // Check target score (usually 500)
    const t1 = teamStats.team1.totalScore;
    const t2 = teamStats.team2.totalScore;

    if (t1 > t2) return [{ name: team1Name, score: t1 }];
    if (t2 > t1) return [{ name: team2Name, score: t2 }];
    return [
      { name: team1Name, score: t1 },
      { name: team2Name, score: t2 },
    ];
  }, [isCompleted, teamStats, team1Name, team2Name]);

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

  const handleSaveRound = (roundData: SpadesRound) => {
    const newRounds = [...(game.spadesRounds || [])];
    if (editingRoundIndex !== null && editingRoundIndex < newRounds.length) {
      // Edit existing
      newRounds[editingRoundIndex] = roundData;
    } else {
      // Add new
      newRounds.push(roundData);
    }
    updateAndSetGame({ spadesRounds: newRounds });
    setEditingRoundIndex(null);
  };

  const handleRemoveRound = () => {
    if (isCompleted || (game.spadesRounds?.length || 0) === 0) return;
    const newRounds = (game.spadesRounds || []).slice(0, -1);
    updateAndSetGame({ spadesRounds: newRounds });
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
            onClick={() => setEditingRoundIndex(game.spadesRounds?.length || 0)}
            disabled={isCompleted}
            className='bg-secondary cursor-pointer text-white font-semibold px-4 py-2 rounded-full text-sm hover:bg-blue-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed'>
            <FontAwesomeIcon icon={faPlus} className='mr-2' />
            Add Round
          </button>
          <button
            onClick={handleRemoveRound}
            disabled={isCompleted || (game.spadesRounds?.length || 0) === 0}
            className='bg-red-600 cursor-pointer text-white font-semibold px-4 py-2 rounded-full text-sm hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed'>
            <FontAwesomeIcon icon={faTrash} className='mr-2' />
            Remove Round
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
            <thead className='bg-secondary text-white'>
              <tr>
                <th className='p-3 w-16'>Rnd</th>
                <th className='p-3 text-center border-l border-white/10' colSpan={4}>
                  <div className='text-sm opacity-80 uppercase tracking-widest'>Team 1</div>
                  <div className='text-lg font-bold truncate max-w-[150px] mx-auto'>
                    {team1Name}
                  </div>
                </th>
                <th className='p-3 text-center border-l border-white/10' colSpan={4}>
                  <div className='text-sm opacity-80 uppercase tracking-widest'>Team 2</div>
                  <div className='text-lg font-bold truncate max-w-[150px] mx-auto'>
                    {team2Name}
                  </div>
                </th>
              </tr>
              <tr className='bg-secondary/80 text-xs uppercase'>
                <th className='p-2'></th>
                <th className='p-2 text-center'>Bid</th>
                <th className='p-2 text-center'>Tricks</th>
                <th className='p-2 text-center'>Bags</th>
                <th className='p-2 text-center font-bold'>Score</th>

                <th className='p-2 text-center border-l border-white/10'>Bid</th>
                <th className='p-2 text-center'>Tricks</th>
                <th className='p-2 text-center'>Bags</th>
                <th className='p-2 text-center font-bold'>Score</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border'>
              {(game.spadesRounds || []).map((round, idx) => (
                <tr
                  key={idx}
                  className='bg-foreground/5 even:bg-gray-50 hover:bg-primary/5 cursor-pointer transition-colors'
                  onClick={() => setEditingRoundIndex(idx)}>
                  <td className='p-3 font-bold text-center opacity-50'>{idx + 1}</td>

                  {/* Team 1 Data */}
                  <td className='p-3 text-center'>{round.team1.bid}</td>
                  <td className='p-3 text-center'>{round.team1.tricks}</td>
                  <td className='p-3 text-center opacity-70'>
                    {round.team1.bags > 0 ? `+${round.team1.bags}` : '-'}
                  </td>
                  <td
                    className={`p-3 text-center font-bold ${round.team1.score < 0 ? 'text-red-500' : 'text-primary'}`}>
                    {round.team1.score}
                  </td>

                  {/* Team 2 Data */}
                  <td className='p-3 text-center border-l border-border'>{round.team2.bid}</td>
                  <td className='p-3 text-center'>{round.team2.tricks}</td>
                  <td className='p-3 text-center opacity-70'>
                    {round.team2.bags > 0 ? `+${round.team2.bags}` : '-'}
                  </td>
                  <td
                    className={`p-3 text-center font-bold ${round.team2.score < 0 ? 'text-red-500' : 'text-secondary'}`}>
                    {round.team2.score}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className='bg-gray-800 text-white'>
              <tr>
                <td className='p-4 font-bold'>Total</td>
                <td colSpan={4} className='p-4 text-center'>
                  <div className='text-2xl font-bold'>{teamStats.team1.totalScore}</div>
                  <div className='text-xs opacity-60'>Total Bags: {teamStats.team1.totalBags}</div>
                </td>
                <td colSpan={4} className='p-4 text-center border-l border-white/10'>
                  <div className='text-2xl font-bold'>{teamStats.team2.totalScore}</div>
                  <div className='text-xs opacity-60'>Total Bags: {teamStats.team2.totalBags}</div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Input Modal */}
      {editingRoundIndex !== null && (
        <ScoreInputModal
          roundData={(game.spadesRounds || [])[editingRoundIndex]}
          onSave={handleSaveRound}
          onClose={() => setEditingRoundIndex(null)}
        />
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
