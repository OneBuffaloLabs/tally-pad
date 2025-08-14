'use client';

import { useState, useMemo } from 'react';
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
  'Yahtzee Bonus',
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

export default function YahtzeeScorecard({ game: initialGame }: YahtzeeScorecardProps) {
  const { db } = useDb();
  const [game, setGame] = useState(initialGame);
  const [editingCell, setEditingCell] = useState<{ player: string; category: string } | null>(null);
  const [scoreInput, setScoreInput] = useState('');

  const handleScoreChange = async (
    player: string,
    category: string,
    score: number | 'X' | null
  ) => {
    if (!db || !game._id) return;

    const newScores = { ...game.scores };
    if (!newScores[player]) {
      newScores[player] = {};
    }

    if (score === null) {
      delete newScores[player][category];
    } else {
      newScores[player][category] = score;
    }

    const updatedGame = { ...game, scores: newScores };
    setGame(updatedGame);

    await updateGame(db, game._id, { scores: newScores });

    setEditingCell(null);
    setScoreInput('');
  };

  const totals = useMemo(() => {
    const playerTotals: { [key: string]: PlayerTotals } = {}; // Use the specific type here
    game.players.forEach((player) => {
      const playerScores = game.scores?.[player] || {};
      let upperTotal = 0;
      upperSectionCategories.forEach((cat) => {
        if (typeof playerScores[cat] === 'number') {
          upperTotal += playerScores[cat] as number;
        }
      });

      const bonus = upperTotal >= 63 ? 35 : 0;
      const upperTotalWithBonus = upperTotal + bonus;

      let lowerTotal = 0;
      lowerSectionCategories.forEach((cat) => {
        if (typeof playerScores[cat] === 'number') {
          lowerTotal += playerScores[cat] as number;
        }
      });

      playerTotals[player] = {
        upperTotal,
        bonus,
        upperTotalWithBonus,
        lowerTotal,
        grandTotal: upperTotalWithBonus + lowerTotal,
      };
    });
    return playerTotals;
  }, [game.scores, game.players]);

  return (
    <div className='p-4 sm:p-6 lg:p-8'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-3xl font-bold text-foreground'>{game.name}</h1>
        <Link
          href='/app'
          className='bg-secondary/10 text-secondary font-semibold px-4 py-2 rounded-full text-sm hover:bg-secondary/20 transition-colors'>
          <FontAwesomeIcon icon={faArrowLeft} className='mr-2' />
          Back to Games
        </Link>
      </div>

      <div className='overflow-x-auto shadow-lg rounded-xl'>
        <table className='min-w-full bg-white dark:bg-foreground/5 border-collapse'>
          {/* Table Head */}
          <thead>
            <tr className='bg-gray-50 dark:bg-foreground/10'>
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
          {/* Table Body */}
          <tbody>
            {/* Upper Section */}
            {upperSectionCategories.map((category, idx) => (
              <tr
                key={category}
                className={
                  idx % 2 === 0
                    ? 'bg-white dark:bg-foreground/5'
                    : 'bg-gray-50 dark:bg-foreground/10'
                }>
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
                    onClick={() => {
                      setEditingCell({ player, category });
                      const currentScore = game.scores?.[player]?.[category];
                      setScoreInput(
                        currentScore !== undefined && currentScore !== null
                          ? String(currentScore)
                          : ''
                      );
                    }}>
                    {game.scores?.[player]?.[category] ?? (
                      <span className='text-foreground/20'>-</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
            {/* Totals */}
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
              <tr
                key={category}
                className={
                  idx % 2 === 0
                    ? 'bg-white dark:bg-foreground/5'
                    : 'bg-gray-50 dark:bg-foreground/10'
                }>
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
                    onClick={() => {
                      setEditingCell({ player, category });
                      const currentScore = game.scores?.[player]?.[category];
                      setScoreInput(
                        currentScore !== undefined && currentScore !== null
                          ? String(currentScore)
                          : ''
                      );
                    }}>
                    {game.scores?.[player]?.[category] ?? (
                      <span className='text-foreground/20'>-</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
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

      {/* Score Entry Modal */}
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
              onChange={(e) => setScoreInput(e.target.value)}
              className='w-full p-3 bg-white dark:bg-foreground/5 border-2 border-border rounded-lg mb-4 text-center text-2xl font-bold focus:border-primary focus:ring-1 focus:ring-primary'
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
    </div>
  );
}
