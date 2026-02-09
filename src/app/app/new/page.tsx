'use client';

// --- React ---
import { useState, useEffect } from 'react';
// --- Next/Router ---
import { useRouter } from 'next/navigation';
// --- Types ---
import { Game, Phase10Round, GolfRound, CourseTemplate, HeartsRound } from '@/types';
// --- Context ---
import { useDb } from '@/contexts/DbContext';
// --- Helpers ---
import {
  createGame,
  saveCourseTemplate,
  getCourseTemplates,
  deleteCourseTemplate,
} from '@/lib/database';
import { generateId } from '@/lib/utils';
// --- Components ---
import CourseSelection from '@/components/scorecards/golf/CourseSelection';
import PlayerSetup from '@/components/scorecards/PlayerSetup';
import GameTypeSelection from '@/components/new-game/GameTypeSelection';
import GolfHoleCount from '@/components/new-game/GolfHoleCount';
import GolfParSetup from '@/components/new-game/GolfParSetup';

export default function NewGamePage() {
  const { db } = useDb();
  const router = useRouter();

  // --- State ---
  const [step, setStep] = useState(1);
  const [gameType, setGameType] = useState<string | null>(null);
  const [players, setPlayers] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Golf Specific State
  const [holeCount, setHoleCount] = useState(9);
  const [pars, setPars] = useState<number[]>([]);
  const [courses, setCourses] = useState<CourseTemplate[]>([]);
  const [courseSaved, setCourseSaved] = useState(false);
  const [selectedCourseName, setSelectedCourseName] = useState<string | null>(null);

  // --- Effects ---
  useEffect(() => {
    const fetchCourses = async () => {
      if (db && (gameType === 'Golf' || gameType === 'Putt-Putt')) {
        const savedCourses = await getCourseTemplates(db, gameType);
        setCourses(savedCourses);
      }
    };
    fetchCourses();
  }, [db, gameType]);

  // --- Handlers ---
  const handleGameSelection = (type: string) => {
    setGameType(type);

    // Spades requires exactly 4 players
    if (type === 'Spades') {
      setPlayers(['', '', '', '']);
    }

    setStep(2);
  };

  const handleStartGame = async () => {
    if (!db || players.length === 0 || !gameType || isSaving) {
      return;
    }

    // Validation for Spades
    if (gameType === 'Spades' && players.length !== 4) {
      alert('Spades requires exactly 4 players.');
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

      if (gameType === 'Hearts') {
        const initialRound: HeartsRound = {};
        players.forEach((player) => {
          initialRound[player] = { score: 0, shotTheMoon: false };
        });
        newGame.heartsRounds = [initialRound];
      }

      if (gameType === 'Spades') {
        newGame.spadesRounds = [];
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
    newPars[index] = parseInt(value, 10) || 3;
    setPars(newPars);
  };

  const handleSaveCourse = async (name: string) => {
    if (!db || !gameType) return;
    const newCourse = {
      name,
      gameType: gameType as 'Golf' | 'Putt-Putt',
      holeCount,
      pars: Array.from({ length: holeCount }).map((_, i) => pars[i] || 3),
    };
    await saveCourseTemplate(db, newCourse);
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
        return <GameTypeSelection onSelect={handleGameSelection} />;
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
        return (
          <PlayerSetup
            gameType={gameType || ''}
            players={players}
            setPlayers={setPlayers}
            onBack={() => setStep(1)}
            onNext={handleStartGame}
          />
        );
      case 3:
        return (
          <PlayerSetup
            gameType={gameType || ''}
            players={players}
            setPlayers={setPlayers}
            onBack={() => setStep(2)}
            onNext={handleStartGame}
          />
        );
      case 4:
        return (
          <GolfHoleCount
            onSelect={(count) => {
              setHoleCount(count);
              setStep(5);
            }}
          />
        );
      case 5:
        return (
          <GolfParSetup
            holeCount={holeCount}
            pars={pars}
            courseSaved={courseSaved}
            onParChange={handleParChange}
            onSaveCourse={handleSaveCourse}
            onNext={() => setStep(3)}
          />
        );
      default:
        return null;
    }
  };

  return <div className='max-w-xl mx-auto p-4 sm:p-6 lg:p-8'>{renderContent()}</div>;
}
