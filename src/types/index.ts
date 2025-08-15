// --- Type Definitions ---

// Represents the version document stored in the database
export interface VersionDoc {
  _id: string;
  _rev?: string;
  version: number;
}

// Represents the scores for a single round in Phase 10
export interface Phase10Round {
  [player: string]: {
    score: number;
    phaseCompleted: boolean;
  };
}

// A more specific type for player scores to differentiate between game types
export interface PlayerScores {
  // For "Simple Score" games, we expect a rounds array.
  rounds?: number[];
  // For other games like Yahtzee, we can have various other properties.
  [category: string]: number | 'X' | null | boolean | number[] | undefined;
}

// Defines the shape of a single game session object for TypeScript.
export type Game = {
  _id?: string;
  _rev?: string;
  id: string;
  name: string;
  status: 'In Progress' | 'Completed';
  date: string;
  players: string[];
  scores: {
    [player: string]: PlayerScores; // Use the more specific PlayerScores type
  };
  phase10Rounds?: Phase10Round[];
  lastPlayed?: number;
};

// A union type representing any document that can be in our database
export type PouchDoc = Game | VersionDoc;
