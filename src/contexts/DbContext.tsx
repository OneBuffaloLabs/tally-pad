'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import PouchDB from 'pouchdb-browser';
import { Game } from '@/types';
import { initDB } from '@/lib/database';

// Define the shape of the context data
interface DbContextType {
  db: PouchDB.Database<Game | any> | null;
  isLoading: boolean;
}

// Create the context with a default value
const DbContext = createContext<DbContextType>({ db: null, isLoading: true });

// Custom hook to easily access the context
export const useDb = () => useContext(DbContext);

// The provider component that will wrap our app
export const DbProvider = ({ children }: { children: ReactNode }) => {
  const [db, setDb] = useState<PouchDB.Database<Game | any> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This effect runs only on the client side
    const initialize = async () => {
      const dbInstance = await initDB();
      setDb(dbInstance);
      setIsLoading(false);
    };
    initialize();
  }, []);

  return <DbContext.Provider value={{ db, isLoading }}>{children}</DbContext.Provider>;
};
