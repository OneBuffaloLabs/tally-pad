import PouchDB from 'pouchdb-browser';
import { Game } from '@/types';

// Define a specific type for our versioning document
interface VersionDoc {
  _id: string;
  _rev?: string;
  version: number;
}

let dbInstance: PouchDB.Database<Game | VersionDoc> | null = null;

/**
 * This function safely creates and returns a singleton PouchDB instance,
 * guaranteeing it only ever runs in the browser.
 */
export const getClientDB = () => {
  if (!dbInstance && typeof window !== 'undefined') {
    dbInstance = new PouchDB<Game | VersionDoc>('tallypad-games');
  }
  return dbInstance;
};
