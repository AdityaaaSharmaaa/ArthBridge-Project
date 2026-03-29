import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/context/AuthContext';
import { RealmProvider } from './src/models/RealmContext';
import { ThemeProvider } from './src/context/ThemeContext';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    <AuthProvider>
      <RealmProvider>
        <ThemeProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </ThemeProvider>
      </RealmProvider>
    </AuthProvider>
  );
}