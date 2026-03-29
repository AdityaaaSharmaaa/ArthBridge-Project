import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth } from '../config/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Listen for user state changes (logged in or logged out)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (usr) => {
      setUser(usr);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Standardized Authentication Functions
  const login = async (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (email: string, password: string) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    return signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);