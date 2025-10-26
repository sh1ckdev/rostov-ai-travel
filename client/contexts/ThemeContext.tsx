import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@app_theme';

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<Theme>('system');
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
          setThemeState(savedTheme as Theme);
        } else {
          setThemeState('dark');
        }
      } catch (error) {
        console.error('Ошибка загрузки темы:', error);
        setThemeState('dark');
      }
    };
    loadTheme();
  }, []);

  useEffect(() => {
    if (theme === 'system') {
      setIsDark(systemColorScheme === 'dark');
    } else {
      setIsDark(theme === 'dark');
    }
  }, [theme, systemColorScheme]);

  const setTheme = async (newTheme: Theme) => {
    try {
      setThemeState(newTheme);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (error) {
      console.error('Ошибка сохранения темы:', error);
    }
  };

  const toggleTheme = () => {
    if (theme === 'system') {
      setTheme(systemColorScheme === 'dark' ? 'light' : 'dark');
    } else {
      setTheme(theme === 'light' ? 'dark' : 'light');
    }
  };

  const value: ThemeContextType = {
    theme,
    isDark,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme должен использоваться внутри ThemeProvider');
  }
  return context;
};
