'use client';

import { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faCheckCircle, faTimes } from '@fortawesome/free-solid-svg-icons';

interface GolfParSetupProps {
  holeCount: number;
  pars: number[];
  courseSaved: boolean;
  onParChange: (index: number, value: string) => void;
  onSaveCourse: (name: string) => void;
  onNext: () => void;
}

export default function GolfParSetup({
  holeCount,
  pars,
  courseSaved,
  onParChange,
  onSaveCourse,
  onNext,
}: GolfParSetupProps) {
  const [showModal, setShowModal] = useState(false);
  const [courseName, setCourseName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showModal && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showModal]);

  const handleSave = () => {
    if (courseName.trim()) {
      onSaveCourse(courseName);
      setShowModal(false);
      setCourseName('');
    }
  };

  return (
    <div>
      <h2 className='text-3xl font-bold text-foreground mb-4'>Set Par for Each Hole</h2>
      <div className='space-y-2 mb-4'>
        {Array.from({ length: holeCount }).map((_, index) => (
          <div key={index} className='flex items-center gap-4'>
            <label className='w-12 font-bold'>Hole {index + 1}:</label>
            <input
              type='number'
              value={pars[index] || 3}
              onChange={(e) => onParChange(index, e.target.value)}
              className='w-24 p-2 border rounded-lg'
            />
          </div>
        ))}
      </div>
      <div className='flex gap-2'>
        {courseSaved ? (
          <button
            disabled
            className='w-full bg-green-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2'>
            <FontAwesomeIcon icon={faCheckCircle} />
            Course Saved!
          </button>
        ) : (
          <button
            onClick={() => setShowModal(true)}
            className='w-full bg-secondary text-white font-bold py-3 rounded-lg cursor-pointer'>
            <FontAwesomeIcon icon={faSave} className='mr-2' />
            Save Course
          </button>
        )}
        <button
          onClick={onNext}
          className='w-full bg-primary text-white font-bold py-3 rounded-lg cursor-pointer'>
          Next
        </button>
      </div>

      {showModal && (
        <div className='fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50'>
          <div className='bg-background p-6 rounded-lg shadow-2xl w-full max-w-sm border border-border'>
            <div className='flex justify-between items-center mb-4'>
              <h3 className='text-lg font-bold text-foreground'>Save Course Layout</h3>
              <button
                onClick={() => setShowModal(false)}
                className='text-foreground/60 cursor-pointer'>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <input
              ref={inputRef}
              type='text'
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              placeholder='e.g., "Oak Hill East"'
              className='w-full p-3 bg-foreground/5 border-2 border-border rounded-lg mb-4 text-xl font-bold focus:border-primary focus:ring-1 focus:ring-primary'
            />
            <button
              onClick={handleSave}
              className='w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-green-700 transition-colors cursor-pointer'>
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
