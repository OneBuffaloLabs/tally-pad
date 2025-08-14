'use client';

import { createContext, useContext } from 'react';
import { Game } from '@/types';

// Define the shape of the context data
export interface DbContextType {
  db: PouchDB.Database<Game | any> | null;
  isLoading: boolean;
}

// Create the context with a default value
export const DbContext = createContext<DbContextType>({ db: null, isLoading: true });

// Custom hook to easily access the context
export const useDb = () => useContext(DbContext);
