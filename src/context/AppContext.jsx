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
    checkInHistory: [],
    connectionLevelHistory: [],
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

  const deleteMemory = useCallback((id) => {
    setRelationshipData((prev) => ({
      ...prev,
      memories: prev.memories.filter((m) => m.id !== id),
    }));
  }, []);

  const updateWeatherMood = useCallback((mood) => {
    setRelationshipData((prev) => ({ ...prev, weatherMood: mood }));
  }, []);

  const updateSignals = useCallback((signals) => {
    setRelationshipData((prev) => ({
      ...prev,
      adaptiveSignals: { ...prev.adaptiveSignals, ...signals },
    }));
  }, []);

  const recordCheckIn = useCallback((checkIn) => {
    const todayString = new Date().toISOString().split('T')[0];
    const timestamp = new Date().toISOString();
    setRelationshipData((prev) => {
      const newCheckInEntry = {
        date: todayString,
        stateId: checkIn.stateId,
        cupFullness: checkIn.cupFullness ?? prev.profile?.cupFullness,
        connectionLevel: checkIn.connectionLevel ?? prev.connectionLevel,
        timestamp,
      };
      const newConnectionEntry = {
        date: todayString,
        value: checkIn.connectionLevel ?? prev.connectionLevel,
      };
      return {
        ...prev,
        lastCheckIn: { ...checkIn, timestamp },
        weatherMood: checkIn.weatherMood ?? prev.weatherMood,
        connectionLevel: checkIn.connectionLevel ?? prev.connectionLevel,
        profile: {
          ...prev.profile,
          currentMood: checkIn.moodLabel ?? prev.profile?.currentMood,
          cupFullness: checkIn.cupFullness ?? prev.profile?.cupFullness,
        },
        checkInHistory: [...(prev.checkInHistory || []), newCheckInEntry].slice(-60),
        connectionLevelHistory: [...(prev.connectionLevelHistory || []), newConnectionEntry].slice(-30),
      };
    });
  }, []);

  const isLoaded = true;

  const value = {
    currentPage,
    goToPage,
    isLoaded,
    relationshipData,
    updateConnectionLevel,
    updateWeatherMood,
    addMemory,
    deleteMemory,
    addWin,
    updateProfile,
    updateSignals,
    recordCheckIn,
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
