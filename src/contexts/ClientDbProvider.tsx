'use client';

import { useState, useEffect, ReactNode } from 'react';
import PouchDB from 'pouchdb-browser';
import { DbContext } from './DbContext';
import { initDB } from '@/lib/database';
import { Game } from '@/types';

export const ClientDbProvider = ({ children }: { children: ReactNode }) => {
  const [db, setDb] = useState<PouchDB.Database<Game | any> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const dbInstance = new PouchDB<Game | any>('tallypad-games');
    initDB(dbInstance).then(() => {
      setDb(dbInstance);
      setIsLoading(false);
    });
  }, []);

  return <DbContext.Provider value={{ db, isLoading }}>{children}</DbContext.Provider>;
};
