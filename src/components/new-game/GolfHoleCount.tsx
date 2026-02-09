'use client';

interface GolfHoleCountProps {
  onSelect: (count: number) => void;
}

export default function GolfHoleCount({ onSelect }: GolfHoleCountProps) {
  return (
    <div>
      <h2 className='text-3xl font-bold text-foreground my-4'>Choose Number of Holes</h2>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <button
          onClick={() => onSelect(9)}
          className='cursor-pointer text-left p-4 bg-foreground/5 rounded-lg border border-border shadow-sm hover:shadow-lg transition-all'>
          9 Holes
        </button>
        <button
          onClick={() => onSelect(18)}
          className='cursor-pointer text-left p-4 bg-foreground/5 rounded-lg border border-border shadow-sm hover:shadow-lg transition-all'>
          18 Holes
        </button>
      </div>
    </div>
  );
}
