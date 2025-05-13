'use client';
import { DataContextProvider } from './dataContext';
import { UserThemeProvider } from './themeContext';
import { UserContextProvider } from './userContext';

// Lägg till dessa rader:
export { useDataContext } from './dataContext';
export { useThemeContext } from './themeContext';
export { useUserContext } from './userContext';

export default function AppProvider({ children }) {
  return (
    <UserThemeProvider>
      <DataContextProvider>
        <UserContextProvider>
          {children}
        </UserContextProvider>
      </DataContextProvider>
    </UserThemeProvider>
  );
}
