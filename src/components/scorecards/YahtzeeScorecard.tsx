// src/components/scorecards/YahtzeeScorecard.tsx
'use client';

// --- React ---
import { useState, useMemo } from 'react';

// --- Next/Router ---
import Link from 'next/link';

// --- Context ---
import { useDb } from '@/contexts/DbContext';

// --- Helpers ---
import { updateGame } from '@/lib/database';

// --- Types ---
import { Game } from '@/types';
import {
  UPPER_SECTION_CATEGORIES,
  LOWER_SECTION_CATEGORIES,
  FIXED_SCORE_CATEGORIES,
  PlayerTotals,
} from './yahtzee/constants';

// --- Components ---
import YahtzeeTable from './yahtzee/YahtzeeTable';
import { ScoreInputModal, FixedScoreInputModal } from './yahtzee/YahtzeeModals';

// --- Icons ---
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faTrophy, faPlus } from '@fortawesome/free-solid-svg-icons';

interface YahtzeeScorecardProps {
  game: Game;
}

export default function YahtzeeScorecard({ game: initialGame }: YahtzeeScorecardProps) {
  const { db } = useDb();
  const [game, setGame] = useState(initialGame);
  const [editingCell, setEditingCell] = useState<{ player: string; category: string } | null>(null);
  const [editingFixedScoreCell, setEditingFixedScoreCell] = useState<{
    player: string;
    category: string;
  } | null>(null);
  const [scoreInput, setScoreInput] = useState('');
  const [showWinnerModal, setShowWinnerModal] = useState(false);

  const isCompleted = game.status === 'Completed';

  // --- Calculations ---
  const totals = useMemo(() => {
    const playerTotals: { [key: string]: PlayerTotals } = {};
    game.players.forEach((player) => {
      const playerScores = game.scores?.[player] || {};

      let upperTotal = 0;
      UPPER_SECTION_CATEGORIES.forEach((cat) => {
        if (typeof playerScores[cat] === 'number') upperTotal += playerScores[cat] as number;
      });

      const bonus = upperTotal >= 63 ? 35 : 0;
      const upperTotalWithBonus = upperTotal + bonus;

      let lowerTotal = 0;
      LOWER_SECTION_CATEGORIES.forEach((cat) => {
        if (typeof playerScores[cat] === 'number') lowerTotal += playerScores[cat] as number;
      });

      const yahtzeeBonuses = (playerScores['Yahtzee Bonus'] as number) || 0;
      const lowerTotalWithBonuses = lowerTotal + yahtzeeBonuses * 100;

      playerTotals[player] = {
        upperTotal,
        bonus,
        upperTotalWithBonus,
        lowerTotal: lowerTotalWithBonuses,
        grandTotal: upperTotalWithBonus + lowerTotalWithBonuses,
      };
    });
    return playerTotals;
  }, [game.scores, game.players]);

  // Derived state for winners (Fixes "set-state-in-effect" error)
  const winners = useMemo(() => {
    if (!isCompleted) return [];

    let highestScore = -1;
    let currentWinners: { name: string; score: number }[] = [];

    game.players.forEach((player) => {
      const playerScore = totals[player]?.grandTotal ?? 0;
      if (playerScore > highestScore) {
        highestScore = playerScore;
        currentWinners = [{ name: player, score: playerScore }];
      } else if (playerScore === highestScore) {
        currentWinners.push({ name: player, score: playerScore });
      }
    });

    return currentWinners;
  }, [isCompleted, game.players, totals]);

  // --- Handlers ---
  const updateAndSetGame = async (updates: Partial<Game>) => {
    if (!db || !game._id) return;
    const now = Date.now();
    const updatedGame = { ...game, ...updates, lastPlayed: now };
    setGame(updatedGame);
    await updateGame(db, game._id, { ...updates, lastPlayed: now });
  };

  const handleScoreChange = async (
    player: string,
    category: string,
    score: number | 'X' | null
  ) => {
    if (isCompleted || !db || !game._id) return;

    const newScores = { ...game.scores };
    if (!newScores[player]) newScores[player] = {};

    if (score === null) delete newScores[player][category];
    else newScores[player][category] = score;

    await updateAndSetGame({ scores: newScores });

    setEditingCell(null);
    setEditingFixedScoreCell(null);
    setScoreInput('');
  };

  const handleYahtzeeBonus = async (player: string, add: boolean) => {
    if (isCompleted || !db || !game._id) return;

    const currentBonuses = (game.scores?.[player]?.['Yahtzee Bonus'] as number) || 0;
    let newBonusCount = add ? currentBonuses + 1 : currentBonuses - 1;
    if (newBonusCount < 0) newBonusCount = 0;
    if (newBonusCount > 10) newBonusCount = 10;

    const newScores = { ...game.scores };
    if (!newScores[player]) newScores[player] = {};
    newScores[player]['Yahtzee Bonus'] = newBonusCount;

    await updateAndSetGame({ scores: newScores });
  };

  const handleFinishGame = async () => {
    if (isCompleted || !db || !game._id) return;
    setShowWinnerModal(true);
    await updateAndSetGame({ status: 'Completed' });
  };

  const openModal = (player: string, category: string) => {
    if (isCompleted) return;
    const currentScore = game.scores?.[player]?.[category];
    const scoreString =
      currentScore !== undefined && currentScore !== null ? String(currentScore) : '';
    setScoreInput(scoreString);

    if (Object.keys(FIXED_SCORE_CATEGORIES).includes(category)) {
      setEditingFixedScoreCell({ player, category });
    } else {
      setEditingCell({ player, category });
    }
  };

  // --- Render ---
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
            className='bg-secondary/10 text-secondary font-semibold px-4 py-2 rounded-full text-sm hover:bg-secondary/20 transition-colors cursor-pointer'>
            <FontAwesomeIcon icon={faArrowLeft} className='mr-2' />
            Back to Games
          </Link>
        </div>
      </div>

      {isCompleted && (
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

      <YahtzeeTable
        game={game}
        totals={totals}
        isCompleted={isCompleted}
        onCellClick={openModal}
        onBonusChange={handleYahtzeeBonus}
      />

      {editingCell && (
        <ScoreInputModal
          player={editingCell.player}
          category={editingCell.category}
          currentValue={scoreInput}
          onChange={setScoreInput}
          onSave={(val) => handleScoreChange(editingCell.player, editingCell.category, val)}
          onScratch={() => handleScoreChange(editingCell.player, editingCell.category, 'X')}
          onClear={() => handleScoreChange(editingCell.player, editingCell.category, null)}
          onCancel={() => setEditingCell(null)}
        />
      )}

      {editingFixedScoreCell && (
        <FixedScoreInputModal
          player={editingFixedScoreCell.player}
          category={editingFixedScoreCell.category}
          onConfirm={(val) =>
            handleScoreChange(editingFixedScoreCell.player, editingFixedScoreCell.category, val)
          }
          onScratch={() =>
            handleScoreChange(editingFixedScoreCell.player, editingFixedScoreCell.category, 'X')
          }
          onClear={() =>
            handleScoreChange(editingFixedScoreCell.player, editingFixedScoreCell.category, null)
          }
          onCancel={() => setEditingFixedScoreCell(null)}
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
