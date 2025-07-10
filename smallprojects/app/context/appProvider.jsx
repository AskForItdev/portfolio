'use client';
import { DataContextProvider } from './dataContext';
import { LiveContextProvider } from './LiveContext';
import { UserThemeProvider } from './themeContext';
import { UserContextProvider } from './userContext';

export { useDataContext } from './dataContext';
export { useLiveContext } from './LiveContext';
export { useThemeContext } from './themeContext';
export { useUserContext } from './userContext';

export default function AppProvider({ children }) {
  return (
    <UserThemeProvider>
      <LiveContextProvider>
        <DataContextProvider>
          <UserContextProvider>
            {children}
          </UserContextProvider>
        </DataContextProvider>
      </LiveContextProvider>
    </UserThemeProvider>
  );
}
