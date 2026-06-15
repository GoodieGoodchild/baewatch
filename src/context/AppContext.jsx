import React, { createContext, useState, useCallback, useEffect, useRef } from 'react';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';

export const AppContext = createContext();

const defaultRelationshipData = {
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
};

export const AppProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);
  const [relationshipData, setRelationshipData] = useState(defaultRelationshipData);

  // Prevents the save effect from echoing back data that just arrived from Firestore
  const fromSnapshot = useRef(false);
  const isLoadedRef = useRef(false);

  useEffect(() => {
    if (!currentUser) {
      setIsLoaded(false);
      isLoadedRef.current = false;
      return;
    }

    const unsubscribe = onSnapshot(doc(db, 'users', currentUser.uid), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        fromSnapshot.current = true;
        setRelationshipData(data.relationshipData || defaultRelationshipData);
      }
      isLoadedRef.current = true;
      setIsLoaded(true);
    });

    return unsubscribe;
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser || !isLoadedRef.current) return;

    if (fromSnapshot.current) {
      fromSnapshot.current = false;
      return;
    }

    setDoc(
      doc(db, 'users', currentUser.uid),
      { relationshipData, updatedAt: new Date() },
      { merge: true }
    ).catch(console.error);
  }, [relationshipData, currentUser]);

  const updateConnectionLevel = useCallback((level) => {
    setRelationshipData((prev) => ({ ...prev, connectionLevel: level }));
  }, []);

  const updateWeatherMood = useCallback((mood) => {
    setRelationshipData((prev) => ({ ...prev, weatherMood: mood }));
  }, []);

  const addMemory = useCallback((memory) => {
    setRelationshipData((prev) => ({
      ...prev,
      memories: [{ ...memory, id: Date.now() }, ...prev.memories],
    }));
  }, []);

  const deleteMemory = useCallback((id) => {
    setRelationshipData((prev) => ({
      ...prev,
      memories: prev.memories.filter((m) => m.id !== id),
    }));
  }, []);

  const addWin = useCallback((win) => {
    setRelationshipData((prev) => ({
      ...prev,
      recentWins: [{ ...win, timestamp: new Date() }, ...prev.recentWins].slice(0, 5),
    }));
  }, []);

  const updateProfile = useCallback((profile) => {
    setRelationshipData((prev) => ({
      ...prev,
      profile: { ...prev.profile, ...profile },
    }));
  }, []);

  const recordCheckIn = useCallback((checkIn) => {
    setRelationshipData((prev) => ({
      ...prev,
      lastCheckIn: { ...checkIn, timestamp: new Date().toISOString() },
      weatherMood: checkIn.weatherMood ?? prev.weatherMood,
      connectionLevel: checkIn.connectionLevel ?? prev.connectionLevel,
      profile: {
        ...prev.profile,
        currentMood: checkIn.moodLabel ?? prev.profile.currentMood,
        cupFullness: checkIn.cupFullness ?? prev.profile.cupFullness,
      },
    }));
  }, []);

  const updateSignals = useCallback((signals) => {
    setRelationshipData((prev) => ({
      ...prev,
      adaptiveSignals: { ...prev.adaptiveSignals, ...signals },
    }));
  }, []);

  const value = {
    isLoaded,
    relationshipData,
    updateConnectionLevel,
    updateWeatherMood,
    addMemory,
    deleteMemory,
    addWin,
    updateProfile,
    recordCheckIn,
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
