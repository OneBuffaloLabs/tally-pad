// --- Type Definitions ---

// Represents the version document stored in the database
export interface VersionDoc {
  _id: string;
  _rev?: string;
  version: number;
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
    [player: string]: {
      [category: string]: number | 'X' | null;
    };
  };
  lastPlayed?: number;
};

// A union type representing any document that can be in our database
export type PouchDoc = Game | VersionDoc;
