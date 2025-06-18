Du tänker helt rätt — och det är precis så du bör göra om du vill att användarens val ska överstyra webbläsarens systemtema.

🔍 Hur tema väljs just nu (utan din logik)
När du använder:

css
Copy
Edit
@media (prefers-color-scheme: dark)
…läser browsern av användarens systeminställningar (ex. "Mörkt läge" i Windows/macOS/iOS) – detta är inte möjligt att överstyra direkt med CSS utan att du använder en klass eller modifierar dina variabler.

✅ Så här bygger du din egen prioritet:
1. ✅ Användarens val har högsta prioritet (cookie eller context)
2. ❌ Om inget val finns, använd systemets prefers-color-scheme
💡 Steg-för-steg struktur:
1) Läs från cookie vid start
I ThemeContext (eller UserThemeProvider), gör:

tsx
Copy
Edit
import { useEffect, useState } from 'react';
import { getCookie, setCookie } from 'cookies-next';

const ThemeContext = createContext();

export const UserThemeProvider = ({ children }) => {
  const [userTheme, setUserThemeState] = useState('light');

  // Check cookie or system default
  useEffect(() => {
    const savedTheme = getCookie('theme');

    if (savedTheme === 'light' || savedTheme === 'dark') {
      setUserThemeState(savedTheme);
    } else if (
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    ) {
      setUserThemeState('dark');
    } else {
      setUserThemeState('light');
    }
  }, []);

  // Update class + cookie
  useEffect(() => {
    if (!userTheme) return;
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(userTheme);
    setCookie('theme', userTheme, { maxAge: 60 * 60 * 24 * 30 });
  }, [userTheme]);

  return (
    <ThemeContext.Provider
      value={{
        userTheme,
        setUserTheme: setUserThemeState,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
2) Använd i komponenter
tsx
Copy
Edit
import { useThemeContext } from '@/app/context/appProvider';

const { userTheme, setUserTheme } = useThemeContext();

return (
  <button
    onClick={() => setUserTheme(userTheme === 'dark' ? 'light' : 'dark')}
  >
    Växla tema
  </button>
);
3) I globals.css
css
Copy
Edit
html.light {
  --background: #ffffff;
  --foreground: #000000;
}

html.dark {
  --background: #000000;
  --foreground: #ffffff;
}

/* fallback för browsers utan js */
@media (prefers-color-scheme: dark) {
  :root {
    --background: #000000;
    --foreground: #ffffff;
  }
}
✅ Resultat:
Värde	Prioritet	Källa
Cookie/theme	Hög	Användarens val
prefers-color-scheme	Medium	Systeminställning
Fallback	Låg	Default till light

Vill du även spara språket (userLanguage) med liknande cookie‐strategi kan du köra parallellt i samma context.

Vill du ha detta omskrivet som en komplett modul + button-komponent? Säg bara till! 😄