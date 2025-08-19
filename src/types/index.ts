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

// Represents the scores for a single round in Golf
export interface GolfRound {
  par: number;
}

// A more specific type for player scores to differentiate between game types
export interface PlayerScores {
  // For "Simple Score" and "Golf" games, we expect a rounds array.
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
  golfRounds?: GolfRound[];
  lastPlayed?: number;
};

// Defines the shape of a saved course template
export interface CourseTemplate {
  _id: string;
  _rev?: string;
  type: 'course-template';
  name: string;
  gameType: 'Golf' | 'Putt-Putt';
  holeCount: number;
  pars: number[];
}

// A union type representing any document that can be in our database
export type PouchDoc = Game | VersionDoc | CourseTemplate;
