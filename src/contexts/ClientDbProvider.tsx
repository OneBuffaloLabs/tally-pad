'use client';

import { useState, useEffect, ReactNode } from 'react';
import { DbContext } from './DbContext';
import { initDB } from '@/lib/database';
import { Game } from '@/types';
import type PouchDB from 'pouchdb-browser';

export const ClientDbProvider = ({ children }: { children: ReactNode }) => {
  const [db, setDb] = useState<PouchDB.Database<Game | any> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      // Dynamically import pouchdb-browser ONLY on the client
      const PouchDB = (await import('pouchdb-browser')).default;

      const dbInstance = new PouchDB<Game | any>('tallypad-games');
      await initDB(dbInstance); // Pass the instance to our pure init function

      setDb(dbInstance);
      setIsLoading(false);
    };

    initialize();
  }, []);

  return <DbContext.Provider value={{ db, isLoading }}>{children}</DbContext.Provider>;
};
