import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { theme } from '@/theme';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
  colors: typeof theme.colors;
  spacing: typeof theme.spacing;
  borderRadius: typeof theme.borderRadius;
  typography: typeof theme.typography;
  shadows: typeof theme.shadows;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>(systemColorScheme || 'light');

  useEffect(() => {
    if (systemColorScheme) {
      setMode(systemColorScheme);
    }
  }, [systemColorScheme]);

  const toggleTheme = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const value = {
    mode,
    toggleTheme,
    colors: {
      ...theme.colors,
      background: theme.colors.background[mode],
      text: theme.colors.text[mode],
      border: theme.colors.border[mode],
    },
    spacing: theme.spacing,
    borderRadius: theme.borderRadius,
    typography: theme.typography,
    shadows: theme.shadows,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
