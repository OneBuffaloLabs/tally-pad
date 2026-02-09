'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';

interface GameTypeSelectionProps {
  onSelect: (type: string) => void;
}

const GAMES = ['Yahtzee', 'Phase 10', 'Hearts', 'Simple Score', 'Golf', 'Putt-Putt'];

export default function GameTypeSelection({ onSelect }: GameTypeSelectionProps) {
  return (
    <div>
      <h2 className='text-3xl font-bold text-foreground mb-4'>Choose a Game</h2>
      <div className='grid grid-cols-1 gap-4'>
        {GAMES.map((game) => (
          <button
            key={game}
            onClick={() => onSelect(game)}
            className='cursor-pointer text-left p-4 bg-foreground/5 rounded-lg border border-border shadow-sm hover:shadow-lg transition-all flex justify-between items-center'>
            <span className='font-bold text-lg'>{game}</span>
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        ))}
      </div>
    </div>
  );
}
