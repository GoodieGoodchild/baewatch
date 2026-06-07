import React, { createContext, useState, useCallback, useEffect } from 'react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const { currentUser: user } = useAuth();
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
    timeline: [],
    growthGoals: [],
    plannedDates: [],
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
          setRelationshipData(prev => ({
            ...prev,
            ...(data.relationshipData || {}),
            timeline: data.relationshipData?.timeline || [],
            growthGoals: data.relationshipData?.growthGoals || [],
            plannedDates: data.relationshipData?.plannedDates || [],
          }));
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();

    // Set up real-time listener
    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setRelationshipData(prev => ({
          ...prev,
          ...(data.relationshipData || {}),
          timeline: data.relationshipData?.timeline || [],
          growthGoals: data.relationshipData?.growthGoals || [],
          plannedDates: data.relationshipData?.plannedDates || [],
        }));
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

  const updateMemory = useCallback((id, updates) => {
    setRelationshipData((prev) => ({
      ...prev,
      memories: prev.memories.map((m) => m.id === id ? { ...m, ...updates } : m),
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

  const recordCheckIn = useCallback((data) => {
    setRelationshipData((prev) => ({ ...prev, lastCheckIn: data }));
  }, []);

  // Timeline
  const addTimelineEvent = useCallback((event) => {
    setRelationshipData((prev) => ({
      ...prev,
      timeline: [{ ...event, id: Date.now().toString() }, ...prev.timeline],
    }));
  }, []);

  const deleteTimelineEvent = useCallback((id) => {
    setRelationshipData((prev) => ({
      ...prev,
      timeline: prev.timeline.filter((e) => e.id !== id),
    }));
  }, []);

  // Growth Goals
  const addGrowthGoal = useCallback((goal) => {
    setRelationshipData((prev) => ({
      ...prev,
      growthGoals: [{ ...goal, id: Date.now().toString(), progress: 0, completed: false, addedAt: new Date().toISOString() }, ...prev.growthGoals],
    }));
  }, []);

  const updateGoalProgress = useCallback((id, progress) => {
    setRelationshipData((prev) => ({
      ...prev,
      growthGoals: prev.growthGoals.map((g) => g.id === id ? { ...g, progress } : g),
    }));
  }, []);

  const toggleGoalComplete = useCallback((id) => {
    setRelationshipData((prev) => ({
      ...prev,
      growthGoals: prev.growthGoals.map((g) => g.id === id ? { ...g, completed: !g.completed, progress: !g.completed ? 100 : g.progress } : g),
    }));
  }, []);

  const deleteGrowthGoal = useCallback((id) => {
    setRelationshipData((prev) => ({
      ...prev,
      growthGoals: prev.growthGoals.filter((g) => g.id !== id),
    }));
  }, []);

  // Date Planner
  const planDate = useCallback((idea) => {
    setRelationshipData((prev) => {
      const alreadyPlanned = prev.plannedDates.some((d) => d.ideaId === idea.id);
      if (alreadyPlanned) return prev;
      return {
        ...prev,
        plannedDates: [...prev.plannedDates, { ideaId: idea.id, title: idea.title, emoji: idea.emoji, plannedFor: null, done: false }],
      };
    });
  }, []);

  const markDateDone = useCallback((ideaId) => {
    setRelationshipData((prev) => ({
      ...prev,
      plannedDates: prev.plannedDates.map((d) => d.ideaId === ideaId ? { ...d, done: true } : d),
    }));
  }, []);

  const value = {
    currentPage,
    goToPage,
    relationshipData,
    updateConnectionLevel,
    addMemory,
    updateMemory,
    deleteMemory,
    addWin,
    updateProfile,
    updateSignals,
    updateWeatherMood,
    recordCheckIn,
    addTimelineEvent,
    deleteTimelineEvent,
    addGrowthGoal,
    updateGoalProgress,
    toggleGoalComplete,
    deleteGrowthGoal,
    planDate,
    markDateDone,
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
