// --- Type Definitions ---
// Defines the shape of a single game session object for TypeScript.
export type Game = {
  id: string;
  name: string;
  status: 'In Progress' | 'Completed';
  date: string;
  players: string[];
};
