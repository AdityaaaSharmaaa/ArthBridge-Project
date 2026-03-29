import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';

// The Premium FinTech Palettes
export const lightTheme = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  text: '#0F172A',
  subText: '#64748B',
  primary: '#1E293B',
  primaryText: '#FFFFFF',
  accent: '#3B82F6',
  border: '#E2E8F0',
  success: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
  cardAlt: '#F1F5F9'
};

export const darkTheme = {
  background: '#0B1120',      // Deep premium dark
  surface: '#1E293B',         // Elevated dark cards
  text: '#F8FAFC',            // High contrast text
  subText: '#94A3B8',         // Muted dark text
  primary: '#38BDF8',         // Neon blue accent for dark mode
  primaryText: '#0B1120',     // Dark text on primary buttons
  accent: '#8B5CF6',          // Purple AI accent
  border: '#334155',          // Subtle dark borders
  success: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
  cardAlt: '#0F172A'
};

type Theme = typeof lightTheme;

interface ThemeContextProps {
  theme: Theme;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps>({
  theme: lightTheme,
  isDarkMode: false,
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');

  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);