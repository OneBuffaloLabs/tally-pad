'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronRight,
  faTrash,
  faSave,
  faTimes,
  faCheckCircle,
} from '@fortawesome/free-solid-svg-icons';
import { Game, Phase10Round, GolfRound, CourseTemplate } from '@/types';
import { useDb } from '@/contexts/DbContext';
import {
  createGame,
  saveCourseTemplate,
  getCourseTemplates,
  deleteCourseTemplate,
} from '@/lib/database';
import { generateId } from '@/lib/utils';
import GolfScorecardSetup from '@/components/scorecards/golf/GolfScorecardSetup';
import CourseSelection from '@/components/scorecards/golf/CourseSelection';

export default function NewGamePage() {
  const { db } = useDb();
  const [step, setStep] = useState(1);
  const [gameType, setGameType] = useState<string | null>(null);
  const [players, setPlayers] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [holeCount, setHoleCount] = useState(9);
  const [pars, setPars] = useState<number[]>([]);
  const [courses, setCourses] = useState<CourseTemplate[]>([]);
  const [showSaveCourseModal, setShowSaveCourseModal] = useState(false);
  const [courseName, setCourseName] = useState('');
  const [courseSaved, setCourseSaved] = useState(false);
  const [selectedCourseName, setSelectedCourseName] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCourses = async () => {
      if (db && (gameType === 'Golf' || gameType === 'Putt-Putt')) {
        const savedCourses = await getCourseTemplates(db, gameType);
        setCourses(savedCourses);
      }
    };
    fetchCourses();
  }, [db, gameType]);

  const handleGameSelection = (type: string) => {
    setGameType(type);
    setStep(2);
  };

  const handleStartGame = async () => {
    if (!db || players.length === 0 || !gameType || isSaving) {
      return;
    }
    setIsSaving(true);

    try {
      const initialScores: Game['scores'] = {};
      players.forEach((player) => {
        initialScores[player] = {};
      });

      const newGame: Partial<Game> = {
        id: generateId(),
        name: gameType,
        status: 'In Progress',
        date: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        players,
        scores: initialScores,
        lastPlayed: Date.now(),
        courseName: selectedCourseName || undefined,
      };

      if (gameType === 'Phase 10') {
        const initialRound: Phase10Round = {};
        players.forEach((player) => {
          initialRound[player] = { score: 0, phaseCompleted: false };
        });
        newGame.phase10Rounds = [initialRound];
      }

      if (gameType === 'Golf' || gameType === 'Putt-Putt') {
        const finalPars = pars;
        const initialGolfRounds: GolfRound[] = [];
        for (let i = 0; i < holeCount; i++) {
          initialGolfRounds.push({ par: finalPars[i] || 3 });
        }
        newGame.golfRounds = initialGolfRounds;
      }

      const response = await createGame(db, newGame);
      router.push(`/app/game?id=${response.id}`);
    } catch (error) {
      console.error('Failed to save game:', error);
      setIsSaving(false);
    }
  };

  const handleParChange = (index: number, value: string) => {
    const newPars = [...pars];
    newPars[index] = parseInt(value, 10);
    setPars(newPars);
  };

  const handleSaveCourse = async () => {
    if (!db || !courseName.trim() || !gameType) return;
    const newCourse = {
      name: courseName,
      gameType: gameType as 'Golf' | 'Putt-Putt',
      holeCount,
      pars: Array.from({ length: holeCount }).map((_, i) => pars[i] || 3),
    };
    await saveCourseTemplate(db, newCourse);
    setShowSaveCourseModal(false);
    setCourseName('');
    setCourseSaved(true);
    const savedCourses = await getCourseTemplates(db, gameType as 'Golf' | 'Putt-Putt');
    setCourses(savedCourses);
  };

  const handleDeleteCourse = async (course: CourseTemplate) => {
    if (!db || !course._id || !course._rev || !gameType) return;
    await deleteCourseTemplate(db, course._id, course._rev);
    const savedCourses = await getCourseTemplates(db, gameType as 'Golf' | 'Putt-Putt');
    setCourses(savedCourses);
  };

  const onSelectCourse = (course: CourseTemplate) => {
    setHoleCount(course.holeCount);
    setPars(course.pars);
    setSelectedCourseName(course.name);
    setStep(3); // Move to player setup
  };

  const renderContent = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <h2 className='text-3xl font-bold text-foreground mb-4'>Choose a Game</h2>
            <div className='grid grid-cols-1 gap-4'>
              <button
                onClick={() => handleGameSelection('Yahtzee')}
                className='cursor-pointer text-left p-4 bg-foreground/5 rounded-lg border border-border shadow-sm hover:shadow-lg transition-all flex justify-between items-center'>
                <span className='font-bold text-lg'>Yahtzee</span>
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
              <button
                onClick={() => handleGameSelection('Phase 10')}
                className='cursor-pointer text-left p-4 bg-foreground/5 rounded-lg border border-border shadow-sm hover:shadow-lg transition-all flex justify-between items-center'>
                <span className='font-bold text-lg'>Phase 10</span>
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
              <button
                onClick={() => handleGameSelection('Simple Score')}
                className='cursor-pointer text-left p-4 bg-foreground/5 rounded-lg border border-border shadow-sm hover:shadow-lg transition-all flex justify-between items-center'>
                <span className='font-bold text-lg'>Simple Score</span>
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
              <button
                onClick={() => handleGameSelection('Golf')}
                className='cursor-pointer text-left p-4 bg-foreground/5 rounded-lg border border-border shadow-sm hover:shadow-lg transition-all flex justify-between items-center'>
                <span className='font-bold text-lg'>Golf</span>
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
              <button
                onClick={() => handleGameSelection('Putt-Putt')}
                className='cursor-pointer text-left p-4 bg-foreground/5 rounded-lg border border-border shadow-sm hover:shadow-lg transition-all flex justify-between items-center'>
                <span className='font-bold text-lg'>Putt-Putt</span>
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
            </div>
          </div>
        );
      case 2:
        if (gameType === 'Golf' || gameType === 'Putt-Putt') {
          return (
            <CourseSelection
              courses={courses}
              onSelectCourse={onSelectCourse}
              onNewCourse={() => setStep(4)}
              onDeleteCourse={handleDeleteCourse}
              onBack={() => setStep(1)}
            />
          );
        }
        // For other games, go straight to player setup
        return (
          <GolfScorecardSetup
            players={players}
            setPlayers={setPlayers}
            setHoleCount={() => {}}
            setStep={() => handleStartGame()}
          />
        );
      case 3: // Player setup for all game types
        return (
          <GolfScorecardSetup
            players={players}
            setPlayers={setPlayers}
            setHoleCount={() => {}}
            setStep={() => handleStartGame()}
          />
        );
      case 4: // Hole selection for new Golf/Putt-Putt course
        return (
          <GolfScorecardSetup
            players={players}
            setPlayers={setPlayers}
            setHoleCount={setHoleCount}
            setStep={setStep}
          />
        );
      case 5: // Par setup for new Golf/Putt-Putt course
        return (
          <div>
            <h2 className='text-3xl font-bold text-foreground mb-4'>Set Par for Each Hole</h2>
            <div className='space-y-2 mb-4'>
              {Array.from({ length: holeCount }).map((_, index) => (
                <div key={index} className='flex items-center gap-4'>
                  <label className='w-12 font-bold'>Hole {index + 1}:</label>
                  <input
                    type='number'
                    defaultValue={3}
                    onChange={(e) => handleParChange(index, e.target.value)}
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
                  onClick={() => setShowSaveCourseModal(true)}
                  className='w-full bg-secondary text-white font-bold py-3 rounded-lg cursor-pointer'>
                  <FontAwesomeIcon icon={faSave} className='mr-2' />
                  Save Course
                </button>
              )}
              <button
                onClick={() => setStep(3)} // Move to player setup
                className='w-full bg-primary text-white font-bold py-3 rounded-lg cursor-pointer'>
                Next
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className='max-w-xl mx-auto p-4 sm:p-6 lg:p-8'>
      {renderContent()}
      {showSaveCourseModal && (
        <div className='fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50'>
          <div className='bg-background p-6 rounded-lg shadow-2xl w-full max-w-sm border border-border'>
            <div className='flex justify-between items-center mb-4'>
              <h3 className='text-lg font-bold text-foreground'>Save Course Layout</h3>
              <button
                onClick={() => setShowSaveCourseModal(false)}
                className='text-foreground/60 cursor-pointer'>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <input
              type='text'
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              placeholder='e.g., "Oak Hill East"'
              className='w-full p-3 bg-foreground/5 border-2 border-border rounded-lg mb-4 text-xl font-bold focus:border-primary focus:ring-1 focus:ring-primary'
              autoFocus
            />
            <button
              onClick={handleSaveCourse}
              className='w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-green-700 transition-colors cursor-pointer'>
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
