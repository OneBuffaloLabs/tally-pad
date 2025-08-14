import { Game } from '@/types';

interface VersionDoc {
  _id: string;
  _rev?: string;
  version: number;
}
const DB_VERSION = 2;

const migrateDB = async (db: PouchDB.Database<any>, fromVersion: number) => {
  if (fromVersion < 2) {
    const { rows } = await db.allDocs({ include_docs: true });
    const docsToUpdate = rows
      .map(({ doc }) => {
        if (doc && doc._id && !doc._id.startsWith('_local/')) {
          const gameDoc = doc as Game;
          (gameDoc as any).lastPlayed = new Date(gameDoc.date).getTime();
          return gameDoc;
        }
        return null;
      })
      .filter((doc) => doc !== null);

    if (docsToUpdate.length > 0) {
      await db.bulkDocs(docsToUpdate as any);
    }
  }
};

export const initDB = async (db: PouchDB.Database<any>) => {
  try {
    const versionDoc = (await db.get('_local/version')) as VersionDoc;
    if (versionDoc.version < DB_VERSION) {
      await migrateDB(db, versionDoc.version);
      await db.put({ ...versionDoc, version: DB_VERSION });
    }
  } catch (err: any) {
    if (err.name === 'not_found') {
      await db.put({ _id: '_local/version', version: DB_VERSION } as VersionDoc);
    }
  }
};

export const getAllGames = async (db: PouchDB.Database<any>): Promise<Game[]> => {
  const result = await db.allDocs({ include_docs: true });
  return result.rows
    .filter((row) => !row.id.startsWith('_local/') && row.doc)
    .map((row) => row.doc as Game);
};

export const getGame = async (db: PouchDB.Database<any>, id: string): Promise<Game> => {
  return db.get(id) as Promise<Game>;
};

export const createGame = async (
  db: PouchDB.Database<any>,
  game: Partial<Game>
): Promise<PouchDB.Core.Response> => {
  return db.post(game as Omit<Game, '_id' | '_rev'>);
};

export const updateGame = async (
  db: PouchDB.Database<any>,
  gameId: string,
  updates: Partial<Game>
): Promise<PouchDB.Core.Response> => {
  const doc = await db.get(gameId);
  const updatedDoc = { ...doc, ...updates };
  return await db.put(updatedDoc);
};
