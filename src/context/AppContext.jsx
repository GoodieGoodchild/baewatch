import React, { createContext, useState, useCallback, useEffect, useRef } from 'react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';

export const AppContext = createContext();

const getCurrentWeekString = () => {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const week = Math.ceil(((now - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${week}`;
};

export const AppProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [currentPage, setCurrentPage] = useState('splash');
  const [isLoaded, setIsLoaded] = useState(false);
  const [relationshipData, setRelationshipData] = useState({
    profile: {
      yourName: '',
      partnerName: '',
      nickname: 'your person',
      relationshipStage: 'together',
      relationshipLength: '',
      // About YOU — captured in onboarding, never guessed about your partner.
      yourMood: '',
      yourNeed: '',
      yourLoveLanguage: '',
      cupFullness: 72,
      // What you've learned about your partner (their own primary love language,
      // ideally synced from their device; can also be noted on the Love Languages page).
      partnerLoveLanguage: '',
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
    weeklyRecap: { weekOf: '', dismissed: false },
    dailyAnswers: {},
    bucketList: [],
    repairCommitments: [],
    selfInsight: null,
  });

  // Guards against the save-on-load echo: skip the save that a snapshot triggers.
  const fromSnapshot = useRef(false);

  // Real-time sync with Firestore for the logged-in user.
  useEffect(() => {
    if (!currentUser) {
      setIsLoaded(false);
      return;
    }

    const unsubscribe = onSnapshot(doc(db, 'users', currentUser.uid), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.relationshipData) {
          fromSnapshot.current = true;
          setRelationshipData((prev) => ({ ...prev, ...data.relationshipData }));
        }
      }
      setIsLoaded(true);
    }, (error) => {
      console.error('Error loading data:', error);
      setIsLoaded(true);
    });

    return unsubscribe;
  }, [currentUser]);

  // Persist changes — but not the change that came from a snapshot.
  useEffect(() => {
    if (!currentUser || !isLoaded) return;
    if (fromSnapshot.current) {
      fromSnapshot.current = false;
      return;
    }

    const saveData = async () => {
      try {
        await setDoc(doc(db, 'users', currentUser.uid), {
          relationshipData,
          updatedAt: new Date(),
        }, { merge: true });
      } catch (error) {
        console.error('Error saving data:', error);
      }
    };

    saveData();
  }, [relationshipData, currentUser, isLoaded]);

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

  const updateWeatherMood = useCallback((mood) => {
    setRelationshipData((prev) => ({ ...prev, weatherMood: mood }));
  }, []);

  const recordCheckIn = useCallback(
    ({ stateId, moodLabel, weatherMood, cupFullness, connectionLevel, note, needs }) => {
      const dateStr = new Date().toISOString().slice(0, 10);
      const timestamp = new Date().toISOString();
      setRelationshipData((prev) => {
        const newCheckIn = { date: dateStr, timestamp, stateId, moodLabel, cupFullness, connectionLevel, note, needs };
        const newConnPoint = { date: dateStr, value: connectionLevel };
        return {
          ...prev,
          lastCheckIn: dateStr,
          // A personal check-in updates the shared weather + your own cup.
          weatherMood: weatherMood ?? prev.weatherMood,
          connectionLevel: connectionLevel ?? prev.connectionLevel,
          profile: { ...prev.profile, yourMood: stateId ?? prev.profile?.yourMood, cupFullness: cupFullness ?? prev.profile?.cupFullness },
          checkInHistory: [...(prev.checkInHistory || []), newCheckIn].slice(-60),
          connectionLevelHistory: [...(prev.connectionLevelHistory || []), newConnPoint].slice(-14),
        };
      });
    },
    []
  );

  const dismissWeeklyRecap = useCallback(() => {
    setRelationshipData((prev) => ({
      ...prev,
      weeklyRecap: { weekOf: getCurrentWeekString(), dismissed: true },
    }));
  }, []);

  const saveDailyAnswer = useCallback((dateString, answer) => {
    setRelationshipData((prev) => ({
      ...prev,
      dailyAnswers: { ...(prev.dailyAnswers || {}), [dateString]: answer },
    }));
  }, []);

  const addBucketItem = useCallback(({ title, category }) => {
    const newItem = {
      id: Date.now(),
      title,
      category,
      completed: false,
      completedAt: null,
      addedAt: new Date().toISOString(),
    };
    setRelationshipData((prev) => ({
      ...prev,
      bucketList: [newItem, ...(prev.bucketList || [])],
    }));
  }, []);

  const toggleBucketItem = useCallback((id) => {
    setRelationshipData((prev) => ({
      ...prev,
      bucketList: (prev.bucketList || []).map((item) =>
        item.id === id
          ? { ...item, completed: !item.completed, completedAt: !item.completed ? new Date().toISOString() : null }
          : item
      ),
    }));
  }, []);

  const deleteBucketItem = useCallback((id) => {
    setRelationshipData((prev) => ({
      ...prev,
      bucketList: (prev.bucketList || []).filter((item) => item.id !== id),
    }));
  }, []);

  const deleteMemory = useCallback((id) => {
    setRelationshipData((prev) => ({
      ...prev,
      memories: (prev.memories || []).filter((m) => m.id !== id),
    }));
  }, []);

  const addRepairCommitment = useCallback((commitment) => {
    setRelationshipData((prev) => ({
      ...prev,
      repairCommitments: [
        { text: commitment, date: new Date().toISOString(), done: false },
        ...(prev.repairCommitments || []),
      ].slice(0, 10),
    }));
  }, []);

  const dismissRepairCommitment = useCallback((date) => {
    setRelationshipData((prev) => ({
      ...prev,
      repairCommitments: (prev.repairCommitments || []).map((c) =>
        c.date === date ? { ...c, done: true } : c
      ),
    }));
  }, []);

  // Stores the "Understanding Me" result: attachment style, trauma responses,
  // neurodivergence context, and the AI-generated partner translation card.
  const saveSelfInsight = useCallback((insight) => {
    setRelationshipData((prev) => ({
      ...prev,
      selfInsight: { ...(prev.selfInsight || {}), ...insight, updatedAt: new Date().toISOString() },
    }));
  }, []);

  const value = {
    currentPage,
    goToPage,
    relationshipData,
    isLoaded,
    updateConnectionLevel,
    addMemory,
    deleteMemory,
    addWin,
    updateProfile,
    updateSignals,
    updateWeatherMood,
    recordCheckIn,
    dismissWeeklyRecap,
    saveDailyAnswer,
    addBucketItem,
    toggleBucketItem,
    deleteBucketItem,
    addRepairCommitment,
    dismissRepairCommitment,
    saveSelfInsight,
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
