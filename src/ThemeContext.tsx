import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { Palette, ThemeName, palettes } from './tokens';

const STORAGE_KEY = '@portfolio/theme';

interface ThemeValue {
  theme: ThemeName;
  colors: Palette;
  isDark: boolean;
  toggle: () => void;
  setTheme: (t: ThemeName) => void;
}

const ThemeContext = createContext<ThemeValue>({
  theme: 'dark',
  colors: palettes.dark,
  isDark: true,
  toggle: () => {},
  setTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const system = useColorScheme();
  const [theme, setThemeState] = useState<ThemeName>('dark');

  useEffect(() => {
    let alive = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!alive) return;
        if (raw === 'dark' || raw === 'light') setThemeState(raw);
        else if (system === 'light') setThemeState('light');
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [system]);

  const setTheme = useCallback((t: ThemeName) => {
    setThemeState(t);
    AsyncStorage.setItem(STORAGE_KEY, t).catch(() => {});
  }, []);

  const toggle = useCallback(() => {
    setThemeState((prev) => {
      const next: ThemeName = prev === 'dark' ? 'light' : 'dark';
      AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
      return next;
    });
  }, []);

  const value = useMemo<ThemeValue>(
    () => ({
      theme,
      colors: palettes[theme],
      isDark: theme === 'dark',
      toggle,
      setTheme,
    }),
    [theme, toggle, setTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
