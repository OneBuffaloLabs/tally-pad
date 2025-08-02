import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { Game } from '@/types'; // Import the Game type

// --- Mock Data ---
// In a real app, this would come from local storage and be validated against the Game type.
const games: Game[] = [
  {
    id: '1',
    name: 'Rummy Night',
    status: 'In Progress',
    date: 'August 1, 2025',
    players: ['A', 'B', 'C'],
  },
  {
    id: '2',
    name: 'Phase 10 Fun',
    status: 'Completed',
    date: 'July 28, 2025',
    players: ['D', 'E', 'F', 'G'],
  },
  {
    id: '3',
    name: 'Putt Putt',
    status: 'Completed',
    date: 'July 25, 2025',
    players: ['H', 'I'],
  },
];

// Set to true to see the empty state, false to see the game list.
const noGames = false;

// --- Main Page Component ---
export default function Home() {
  return (
    <div className='bg-background min-h-screen text-foreground'>
      {/* Header */}
      <header className='p-4 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10'>
        <h1 className='text-xl font-bold'>TallyPad</h1>
      </header>

      {/* Main Content Area */}
      <main className='p-4 sm:p-6'>{noGames ? <EmptyState /> : <GameList />}</main>

      {/* Floating Action Button (FAB) */}
      <a
        href='#' // Link to the "Create New Game" page/modal
        className='fixed bottom-6 right-6 bg-primary text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:scale-105 hover:shadow-xl transition-transform'
        aria-label='Create new game'>
        <FontAwesomeIcon icon={faPlus} className='w-6 h-6' />
      </a>
    </div>
  );
}

// --- Child Components ---

const GameList = () => (
  <>
    <h2 className='text-2xl font-semibold mb-4'>Your Games</h2>
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
      {games.map((game) => (
        <GameCard key={game.id} {...game} />
      ))}
    </div>
  </>
);

// The GameCard now accepts props that match the Game type.
const GameCard = ({ id, name, status, date, players }: Game) => {
  const statusColor =
    status === 'In Progress' ? 'bg-accent/20 text-accent-dark' : 'bg-gray-200 text-gray-700';

  return (
    <a
      href={`/game/${id}`}
      className='block bg-white dark:bg-foreground/5 p-4 rounded-lg border border-border shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group'>
      <div className='flex justify-between items-start'>
        <h3 className='font-bold text-lg text-foreground'>{name}</h3>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColor}`}>
          {status}
        </span>
      </div>
      <p className='text-sm text-foreground/60 mt-1'>{date}</p>
      <div className='flex items-center space-x-2 mt-4'>
        <p className='text-sm font-medium text-foreground/80'>Players:</p>
        <div className='flex -space-x-2'>
          {/* The 'player' parameter is now explicitly a string. */}
          {players.map((player: string) => (
            <div
              key={player}
              className='w-7 h-7 rounded-full bg-secondary text-white flex items-center justify-center text-xs font-bold border-2 border-white dark:border-foreground/5'>
              {player}
            </div>
          ))}
        </div>
      </div>
    </a>
  );
};

const EmptyState = () => (
  <div className='text-center py-20'>
    <h2 className='text-2xl font-semibold mb-2'>No Games Yet!</h2>
    <p className='text-foreground/60'>Tap the &apos;+&apos; button to start a new one.</p>
  </div>
);
