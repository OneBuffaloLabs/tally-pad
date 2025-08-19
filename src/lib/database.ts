import { Game, PouchDoc, VersionDoc, CourseTemplate } from '@/types';
import type PouchDB from 'pouchdb-browser';
import { generateId } from './utils';

const DB_VERSION = 2;

const migrateDB = async (db: PouchDB.Database<PouchDoc>, fromVersion: number) => {
  if (fromVersion < 2) {
    const { rows } = await db.allDocs({ include_docs: true });
    const docsToUpdate = rows
      .map(({ doc }) => {
        if (doc && doc._id && !doc._id.startsWith('_local/')) {
          // Create a new object with the added property to satisfy the linter
          const gameDoc: Game = {
            ...(doc as Game),
            lastPlayed: new Date((doc as Game).date).getTime(),
          };
          return gameDoc;
        }
        return null;
      })
      .filter((doc): doc is Game => doc !== null);

    if (docsToUpdate.length > 0) {
      await db.bulkDocs(docsToUpdate);
    }
  }
};

// This function now ACCEPTS a db instance.
export const initDB = async (db: PouchDB.Database<PouchDoc>) => {
  try {
    const versionDoc = (await db.get('_local/version')) as VersionDoc;
    if (versionDoc.version < DB_VERSION) {
      await migrateDB(db, versionDoc.version);
      await db.put({ ...versionDoc, version: DB_VERSION });
    }
  } catch (err) {
    // Type-safe error handling for unknown error types
    if (typeof err === 'object' && err !== null && 'name' in err && err.name === 'not_found') {
      await db.put({ _id: '_local/version', version: DB_VERSION } as VersionDoc);
    } else {
      console.error('An unexpected error occurred during DB initialization:', err);
    }
  }
};

// All CRUD functions accept the db instance.
export const getAllGames = async (db: PouchDB.Database<PouchDoc>): Promise<Game[]> => {
  const result = await db.allDocs({ include_docs: true });
  return result.rows
    .filter((row) => !row.id.startsWith('_local/') && row.doc && !(doc as CourseTemplate).type)
    .map((row) => row.doc as Game);
};

export const getGame = async (db: PouchDB.Database<PouchDoc>, id: string): Promise<Game> => {
  return db.get(id) as Promise<Game>;
};

export const createGame = async (
  db: PouchDB.Database<PouchDoc>,
  game: Partial<Game>
): Promise<PouchDB.Core.Response> => {
  return db.post(game as Omit<Game, '_id' | '_rev'>);
};

export const updateGame = async (
  db: PouchDB.Database<PouchDoc>,
  gameId: string,
  updates: Partial<Game>
): Promise<PouchDB.Core.Response> => {
  const doc = await db.get(gameId);
  const updatedDoc = { ...doc, ...updates };
  return await db.put(updatedDoc);
};

/**
 * Deletes a specific game document from the database.
 * @param db The PouchDB instance.
 * @param gameId The _id of the game to delete.
 * @param gameRev The _rev of the game to delete.
 * @returns A promise that resolves with the PouchDB response.
 */
export const deleteGame = async (
  db: PouchDB.Database<PouchDoc>,
  gameId: string,
  gameRev: string
): Promise<PouchDB.Core.Response> => {
  return db.remove(gameId, gameRev);
};

/**
 * Destroys the entire database, deleting all data.
 * @param db The PouchDB instance.
 * @returns A promise that resolves when the database is destroyed.
 */
export const clearAllData = async (db: PouchDB.Database<PouchDoc>): Promise<void> => {
  await db.destroy();
};

// --- Course Template Functions ---
export const saveCourseTemplate = async (
  db: PouchDB.Database<PouchDoc>,
  course: Omit<CourseTemplate, '_id' | '_rev' | 'type'>
): Promise<PouchDB.Core.Response> => {
  const newCourse: Omit<CourseTemplate, '_rev'> = {
    _id: `course-${generateId()}`,
    type: 'course-template',
    ...course,
  };
  return db.put(newCourse);
};

export const getCourseTemplates = async (
  db: PouchDB.Database<PouchDoc>,
  gameType: 'Golf' | 'Putt-Putt'
): Promise<CourseTemplate[]> => {
  const result = await db.allDocs({ include_docs: true });
  return result.rows
    .filter(
      (row) =>
        row.doc &&
        (row.doc as CourseTemplate).type === 'course-template' &&
        (row.doc as CourseTemplate).gameType === gameType
    )
    .map((row) => row.doc as CourseTemplate);
};

export const deleteCourseTemplate = async (
  db: PouchDB.Database<PouchDoc>,
  courseId: string,
  courseRev: string
): Promise<PouchDB.Core.Response> => {
  return db.remove(courseId, courseRev);
};
