'use client';

// --- Types ---
import { Game } from '@/types';
import {
  UPPER_SECTION_CATEGORIES,
  LOWER_SECTION_CATEGORIES,
  CATEGORY_ICONS,
  SCORE_DESCRIPTIONS,
  PlayerTotals,
} from './constants';
// --- Icons ---
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface YahtzeeTableProps {
  game: Game;
  totals: { [key: string]: PlayerTotals };
  isCompleted: boolean;
  onCellClick: (player: string, category: string) => void;
  onBonusChange: (player: string, add: boolean) => void;
}

export default function YahtzeeTable({
  game,
  totals,
  isCompleted,
  onCellClick,
  onBonusChange,
}: YahtzeeTableProps) {
  return (
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
          {UPPER_SECTION_CATEGORIES.map((category, idx) => (
            <tr key={category} className={idx % 2 === 0 ? 'bg-foreground/5' : 'bg-foreground/10'}>
              <td className='p-3 font-semibold text-foreground/80 border-b border-border'>
                <div className='flex items-center gap-3'>
                  <FontAwesomeIcon
                    icon={CATEGORY_ICONS[category]}
                    className='text-primary'
                    size='lg'
                  />
                  <span>{category}</span>
                </div>
              </td>
              <td className='p-3 text-foreground/60 text-sm border-b border-border'>
                {SCORE_DESCRIPTIONS[category]}
              </td>
              {game.players.map((player) => (
                <td
                  key={player}
                  className='p-3 text-center cursor-pointer hover:bg-primary/10 transition-colors font-medium border-b border-border'
                  onClick={() => onCellClick(player, category)}>
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
              <td key={player} className='p-3 text-center text-secondary border-b-2 border-border'>
                {totals[player]?.bonus ?? 0}
              </td>
            ))}
          </tr>

          {/* Lower Section */}
          {LOWER_SECTION_CATEGORIES.map((category, idx) => (
            <tr key={category} className={idx % 2 === 0 ? 'bg-foreground/5' : 'bg-foreground/10'}>
              <td className='p-3 font-semibold text-foreground/80 border-b border-border'>
                {category}
              </td>
              <td className='p-3 text-foreground/60 text-sm border-b border-border'>
                {SCORE_DESCRIPTIONS[category]}
              </td>
              {game.players.map((player) => (
                <td
                  key={player}
                  className='p-3 text-center cursor-pointer hover:bg-primary/10 transition-colors font-medium border-b border-border'
                  onClick={() => onCellClick(player, category)}>
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
                    onClick={() => onBonusChange(player, false)}
                    className='text-red-500 hover:text-red-700 font-bold text-lg cursor-pointer'>
                    －
                  </button>
                  <span className='font-bold text-lg text-primary w-4 text-center'>
                    {(game.scores?.[player]?.['Yahtzee Bonus'] as number) || 0}
                  </span>
                  <button
                    onClick={() => onBonusChange(player, true)}
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
  );
}
