import React, { createContext, useState, useCallback, useEffect, useRef } from 'react';
import { doc, setDoc, onSnapshot, collection, query, where, getDocs } from 'firebase/firestore';
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

const defaultStreak = { current: 0, lastCheckInDate: '' };

function getTodayString() {
  return new Date().toISOString().slice(0, 10);
}

function getYesterdayString() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export const AppProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);
  const [relationshipData, setRelationshipData] = useState(defaultRelationshipData);
  const [streak, setStreak] = useState(defaultStreak);
  const [partnerData, setPartnerData] = useState(null);
  const [partnerId, setPartnerId] = useState(null);
  const [isPartnerConnected, setIsPartnerConnected] = useState(false);
  const [incomingSignal, setIncomingSignal] = useState(null);

  // Prevents the save effect from echoing back data that just arrived from Firestore
  const fromSnapshot = useRef(false);
  const isLoadedRef = useRef(false);
  const partnerUnsubRef = useRef(null);
  const streakRef = useRef(defaultStreak);

  // Listen to own user doc
  useEffect(() => {
    if (!currentUser) {
      setIsLoaded(false);
      isLoadedRef.current = false;
      setPartnerId(null);
      setIsPartnerConnected(false);
      setPartnerData(null);
      setIncomingSignal(null);
      return;
    }

    const unsubscribe = onSnapshot(doc(db, 'users', currentUser.uid), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        fromSnapshot.current = true;
        setRelationshipData(data.relationshipData || defaultRelationshipData);

        const loadedStreak = data.streak || defaultStreak;
        setStreak(loadedStreak);
        streakRef.current = loadedStreak;

        // Check for incoming bae signal
        const pending = data.pendingSignal;
        if (pending && pending.seen === false) {
          setIncomingSignal(pending);
        }
      }
      isLoadedRef.current = true;
      setIsLoaded(true);
    });

    return unsubscribe;
  }, [currentUser]);

  // Find relationship and subscribe to partner doc
  useEffect(() => {
    if (!currentUser) return;

    let cancelled = false;

    async function findRelationship() {
      const uid = currentUser.uid;
      const relCol = collection(db, 'relationships');

      const [q1snap, q2snap] = await Promise.all([
        getDocs(query(relCol, where('partner1Id', '==', uid))),
        getDocs(query(relCol, where('partner2Id', '==', uid))),
      ]);

      if (cancelled) return;

      const docs = [...q1snap.docs, ...q2snap.docs];
      if (docs.length === 0) {
        setIsPartnerConnected(false);
        setPartnerId(null);
        setPartnerData(null);
        return;
      }

      const rel = docs[0].data();
      const pid = rel.partner1Id === uid ? rel.partner2Id : rel.partner1Id;
      setPartnerId(pid);
      setIsPartnerConnected(true);

      // Subscribe to partner's doc
      if (partnerUnsubRef.current) partnerUnsubRef.current();
      partnerUnsubRef.current = onSnapshot(doc(db, 'users', pid), (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setPartnerData(data.relationshipData || null);
        } else {
          setPartnerData(null);
        }
      });
    }

    findRelationship().catch(console.error);

    return () => {
      cancelled = true;
      if (partnerUnsubRef.current) {
        partnerUnsubRef.current();
        partnerUnsubRef.current = null;
      }
    };
  }, [currentUser]);

  // Save own data back to Firestore (only on local changes)
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

  const incrementStreak = useCallback(async () => {
    if (!currentUser) return;
    const today = getTodayString();
    const yesterday = getYesterdayString();
    const current = streakRef.current;

    let newStreak;
    if (current.lastCheckInDate === today) {
      return;
    } else if (current.lastCheckInDate === yesterday) {
      newStreak = { current: current.current + 1, lastCheckInDate: today };
    } else {
      newStreak = { current: 1, lastCheckInDate: today };
    }

    setStreak(newStreak);
    streakRef.current = newStreak;

    await setDoc(
      doc(db, 'users', currentUser.uid),
      { streak: newStreak },
      { merge: true }
    ).catch(console.error);
  }, [currentUser]);

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
    incrementStreak();
  }, [incrementStreak]);

  const updateSignals = useCallback((signals) => {
    setRelationshipData((prev) => ({
      ...prev,
      adaptiveSignals: { ...prev.adaptiveSignals, ...signals },
    }));
  }, []);

  const sendBaeSignal = useCallback(async () => {
    if (!currentUser || !partnerId) return;
    const senderName = relationshipData.profile?.yourName || 'Your partner';
    await setDoc(
      doc(db, 'users', partnerId),
      {
        pendingSignal: {
          from: senderName,
          sentAt: new Date().toISOString(),
          seen: false,
        },
      },
      { merge: true }
    ).catch(console.error);
  }, [currentUser, partnerId, relationshipData.profile?.yourName]);

  const dismissSignal = useCallback(async () => {
    if (!currentUser) return;
    setIncomingSignal(null);
    await setDoc(
      doc(db, 'users', currentUser.uid),
      { pendingSignal: { seen: true } },
      { merge: true }
    ).catch(console.error);
  }, [currentUser]);

  const value = {
    isLoaded,
    relationshipData,
    streak,
    partnerData,
    partnerId,
    isPartnerConnected,
    incomingSignal,
    updateConnectionLevel,
    updateWeatherMood,
    addMemory,
    deleteMemory,
    addWin,
    updateProfile,
    recordCheckIn,
    updateSignals,
    sendBaeSignal,
    dismissSignal,
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
