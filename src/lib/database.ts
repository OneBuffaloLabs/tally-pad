import PouchDB from 'pouchdb';
import { Game } from '@/types';

// Define the current version of the database schema.
const DB_VERSION = 2;

// Define a specific type for our versioning document
interface VersionDoc {
  _id: string;
  _rev?: string;
  version: number;
}

let db: PouchDB.Database<Game | VersionDoc>;

// --- Migration Logic ---

/**
 * Applies migrations to the database.
 * @param fromVersion The version the database is currently at.
 */
const migrateDB = async (fromVersion: number) => {
  if (fromVersion < 2) {
    // Migration to version 2: Add a 'lastPlayed' timestamp.
    const { rows } = await db.allDocs({ include_docs: true });

    const docsToUpdate: (Game & PouchDB.Core.PutDocument<Game>)[] = [];

    rows.forEach(({ doc }) => {
      // Ensure the doc exists and is not a local/special document
      if (doc && doc._id && !doc._id.startsWith('_local/')) {
        const gameDoc = doc as Game; // Assert that this is a Game document

        // Add the new field with a default value
        (gameDoc as any).lastPlayed = new Date(gameDoc.date).getTime();

        docsToUpdate.push(gameDoc as Game & PouchDB.Core.PutDocument<Game>);
      }
    });

    if (docsToUpdate.length > 0) {
      await db.bulkDocs(docsToUpdate);
    }
  }
  // Add more "if (fromVersion < X)" blocks for future migrations.
};

// --- Database Initialization ---

/**
 * Initializes the PouchDB database and runs migrations if needed.
 */
export const initDB = async () => {
  if (!db) {
    db = new PouchDB<Game | VersionDoc>('tallypad-games');

    try {
      const versionDoc = (await db.get('_local/version')) as VersionDoc;
      const currentVersion = versionDoc.version || 0;

      if (currentVersion < DB_VERSION) {
        await migrateDB(currentVersion);
        await db.put({ ...versionDoc, version: DB_VERSION });
      }
    } catch (err: any) {
      if (err.name === 'not_found') {
        await db.put({ _id: '_local/version', version: DB_VERSION } as VersionDoc);
      } else {
        console.error('Error checking database version:', err);
      }
    }
  }
  return db;
};

// --- CRUD Operations ---

export const getAllGames = async (): Promise<Game[]> => {
  if (!db) await initDB();
  const result = await db.allDocs({ include_docs: true });
  return result.rows
    .filter((row) => !row.id.startsWith('_local/') && row.doc)
    .map((row) => row.doc as Game);
};

export const getGame = async (id: string): Promise<Game> => {
  if (!db) await initDB();
  return db.get(id) as Promise<Game>;
};

export const saveGame = async (game: Partial<Game>): Promise<PouchDB.Core.Response> => {
  if (!db) await initDB();
  const { _id, ...gameData } = game;

  if (_id) {
    const existingGame = await db.get(_id);
    return db.put({
      ...existingGame,
      ...gameData,
    });
  }

  return db.post(gameData as Omit<Game, '_id' | '_rev'>);
};

export const deleteGame = async (game: Game): Promise<PouchDB.Core.Response> => {
  if (!db) await initDB();
  if (!game._id || !game._rev) {
    throw new Error('A game must have an _id and _rev to be deleted.');
  }
  return db.remove(game._id, game._rev);
};
