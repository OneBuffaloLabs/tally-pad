'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useDb } from '@/contexts/DbContext';
import { getAllGames, deleteGame, clearAllData } from '@/lib/database';
import { Game } from '@/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faDice,
  faLayerGroup,
  faClipboardList,
  faSpinner,
  faCog,
  faTrash,
  faExclamationTriangle,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { version } from '../../../package.json';

// --- Main App Page Component ---
export default function AppPage() {
  const { db, isLoading } = useDb();
  const [games, setGames] = useState<Game[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Game | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    const loadGames = async () => {
      if (db) {
        const savedGames = await getAllGames(db);
        // Sort games by lastPlayed timestamp, descending
        savedGames.sort((a, b) => (b.lastPlayed || 0) - (a.lastPlayed || 0));
        setGames(savedGames);
      }
    };
    loadGames();
  }, [db]);

  const handleDeleteGame = async () => {
    if (!db || !showDeleteConfirm || !showDeleteConfirm._id || !showDeleteConfirm._rev) return;

    try {
      await deleteGame(db, showDeleteConfirm._id, showDeleteConfirm._rev);
      setGames(games.filter((game) => game._id !== showDeleteConfirm._id));
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete game:', error);
    }
  };

  const handleClearAllData = async () => {
    if (!db) return;
    try {
      await clearAllData(db);
      // Reload the application to re-initialize the database
      window.location.reload();
    } catch (error) {
      console.error('Failed to clear all data:', error);
    }
  };

  if (isLoading) {
    return (
      <div className='flex flex-col items-center justify-center pt-20'>
        <FontAwesomeIcon icon={faSpinner} spin size='3x' className='text-primary' />
        <p className='mt-4 text-foreground/60'>Loading Games...</p>
      </div>
    );
  }

  return (
    <div className='relative min-h-screen'>
      {/* Main Content Area */}
      <main className='p-4 sm:p-6 lg:p-8'>
        {/* Page Header */}
        <div className='flex justify-between items-center mb-6'>
          <div>
            <h2 className='text-3xl font-bold text-foreground'>Your Games</h2>
            <p className='text-foreground/60 mt-1'>
              {games.length > 0 ? "Here's what you've been playing." : "Let's get started!"}
            </p>
          </div>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className='text-foreground/60 hover:text-primary transition-colors p-2 cursor-pointer'
            aria-label='Open settings'>
            <FontAwesomeIcon icon={faCog} size='2x' />
          </button>
        </div>

        {games.length === 0 ? (
          <EmptyState />
        ) : (
          <GameList games={games} onDelete={(game) => setShowDeleteConfirm(game)} />
        )}
      </main>

      {/* Floating Action Button (FAB) */}
      <Link
        href='/app/new'
        className='fixed bottom-6 right-6 bg-primary text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:scale-105 hover:shadow-xl transition-transform'
        aria-label='Create new game'>
        <FontAwesomeIcon icon={faPlus} size='2x' />
      </Link>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className='fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50'>
          <div className='bg-background p-6 rounded-lg shadow-2xl w-full max-w-md border border-border'>
            <div className='flex justify-between items-center mb-4'>
              <h3 className='text-2xl font-bold text-foreground'>Settings</h3>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className='text-foreground/60 hover:text-red-500 cursor-pointer'>
                <FontAwesomeIcon icon={faTimes} size='lg' />
              </button>
            </div>
            <div className='space-y-4'>
              <a
                href='https://github.com/onebuffalolabs/tally-pad'
                target='_blank'
                rel='noopener noreferrer'
                className='flex items-center justify-between p-4 bg-foreground/5 rounded-lg hover:bg-foreground/10 transition-colors'>
                <div className='flex items-center gap-4'>
                  <FontAwesomeIcon icon={faGithub} className='text-secondary' size='2x' />
                  <div>
                    <p className='font-semibold text-foreground'>View on GitHub</p>
                    <p className='text-sm text-foreground/60'>
                      Help improve TallyPad or report an issue.
                    </p>
                  </div>
                </div>
              </a>
              <div className='p-4 bg-foreground/5 rounded-lg'>
                <p className='text-sm text-foreground/60 text-center'>App Version: {version}</p>
              </div>
              <button
                onClick={() => {
                  setIsSettingsOpen(false);
                  setShowClearConfirm(true);
                }}
                className='w-full cursor-pointer bg-red-600/10 text-red-500 font-bold py-3 rounded-lg hover:bg-red-600 hover:text-white transition-colors flex items-center justify-center gap-2'>
                <FontAwesomeIcon icon={faExclamationTriangle} />
                Clear All Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Game Confirmation Modal */}
      {showDeleteConfirm && (
        <div className='fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50'>
          <div className='bg-background p-6 rounded-lg shadow-2xl w-full max-w-sm border border-border text-center'>
            <FontAwesomeIcon icon={faExclamationTriangle} className='text-accent text-4xl mb-4' />
            <h3 className='text-lg font-bold mb-2 text-foreground'>Are you sure?</h3>
            <p className='text-sm text-foreground/60 mb-6'>
              This will permanently delete the &quot;{showDeleteConfirm.name}&quot; game. This
              action cannot be undone.
            </p>
            <div className='grid grid-cols-2 gap-2'>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className='bg-gray-500 text-white font-semibold py-3 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer'>
                Cancel
              </button>
              <button
                onClick={handleDeleteGame}
                className='bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition-colors cursor-pointer'>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Data Confirmation Modal */}
      {showClearConfirm && (
        <div className='fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50'>
          <div className='bg-background p-6 rounded-lg shadow-2xl w-full max-w-sm border border-border text-center'>
            <FontAwesomeIcon icon={faExclamationTriangle} className='text-red-500 text-4xl mb-4' />
            <h3 className='text-lg font-bold mb-2 text-foreground'>Delete All Game Data?</h3>
            <p className='text-sm text-foreground/60 mb-6'>
              Are you absolutely sure? This will permanently delete all your saved games. This
              action cannot be undone.
            </p>
            <div className='grid grid-cols-2 gap-2'>
              <button
                onClick={() => setShowClearConfirm(false)}
                className='bg-gray-500 text-white font-semibold py-3 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer'>
                Cancel
              </button>
              <button
                onClick={handleClearAllData}
                className='bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition-colors cursor-pointer'>
                Yes, Delete Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Helper function and Child Components ---

const getGameIcon = (gameName: string): IconDefinition => {
  const lowerCaseName = gameName.toLowerCase();
  if (lowerCaseName.includes('phase 10')) return faLayerGroup;
  if (lowerCaseName.includes('simple score')) return faClipboardList;
  return faDice; // Default icon
};

const GameList = ({ games, onDelete }: { games: Game[]; onDelete: (game: Game) => void }) => (
  <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
    {games.map((game) => (
      <GameCard key={game._id} game={game} onDelete={onDelete} />
    ))}
  </div>
);

const GameCard = ({ game, onDelete }: { game: Game; onDelete: (game: Game) => void }) => {
  const { _id, name, status, date, players, lastPlayed } = game;
  const isInProgress = status === 'In Progress';
  const cardBgColor = isInProgress ? 'bg-primary' : 'bg-secondary';
  const textColor = 'text-white';
  const subTextColor = 'text-white/80';
  const avatarStyles = isInProgress ? 'bg-white text-primary' : 'bg-white text-secondary';

  // Format the lastPlayed timestamp to include the time. Fallback to the original date.
  const displayDate = lastPlayed
    ? new Date(lastPlayed).toLocaleString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    : date;

  return (
    <div
      className={`relative ${cardBgColor} rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all group`}>
      <Link href={`/app/game?id=${_id}`} className='block p-5'>
        {/* === TOP SECTION OF THE CARD === */}
        <div className='flex justify-between items-start'>
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full bg-white/20 ${textColor}`}>
            {status}
          </span>
        </div>

        {/* === MIDDLE SECTION OF THE CARD (MODIFIED) === */}
        <div className='flex items-center gap-3 mt-3'>
          <FontAwesomeIcon icon={getGameIcon(name)} className={`h-6 w-6 text-white/70`} />
          <h3 className={`font-bold text-xl ${textColor} truncate`}>{name}</h3>
        </div>
        {/* Updated to display the new formatted date with time */}
        <p className={`text-sm ${subTextColor} mt-1 ml-9`}>{displayDate}</p>

        {/* === BOTTOM SECTION OF THE CARD === */}
        <div className='flex items-center justify-between mt-6'>
          <div className='flex -space-x-2'>
            {players.slice(0, 5).map((player: string, index: number) => (
              <div
                key={index}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${avatarStyles} ring-2 ${
                  isInProgress ? 'ring-primary' : 'ring-secondary'
                }`}>
                {player.charAt(0).toUpperCase()}
              </div>
            ))}
          </div>
          <span
            className={`text-sm font-medium ${textColor} opacity-0 group-hover:opacity-100 transition-opacity`}>
            Open &rarr;
          </span>
        </div>
      </Link>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(game);
        }}
        aria-label={`Delete ${name} game`}
        className='cursor-pointer absolute top-2 right-2 p-2 text-white/60 hover:text-white hover:bg-white/20 rounded-full transition-colors opacity-0 group-hover:opacity-100'>
        <FontAwesomeIcon icon={faTrash} />
      </button>
    </div>
  );
};

const EmptyState = () => (
  <div className='text-center py-20 flex flex-col items-center'>
    <div className='bg-secondary/10 rounded-full p-6'>
      <FontAwesomeIcon icon={faClipboardList} className='text-secondary h-16 w-16' size='3x' />
    </div>
    <h2 className='text-3xl font-bold mt-6'>No Games Yet!</h2>
    <p className='text-foreground/60 mt-2 max-w-sm'>
      It looks like your scoresheet is empty. Tap the &apos;+&apos; button to get started.
    </p>
  </div>
);
