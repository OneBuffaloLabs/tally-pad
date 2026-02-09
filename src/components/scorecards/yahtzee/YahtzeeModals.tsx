'use client';

// --- React ---
import { useEffect, useRef } from 'react';
// --- Icons ---
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
// --- Helpers ---
import { FIXED_SCORE_CATEGORIES } from './constants';

interface ScoreInputModalProps {
  player: string;
  category: string;
  currentValue: string;
  onSave: (val: number) => void;
  onScratch: () => void;
  onClear: () => void;
  onCancel: () => void;
  onChange: (val: string) => void;
}

export function ScoreInputModal({
  player,
  category,
  currentValue,
  onSave,
  onScratch,
  onClear,
  onCancel,
  onChange,
}: ScoreInputModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <div className='fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50'>
      <div className='bg-background p-6 rounded-lg shadow-2xl w-full max-w-sm border border-border'>
        <h3 className='text-lg font-bold mb-2 text-foreground'>Enter Score</h3>
        <p className='text-sm text-foreground/60 mb-4'>
          For <span className='font-bold text-primary'>{player}</span> in{' '}
          <span className='font-bold text-primary'>{category}</span>
        </p>
        <input
          ref={inputRef}
          type='number'
          value={currentValue}
          onChange={(e) => {
            if (e.target.value.length <= 3) {
              onChange(e.target.value);
            }
          }}
          className='w-full p-3 bg-foreground/5 border-2 border-border rounded-lg mb-4 text-center text-2xl font-bold focus:border-primary focus:ring-1 focus:ring-primary'
          placeholder='0'
        />
        <div className='grid grid-cols-2 gap-2 mb-2'>
          <button
            onClick={onScratch}
            className='w-full bg-red-600 text-white font-semibold py-3 rounded-lg hover:bg-red-700 transition-colors cursor-pointer'>
            <FontAwesomeIcon icon={faTimes} className='mr-2' />
            Scratch
          </button>
          <button
            onClick={onClear}
            className='w-full bg-gray-500 text-white font-semibold py-3 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer'>
            Clear
          </button>
        </div>
        <button
          onClick={() => onSave(parseInt(currentValue, 10) || 0)}
          className='w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-green-700 transition-colors mb-4 cursor-pointer'>
          Save Score
        </button>
        <button
          onClick={onCancel}
          className='w-full text-center text-sm text-foreground/60 hover:text-primary cursor-pointer'>
          Cancel
        </button>
      </div>
    </div>
  );
}

interface FixedScoreInputModalProps {
  player: string;
  category: string;
  onConfirm: (score: number) => void;
  onScratch: () => void;
  onClear: () => void;
  onCancel: () => void;
}

export function FixedScoreInputModal({
  player,
  category,
  onConfirm,
  onScratch,
  onClear,
  onCancel,
}: FixedScoreInputModalProps) {
  const scoreValue = FIXED_SCORE_CATEGORIES[category] || 0;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50'>
      <div className='bg-background p-6 rounded-lg shadow-2xl w-full max-w-sm border border-border'>
        <h3 className='text-lg font-bold mb-2 text-foreground'>Did you get a {category}?</h3>
        <p className='text-sm text-foreground/60 mb-6'>
          For <span className='font-bold text-primary'>{player}</span>
        </p>
        <div className='flex flex-col gap-2'>
          <button
            onClick={() => onConfirm(scoreValue)}
            className='w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-green-700 transition-colors cursor-pointer'>
            Yes (Score {scoreValue})
          </button>
          <button
            onClick={onScratch}
            className='w-full bg-red-600 text-white font-semibold py-3 rounded-lg hover:bg-red-700 transition-colors cursor-pointer'>
            No (Scratch)
          </button>
          <button
            onClick={onClear}
            className='w-full bg-gray-500 text-white font-semibold py-3 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer'>
            Clear Score
          </button>
        </div>
        <button
          onClick={onCancel}
          className='w-full text-center text-sm text-foreground/60 hover:text-primary mt-4 cursor-pointer'>
          Cancel
        </button>
      </div>
    </div>
  );
}
