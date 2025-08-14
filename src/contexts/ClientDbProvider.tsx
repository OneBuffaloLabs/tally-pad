'use client';

import { useState, useEffect, ReactNode } from 'react';
import { DbContext } from './DbContext';
import { initDB } from '@/lib/database';
import { PouchDoc } from '@/types'; // Assuming PouchDoc is your union type

export const ClientDbProvider = ({ children }: { children: ReactNode }) => {
  const [db, setDb] = useState<PouchDB.Database<PouchDoc> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      // Dynamically import the PouchDB library only on the client-side.
      const PouchDB = (await import('pouchdb-browser')).default;

      // Now that PouchDB is loaded, we can create the database instance.
      const dbInstance = new PouchDB<PouchDoc>('tallypad-games');

      // Pass the instance to our pure initialization function.
      await initDB(dbInstance);

      setDb(dbInstance);
      setIsLoading(false);
    };

    initialize();
  }, []); // The empty dependency array ensures this runs only once.

  return <DbContext.Provider value={{ db, isLoading }}>{children}</DbContext.Provider>;
};
