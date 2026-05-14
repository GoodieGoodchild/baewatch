import React, { createContext, useState, useCallback, useEffect } from 'react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState('splash');
  const [relationshipData, setRelationshipData] = useState({
    profile: {
      yourName: '',
      partnerName: '',
      nickname: 'your person',
      relationshipStage: 'together',
      relationshipLength: '',
      partnerNeed: 'Emotional support',
      supportPreference: 'Quality time',
      currentMood: 'Needs connection',
      cupFullness: 72,
      partnerNotes: '',
    },
    connectionLevel: 72,
    weatherMood: 'cloudy',
    lastCheckIn: null,
    memories: [],
    recentWins: [],
    adaptiveSignals: {
      affectionProfile: null,
      stressRhythm: null,
      supportPreferences: null,
      conversationStyle: null,
    },
  });

  // Load data from Firestore on user login
  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setRelationshipData(data.relationshipData || relationshipData);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();

    // Set up real-time listener
    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setRelationshipData(data.relationshipData || relationshipData);
      }
    });

    return unsubscribe;
  }, [user]);

  // Save data to Firestore when relationshipData changes
  useEffect(() => {
    if (!user) return;

    const saveData = async () => {
      try {
        await setDoc(doc(db, 'users', user.uid), {
          relationshipData,
          updatedAt: new Date(),
        }, { merge: true });
      } catch (error) {
        console.error('Error saving data:', error);
      }
    };

    saveData();
  }, [relationshipData, user]);

  const goToPage = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  const updateConnectionLevel = useCallback((level) => {
    setRelationshipData((prev) => ({ ...prev, connectionLevel: level }));
  }, []);

  const addMemory = useCallback((memory) => {
    setRelationshipData((prev) => ({
      ...prev,
      memories: [memory, ...prev.memories],
    }));
  }, []);

  const addWin = useCallback((win) => {
    setRelationshipData((prev) => ({
      ...prev,
      recentWins: [{ ...win, timestamp: new Date() }, ...prev.recentWins].slice(0, 5),
    }));
  }, []);

  const updateProfile = useCallback((profile) => {
    setRelationshipData((prev) => ({ ...prev, profile: { ...prev.profile, ...profile } }));
  }, []);

  const updateSignals = useCallback((signals) => {
    setRelationshipData((prev) => ({
      ...prev,
      adaptiveSignals: { ...prev.adaptiveSignals, ...signals },
    }));
  }, []);

  const value = {
    currentPage,
    goToPage,
    relationshipData,
    updateConnectionLevel,
    addMemory,
    addWin,
    updateProfile,
    updateSignals,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = React.useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
