'use client';
// /app/context/appprovider.js
import { DataContextProvider } from './dataContext';
import { UserContextProvider } from './userContext';

export default function AppProvider({ children }) {
  return (
    <DataContextProvider>
      <UserContextProvider>{children}</UserContextProvider>
    </DataContextProvider>
  );
}
