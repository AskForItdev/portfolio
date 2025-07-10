import { useDataContext } from './dataContext';
import { useLiveContext } from './LiveContext';
import { useThemeContext } from './themeContext';
import { useUserContext } from './userContext';

export function useAppContext() {
  return {
    ...useDataContext(),
    ...useLiveContext(),
    ...useThemeContext(),
    ...useUserContext(),
  };
}
