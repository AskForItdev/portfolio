'use client';
// /app/context/usercontext.js
import { useState } from 'react';
import { createContext, useContext } from 'react';

const ThemeContext = createContext();

export const UserThemeProvider = ({ children }) => {
  const [userTheme, setUserTheme] = useState({
    theme: 'light', // Default theme
  });
  const [userLanguage, setUserLanguage] = useState({
    language: 'sv',
  });
  const [hideHeader, setHideHeader] = useState(false);
  const [headerType, setHeaderType] = useState('hide');
  //   TODO: Set default theme and language from cookies
  return (
    <ThemeContext.Provider
      value={{
        userLanguage,
        setUserLanguage,
        userTheme,
        setUserTheme,
        hideHeader,
        setHideHeader,
        headerType,
        setHeaderType,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => {
  return useContext(ThemeContext);
};
