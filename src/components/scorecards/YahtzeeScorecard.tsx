'use client';

import { useState, useMemo, useEffect } from 'react';
import { useDb } from '@/contexts/DbContext';
import { updateGame } from '@/lib/database';
import Link from 'next/link';
import { Game } from '@/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes,
  faArrowLeft,
  faDiceOne,
  faDiceTwo,
  faDiceThree,
  faDiceFour,
  faDiceFive,
  faDiceSix,
  faTrophy,
  faPlus,
} from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

// --- Type Definitions for this Component ---
interface YahtzeeScorecardProps {
  game: Game;
}
interface PlayerTotals {
  upperTotal: number;
  bonus: number;
  upperTotalWithBonus: number;
  lowerTotal: number;
  grandTotal: number;
}

// --- Constants ---
const upperSectionCategories = ['Aces', 'Twos', 'Threes', 'Fours', 'Fives', 'Sixes'];
const lowerSectionCategories = [
  '3 of a Kind',
  '4 of a Kind',
  'Full House',
  'Small Straight',
  'Large Straight',
  'Yahtzee',
  'Chance',
];
const categoryIcons: { [key: string]: IconDefinition } = {
  Aces: faDiceOne,
  Twos: faDiceTwo,
  Threes: faDiceThree,
  Fours: faDiceFour,
  Fives: faDiceFive,
  Sixes: faDiceSix,
};
const scoreDescriptions: { [key: string]: string } = {
  Aces: 'Count and Add Only Aces',
  Twos: 'Count and Add Only Twos',
  Threes: 'Count and Add Only Threes',
  Fours: 'Count and Add Only Fours',
  Fives: 'Count and Add Only Fives',
  Sixes: 'Count and Add Only Sixes',
  '3 of a Kind': 'Add Total of All Dice',
  '4 of a Kind': 'Add Total of All Dice',
  'Full House': 'Score 25',
  'Small Straight': 'Score 30',
  'Large Straight': 'Score 40',
  Yahtzee: 'Score 50',
  Chance: 'Score Total of All 5 Dice',
  'Yahtzee Bonus': 'Score 100 Per Bonus',
};
const fixedScoreCategories: { [key: string]: number } = {
  'Full House': 25,
  'Small Straight': 30,
  'Large Straight': 40,
  Yahtzee: 50,
};

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
  const [winners, setWinners] = useState<{ name: string; score: number }[]>([]);
  const isCompleted = game.status === 'Completed';

  const totals = useMemo(() => {
    const playerTotals: { [key: string]: PlayerTotals } = {};
    game.players.forEach((player) => {
      const playerScores = game.scores?.[player] || {};
      let upperTotal = 0;
      upperSectionCategories.forEach((cat) => {
        if (typeof playerScores[cat] === 'number') upperTotal += playerScores[cat] as number;
      });
      const bonus = upperTotal >= 63 ? 35 : 0;
      const upperTotalWithBonus = upperTotal + bonus;
      let lowerTotal = 0;
      lowerSectionCategories.forEach((cat) => {
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

  // Calculate winners when the component loads if the game is already completed
  useEffect(() => {
    if (isCompleted) {
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
      setWinners(currentWinners);
    }
  }, [isCompleted, game.players, totals]);

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

  const updateAndSetGame = async (updates: Partial<Game>) => {
    if (!db || !game._id) return;
    const updatedGame = { ...game, ...updates, lastPlayed: Date.now() };
    setGame(updatedGame);
    await updateGame(db, game._id, { ...updates, lastPlayed: Date.now() });
  };

  const openModal = (player: string, category: string) => {
    if (isCompleted) return; // Prevent opening modal for completed games
    const currentScore = game.scores?.[player]?.[category];
    const scoreString =
      currentScore !== undefined && currentScore !== null ? String(currentScore) : '';
    setScoreInput(scoreString);
    if (Object.keys(fixedScoreCategories).includes(category)) {
      setEditingFixedScoreCell({ player, category });
    } else {
      setEditingCell({ player, category });
    }
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

      <div
        className={`overflow-x-auto shadow-lg rounded-xl ${
          isCompleted ? 'opacity-75 pointer-events-none' : ''
        }`}>
        <table className='min-w-full bg-foreground/5 border-collapse'>
          <thead>
            <tr className='bg-foreground/10'>
              <th className='p-3 text-left font-bold text-secondary text-sm tracking-wider w-1/4 border-b-2 border-border'></th>
              <th className='p-3 text-left font-bold text-secondary text-sm tracking-wider w-1/4 border-b-2 border-border'>
                How to Score
              </th>
              {game.players.map((player) => (
                <th
                  key={player}
                  className='p-3 font-bold text-secondary text-sm tracking-wider text-center border-b-2 border-border'>
                  {player}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Upper Section */}
            {upperSectionCategories.map((category, idx) => (
              <tr key={category} className={idx % 2 === 0 ? 'bg-foreground/5' : 'bg-foreground/10'}>
                <td className='p-3 font-semibold text-foreground/80 border-b border-border'>
                  <div className='flex items-center gap-3'>
                    <FontAwesomeIcon
                      icon={categoryIcons[category]}
                      className='text-primary'
                      size='lg'
                    />
                    <span>{category}</span>
                  </div>
                </td>
                <td className='p-3 text-foreground/60 text-sm border-b border-border'>
                  {scoreDescriptions[category]}
                </td>
                {game.players.map((player) => (
                  <td
                    key={player}
                    className='p-3 text-center cursor-pointer hover:bg-primary/10 transition-colors font-medium border-b border-border'
                    onClick={() => openModal(player, category)}>
                    {game.scores?.[player]?.[category] ?? (
                      <span className='text-foreground/20'>-</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
            <tr className='bg-secondary/10 font-bold'>
              <td className='p-3 text-secondary border-b border-border'>Upper Section Total</td>
              <td className='p-3 border-b border-border'></td>
              {game.players.map((player) => (
                <td key={player} className='p-3 text-center text-secondary border-b border-border'>
                  {totals[player]?.upperTotal ?? 0}
                </td>
              ))}
            </tr>
            <tr className='bg-secondary/10 font-bold'>
              <td className='p-3 text-secondary border-b-2 border-border'>Bonus (Score 63+)</td>
              <td className='p-3 text-center border-b-2 border-border'>Score 35</td>
              {game.players.map((player) => (
                <td
                  key={player}
                  className='p-3 text-center text-secondary border-b-2 border-border'>
                  {totals[player]?.bonus ?? 0}
                </td>
              ))}
            </tr>

            {/* Lower Section */}
            {lowerSectionCategories.map((category, idx) => (
              <tr key={category} className={idx % 2 === 0 ? 'bg-foreground/5' : 'bg-foreground/10'}>
                <td className='p-3 font-semibold text-foreground/80 border-b border-border'>
                  {category}
                </td>
                <td className='p-3 text-foreground/60 text-sm border-b border-border'>
                  {scoreDescriptions[category]}
                </td>
                {game.players.map((player) => (
                  <td
                    key={player}
                    className='p-3 text-center cursor-pointer hover:bg-primary/10 transition-colors font-medium border-b border-border'
                    onClick={() => openModal(player, category)}>
                    {game.scores?.[player]?.[category] ?? (
                      <span className='text-foreground/20'>-</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
            <tr className='bg-foreground/10'>
              <td className='p-3 font-semibold text-foreground/80 border-b border-border'>
                Yahtzee Bonus
              </td>
              <td className='p-3 text-foreground/60 text-sm border-b border-border'>
                Score 100 Per Bonus
              </td>
              {game.players.map((player) => (
                <td key={player} className='p-3 text-center font-medium border-b border-border'>
                  <div className='flex items-center justify-center gap-2'>
                    <button
                      onClick={() => handleYahtzeeBonus(player, false)}
                      className='text-red-500 hover:text-red-700 font-bold text-lg cursor-pointer'>
                      －
                    </button>
                    <span className='font-bold text-lg text-primary w-4 text-center'>
                      {(game.scores?.[player]?.['Yahtzee Bonus'] as number) || 0}
                    </span>
                    <button
                      onClick={() => handleYahtzeeBonus(player, true)}
                      className='text-primary hover:text-green-500 font-bold text-lg cursor-pointer'>
                      ＋
                    </button>
                  </div>
                </td>
              ))}
            </tr>
            <tr className='bg-secondary/10 font-bold'>
              <td className='p-3 text-secondary border-b border-border'>Lower Section Total</td>
              <td className='p-3 border-b border-border'></td>
              {game.players.map((player) => (
                <td key={player} className='p-3 text-center text-secondary border-b border-border'>
                  {totals[player]?.lowerTotal ?? 0}
                </td>
              ))}
            </tr>
            <tr className='bg-secondary text-white font-extrabold text-lg'>
              <td className='p-4'>Grand Total</td>
              <td className='p-4'></td>
              {game.players.map((player) => (
                <td key={player} className='p-4 text-center'>
                  {totals[player]?.grandTotal ?? 0}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Number Input Modal */}
      {editingCell && (
        <div className='fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50'>
          <div className='bg-background p-6 rounded-lg shadow-2xl w-full max-w-sm border border-border'>
            <h3 className='text-lg font-bold mb-2 text-foreground'>Enter Score</h3>
            <p className='text-sm text-foreground/60 mb-4'>
              For <span className='font-bold text-primary'>{editingCell.player}</span> in{' '}
              <span className='font-bold text-primary'>{editingCell.category}</span>
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
            <div className='grid grid-cols-2 gap-2 mb-2'>
              <button
                onClick={() => handleScoreChange(editingCell.player, editingCell.category, 'X')}
                className='w-full bg-red-600 text-white font-semibold py-3 rounded-lg hover:bg-red-700 transition-colors cursor-pointer'>
                <FontAwesomeIcon icon={faTimes} className='mr-2' />
                Scratch
              </button>
              <button
                onClick={() => handleScoreChange(editingCell.player, editingCell.category, null)}
                className='w-full bg-gray-500 text-white font-semibold py-3 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer'>
                Clear
              </button>
            </div>
            <button
              onClick={() =>
                handleScoreChange(
                  editingCell.player,
                  editingCell.category,
                  parseInt(scoreInput, 10) || 0
                )
              }
              className='w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-green-700 transition-colors mb-4 cursor-pointer'>
              Save Score
            </button>
            <button
              onClick={() => setEditingCell(null)}
              className='w-full text-center text-sm text-foreground/60 hover:text-primary cursor-pointer'>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Yes/No Input Modal */}
      {editingFixedScoreCell && (
        <div className='fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50'>
          <div className='bg-background p-6 rounded-lg shadow-2xl w-full max-w-sm border border-border'>
            <h3 className='text-lg font-bold mb-2 text-foreground'>
              Did you get a {editingFixedScoreCell.category}?
            </h3>
            <p className='text-sm text-foreground/60 mb-6'>
              For <span className='font-bold text-primary'>{editingFixedScoreCell.player}</span>
            </p>
            <div className='flex flex-col gap-2'>
              <button
                onClick={() =>
                  handleScoreChange(
                    editingFixedScoreCell.player,
                    editingFixedScoreCell.category,
                    fixedScoreCategories[editingFixedScoreCell.category]
                  )
                }
                className='w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-green-700 transition-colors cursor-pointer'>
                Yes (Score {fixedScoreCategories[editingFixedScoreCell.category]})
              </button>
              <button
                onClick={() =>
                  handleScoreChange(
                    editingFixedScoreCell.player,
                    editingFixedScoreCell.category,
                    'X'
                  )
                }
                className='w-full bg-red-600 text-white font-semibold py-3 rounded-lg hover:bg-red-700 transition-colors cursor-pointer'>
                No (Scratch)
              </button>
              <button
                onClick={() =>
                  handleScoreChange(
                    editingFixedScoreCell.player,
                    editingFixedScoreCell.category,
                    null
                  )
                }
                className='w-full bg-gray-500 text-white font-semibold py-3 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer'>
                Clear Score
              </button>
            </div>
            <button
              onClick={() => setEditingFixedScoreCell(null)}
              className='w-full text-center text-sm text-foreground/60 hover:text-primary mt-4 cursor-pointer'>
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
