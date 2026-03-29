import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext'; // 1. IMPORT AUTH

export const RealmContext = createContext<any>(null);

export const RealmProvider = ({ children }: any) => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const { user } = useAuth(); // 2. GET CURRENT USER

  useEffect(() => {
    // 3. IF LOGGED OUT, CLEAR DATA AND STOP
    if (!user) {
      setTransactions([]);
      return;
    }

    console.log(`[Firebase] Fetching private data for User: ${user.email}`);
    let unsubscribe: (() => void) | undefined;

    try {
        // 4. THE MAGIC: Point to the user's PRIVATE subcollection
        const q = query(
            collection(db, 'users', user.uid, 'transactions'), 
            orderBy('date', 'desc')
        );
        
        unsubscribe = onSnapshot(q, (snapshot) => {
          const txData = snapshot.docs.map(doc => {
            const data = doc.data();
            let parsedDate = new Date();
            if (data.date) {
                if (typeof data.date.toDate === 'function') parsedDate = data.date.toDate();
                else if (typeof data.date === 'string' || typeof data.date === 'number') parsedDate = new Date(data.date);
            }
            return { _id: doc.id, ...data, date: parsedDate };
          });
          
          setTransactions(txData);
        }, (error) => {
          console.error("[Firebase] Listen Error:", error);
        });

    } catch (error) {
        console.error("[Firebase] Init Error:", error);
    }

    return () => {
        if (unsubscribe) unsubscribe();
    };
  }, [user]); // 5. RE-RUN WHENEVER THE USER LOGS IN OR OUT

  return (
    <RealmContext.Provider value={{ transactions }}>
      {children}
    </RealmContext.Provider>
  );
};

export const useQuery = (schema: string) => {
  const ctx = useContext(RealmContext);
  if (!ctx) return [];
  const data = schema === 'Transaction' ? ctx.transactions : [];
  (data as any).sorted = () => data;
  return data;
};

export const useRealm = () => ({}); 

export const RealmContextObj = { RealmProvider, useRealm, useQuery };