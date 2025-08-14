import PouchDB from 'pouchdb-browser';
import { Game } from '@/types';

// Interfaces remain the same
interface VersionDoc {
  _id: string;
  _rev?: string;
  version: number;
}
const DB_VERSION = 2;

// initDB is now only responsible for initialization and migration logic
export const initDB = async (): Promise<PouchDB.Database<Game | any>> => {
  const db = new PouchDB<Game | VersionDoc>('tallypad-games');

  try {
    const versionDoc = (await db.get('_local/version')) as VersionDoc;
    if (versionDoc.version < DB_VERSION) {
      // Migration logic would run here
      await db.put({ ...versionDoc, version: DB_VERSION });
    }
  } catch (err: any) {
    if (err.name === 'not_found') {
      await db.put({ _id: '_local/version', version: DB_VERSION } as VersionDoc);
    }
  }
  return db;
};

// All CRUD functions now accept the db instance from the context
export const getAllGames = async (db: PouchDB.Database<Game | any>): Promise<Game[]> => {
  const result = await db.allDocs({ include_docs: true });
  return result.rows
    .filter((row) => !row.id.startsWith('_local/') && row.doc)
    .map((row) => row.doc as Game);
};

export const getGame = async (db: PouchDB.Database<Game | any>, id: string): Promise<Game> => {
  return db.get(id) as Promise<Game>;
};

export const createGame = async (
  db: PouchDB.Database<Game | any>,
  game: Partial<Game>
): Promise<PouchDB.Core.Response> => {
  return db.post(game as Omit<Game, '_id' | '_rev'>);
};

export const updateGame = async (
  db: PouchDB.Database<Game | any>,
  gameId: string,
  updates: Partial<Game>
): Promise<PouchDB.Core.Response> => {
  const doc = await db.get(gameId);
  const updatedDoc = { ...doc, ...updates };
  return await db.put(updatedDoc);
};
