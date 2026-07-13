import React, { createContext, useState, useCallback, useEffect, useRef } from 'react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';
import { buildDemoData } from '../services/demoData';
import { isAIConfigured } from '../services/aiService';
import { generateConnectionBridge } from '../services/insightService';

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
  // Demo mode: explore a fully-populated sample couple without signing in.
  // While active, Firestore sync is bypassed so nothing is written to a real account.
  const [demoMode, setDemoMode] = useState(false);
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
    partnerInsight: null,
    connectionBridge: null,
    timeline: [],
    growthGoals: [],
    plannedDates: [],
    // Live slice of your partner's world, synced from the shared relationship doc
    // when you're paired: their name, love language, mood, latest check-in, insight card.
    partnerSync: null,
    // Manual of Me: what my hard moments mean + what helps, written once.
    manual: null,
    // Live repair request on the shared doc: { from, fromName, status, choice }.
    repairRequest: null,
    // Live "Simultaneous Reveal" game on the shared doc (both answer blind).
    gameSession: null,
    // Async surprise drops: [{ id, from, fromName, text, opened, landed }].
    surpriseDrops: [],
    // Per-user AI usage budget. Each AI generation costs tokens (and money),
    // so users get a small, fixed number of attempts per feature.
    aiUsage: {},
  });

  // How many times a user may invoke each AI feature. "Get it right in 2."
  const AI_LIMITS = { card: 2, bridge: 1, forecast: 3, reframe: 3, gameQuestion: 5, gratitude: 5 };
  // The shared relationships/{id} doc both partners read/write once paired.
  const [relationshipId, setRelationshipId] = useState(null);

  // Guards against the save-on-load echo: skip the save that a snapshot triggers.
  const fromSnapshot = useRef(false);

  // Real-time sync with Firestore for the logged-in user.
  useEffect(() => {
    if (demoMode) return; // demo data lives only in memory
    if (!currentUser) {
      setIsLoaded(false);
      return;
    }

    // Safety valve: if Firestore is unreachable (offline, API disabled, rules
    // hiccup) the snapshot never arrives and the app would sit on the splash
    // forever. After 6s, proceed with defaults — the listener keeps trying and
    // syncs the moment the backend responds.
    const fallback = setTimeout(() => {
      console.warn('Firestore slow/unreachable — continuing with local defaults.');
      setIsLoaded(true);
    }, 6000);

    const unsubscribe = onSnapshot(doc(db, 'users', currentUser.uid), (snap) => {
      clearTimeout(fallback);
      if (snap.exists()) {
        const data = snap.data();
        if (data.relationshipData) {
          fromSnapshot.current = true;
          setRelationshipData((prev) => ({ ...prev, ...data.relationshipData }));
        }
        setRelationshipId(data.relationshipId || null);
      }
      setIsLoaded(true);
    }, (error) => {
      clearTimeout(fallback);
      console.error('Error loading data:', error);
      setIsLoaded(true);
    });

    return () => {
      clearTimeout(fallback);
      unsubscribe();
    };
  }, [currentUser, demoMode]);

  // Persist changes — but not the change that came from a snapshot.
  useEffect(() => {
    if (demoMode || !currentUser || !isLoaded) return;
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

  // --- Partner sync (paired couples) -------------------------------------
  // Subscribe to the shared relationship doc: pull in the OTHER partner's
  // published slice and the shared connection bridge. Only updates state when
  // something actually changed, so it can't ping-pong with the publish effect.
  useEffect(() => {
    if (demoMode || !currentUser || !relationshipId) return;

    const unsubscribe = onSnapshot(doc(db, 'relationships', relationshipId), (snap) => {
      if (!snap.exists()) return;
      const data = snap.data();
      const partners = data.partners || {};
      const other = Object.entries(partners).find(([uid]) => uid !== currentUser.uid)?.[1] || null;

      setRelationshipData((prev) => {
        let changed = false;
        const next = { ...prev };

        if (other && JSON.stringify(prev.partnerSync) !== JSON.stringify(other)) {
          next.partnerSync = other;
          next.profile = {
            ...prev.profile,
            partnerName: other.name || prev.profile?.partnerName,
            partnerLoveLanguage: other.loveLanguage || prev.profile?.partnerLoveLanguage,
          };
          if (other.insightCard) {
            next.partnerInsight = { dominant: other.attachmentStyle, card: other.insightCard };
          }
          changed = true;
        }

        if (
          data.connectionBridge &&
          JSON.stringify(data.connectionBridge) !== JSON.stringify(prev.connectionBridge)
        ) {
          next.connectionBridge = data.connectionBridge;
          changed = true;
        }

        const sharedRepair = data.repairRequest || null;
        if (JSON.stringify(sharedRepair) !== JSON.stringify(prev.repairRequest)) {
          next.repairRequest = sharedRepair;
          changed = true;
        }

        const sharedGame = data.gameSession || null;
        if (JSON.stringify(sharedGame) !== JSON.stringify(prev.gameSession)) {
          next.gameSession = sharedGame;
          changed = true;
        }

        const sharedDrops = data.surpriseDrops || [];
        if (JSON.stringify(sharedDrops) !== JSON.stringify(prev.surpriseDrops)) {
          next.surpriseDrops = sharedDrops;
          changed = true;
        }

        return changed ? next : prev;
      });
    }, (error) => {
      console.error('Error syncing relationship:', error);
    });

    return unsubscribe;
  }, [currentUser, relationshipId, demoMode]);

  // Publish YOUR partner-facing slice to the shared doc whenever it changes.
  // lastPublished guards against redundant writes (and write loops).
  const lastPublished = useRef('');
  useEffect(() => {
    if (demoMode || !currentUser || !relationshipId || !isLoaded) return;

    const p = relationshipData.profile || {};
    const history = relationshipData.checkInHistory || [];
    const openCommitment = (relationshipData.repairCommitments || []).find((c) => !c.done);
    const slice = {
      name: p.yourName || '',
      loveLanguage: p.yourLoveLanguage || '',
      mood: p.yourMood || '',
      cupFullness: p.cupFullness ?? null,
      lastCheckIn: relationshipData.lastCheckIn || null,
      latestCheckIn: history.length ? history[history.length - 1] : null,
      attachmentStyle: relationshipData.selfInsight?.dominant || null,
      insightCard: relationshipData.selfInsight?.card || null,
      commitment: openCommitment?.text || null,
      givingLanguage: p.yourGivingLanguage || '',
      manual: relationshipData.manual || null,
      lastLanguageWin: (relationshipData.languageWins || []).slice(-1)[0] || null,
    };

    const json = JSON.stringify(slice);
    if (json === lastPublished.current) return;
    lastPublished.current = json;

    setDoc(
      doc(db, 'relationships', relationshipId),
      { partners: { [currentUser.uid]: slice }, updatedAt: new Date() },
      { merge: true }
    ).catch((error) => console.error('Error publishing to relationship:', error));
  }, [relationshipData, currentUser, relationshipId, demoMode, isLoaded]);

  // When BOTH partners have completed Understanding Me and there's no bridge
  // yet, one device generates the AI Connection Bridge and shares it.
  const bridgeBusy = useRef(false);
  useEffect(() => {
    if (demoMode || !currentUser || !relationshipId) return;
    if (relationshipData.connectionBridge || bridgeBusy.current || !isAIConfigured()) return;

    const mine = relationshipData.selfInsight;
    const theirs = relationshipData.partnerSync;
    if (!mine?.card || !theirs?.insightCard) return;

    bridgeBusy.current = true;
    (async () => {
      try {
        const bridge = await generateConnectionBridge(
          { dominant: mine.dominant, yourName: relationshipData.profile?.yourName, freeText: mine.freeText },
          { dominant: theirs.attachmentStyle, yourName: theirs.name }
        );
        await setDoc(doc(db, 'relationships', relationshipId), { connectionBridge: bridge }, { merge: true });
      } catch (error) {
        console.error('Bridge generation failed:', error);
        bridgeBusy.current = false; // allow retry on next change
      }
    })();
  }, [relationshipData, currentUser, relationshipId, demoMode]);
  // ------------------------------------------------------------------------

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
  // Loads the sample couple into memory and flips on demo mode so the whole app
  // is explorable without an account.
  const loadDemoData = useCallback(() => {
    setDemoMode(true);
    setIsLoaded(true);
    setRelationshipData((prev) => ({ ...prev, ...buildDemoData() }));
  }, []);

  const exitDemo = useCallback(() => {
    // Cleanest way back to a real, empty session is a fresh reload.
    if (typeof window !== 'undefined') window.location.reload();
    setDemoMode(false);
  }, []);

  // --- Games on the shared relationship doc --------------------------------
  // Writes go to relationships/{id}; both devices see them live via onSnapshot.
  // In demo mode there's no shared doc, so everything stays in local state.
  const myUid = () => (demoMode ? 'me' : currentUser?.uid);

  const writeShared = useCallback((patch, localUpdater) => {
    setRelationshipData((prev) => localUpdater(prev));
    if (!demoMode && relationshipId) {
      setDoc(doc(db, 'relationships', relationshipId), patch, { merge: true })
        .catch((e) => console.error('Shared game write failed:', e));
    }
  }, [demoMode, relationshipId]);

  // Simultaneous Reveal: start a round with a prompt both partners answer blind.
  const startRevealGame = useCallback((prompt, spark) => {
    const session = {
      type: 'reveal', prompt, spark: spark || '',
      answers: {}, status: 'answering', reflection: '',
      startedBy: myUid(), createdAt: new Date().toISOString(),
    };
    writeShared({ gameSession: session }, (prev) => ({ ...prev, gameSession: session }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [writeShared, demoMode, currentUser]);

  // Submit YOUR answer. If the partner already answered, flip to 'revealed'.
  // In demo mode there's no partner device, so we simulate one for playability.
  const submitRevealAnswer = useCallback((answer, reflection) => {
    setRelationshipData((prev) => {
      const s = prev.gameSession;
      if (!s) return prev;
      let answers = { ...(s.answers || {}), [myUid()]: answer };
      let refl = s.reflection;
      if (demoMode) {
        answers = { ...answers, maya: "Somewhere quiet by the sea, with you and nothing on the calendar." };
        refl = "You both drifted somewhere quiet and unhurried — that's a shared compass. 🧭";
      }
      const bothIn = Object.keys(answers).length >= 2;
      const session = { ...s, answers, status: bothIn ? 'revealed' : 'answering', reflection: bothIn ? (reflection || refl || '') : refl };
      if (!demoMode && relationshipId) {
        setDoc(doc(db, 'relationships', relationshipId), { gameSession: session }, { merge: true }).catch((e) => console.error(e));
      }
      return { ...prev, gameSession: session };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demoMode, relationshipId, currentUser]);

  const endRevealGame = useCallback(() => {
    writeShared({ gameSession: null }, (prev) => ({ ...prev, gameSession: null }));
  }, [writeShared]);

  // Async Surprise Drops.
  const plantSurprise = useCallback((text, fromName) => {
    setRelationshipData((prev) => {
      const drop = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, from: myUid(), fromName: fromName || '', text, opened: false, landed: false, createdAt: new Date().toISOString() };
      const surpriseDrops = [...(prev.surpriseDrops || []), drop].slice(-30);
      if (!demoMode && relationshipId) {
        setDoc(doc(db, 'relationships', relationshipId), { surpriseDrops }, { merge: true }).catch((e) => console.error(e));
      }
      return { ...prev, surpriseDrops };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demoMode, relationshipId, currentUser]);

  const updateSurprise = useCallback((id, patch) => {
    setRelationshipData((prev) => {
      const surpriseDrops = (prev.surpriseDrops || []).map((d) => (d.id === id ? { ...d, ...patch } : d));
      if (!demoMode && relationshipId) {
        setDoc(doc(db, 'relationships', relationshipId), { surpriseDrops }, { merge: true }).catch((e) => console.error(e));
      }
      return { ...prev, surpriseDrops };
    });
  }, [demoMode, relationshipId]);
  // -------------------------------------------------------------------------

  // AI usage budget helpers. aiRemaining(kind) tells the UI how many attempts
  // are left; spendAiUse(kind) records one (call right before an AI request).
  const aiRemaining = useCallback(
    (kind) => Math.max(0, (AI_LIMITS[kind] ?? 0) - ((relationshipData.aiUsage || {})[kind] || 0)),
    [relationshipData.aiUsage]
  );

  const spendAiUse = useCallback((kind) => {
    setRelationshipData((prev) => ({
      ...prev,
      aiUsage: { ...(prev.aiUsage || {}), [kind]: ((prev.aiUsage || {})[kind] || 0) + 1 },
    }));
  }, []);

  // "It landed 💛" — the receiving partner confirms a love-language moment
  // actually landed. This is what turns generic advice into calibration:
  // the giver learns what works for THIS person, and gets the dopamine of
  // knowing it worked.
  const recordLanguageWin = useCallback(() => {
    const today = new Date().toISOString().slice(0, 10);
    setRelationshipData((prev) => ({
      ...prev,
      languageWins: [...(prev.languageWins || []).filter((d) => d !== today), today].slice(-30),
    }));
  }, []);

  const saveManual = useCallback((manual) => {
    setRelationshipData((prev) => ({ ...prev, manual: { ...manual, updatedAt: new Date().toISOString() } }));
  }, []);

  // --- Repair request lifecycle (hurt partner decides what repair looks like)
  // Writes go straight to the shared doc so the other device sees them live.
  const writeRepairRequest = useCallback((repairRequest) => {
    setRelationshipData((prev) => ({ ...prev, repairRequest }));
    if (!demoMode && relationshipId) {
      setDoc(doc(db, 'relationships', relationshipId), { repairRequest }, { merge: true })
        .catch((e) => console.error('Repair request write failed:', e));
    }
  }, [demoMode, relationshipId]);

  // Called by the APOLOGIZER when they finish the repair flow.
  const requestRepair = useCallback((fromName) => {
    writeRepairRequest({
      from: currentUser?.uid || 'me',
      fromName: fromName || '',
      createdAt: new Date().toISOString(),
      status: 'choosing',
      choice: null,
    });
  }, [currentUser, writeRepairRequest]);

  // Called by the HURT partner: what would actually help.
  const chooseRepairOption = useCallback((choice) => {
    setRelationshipData((prev) => {
      const rr = prev.repairRequest;
      if (!rr) return prev;
      const updated = { ...rr, status: 'chosen', choice, chosenAt: new Date().toISOString() };
      if (!demoMode && relationshipId) {
        setDoc(doc(db, 'relationships', relationshipId), { repairRequest: updated }, { merge: true })
          .catch((e) => console.error('Repair choice write failed:', e));
      }
      return { ...prev, repairRequest: updated };
    });
  }, [demoMode, relationshipId]);

  // Called by the HURT partner when it genuinely feels repaired — THIS is what
  // moves the connection needle, not the apology being sent.
  const closeRepair = useCallback(() => {
    setRelationshipData((prev) => {
      const conn = Math.min(100, (prev.connectionLevel ?? 72) + 10);
      if (!demoMode && relationshipId) {
        setDoc(doc(db, 'relationships', relationshipId), { repairRequest: null }, { merge: true })
          .catch((e) => console.error('Repair close write failed:', e));
      }
      return { ...prev, repairRequest: null, connectionLevel: conn, weatherMood: 'sunny' };
    });
  }, [demoMode, relationshipId]);

  const saveSelfInsight = useCallback((insight) => {
    setRelationshipData((prev) => ({
      ...prev,
      selfInsight: { ...(prev.selfInsight || {}), ...insight, updatedAt: new Date().toISOString() },
    }));
  }, []);

  // --- Phase 4: timeline, growth goals & date planner ----------------------
  const addTimelineEvent = useCallback((event) => {
    setRelationshipData((prev) => ({
      ...prev,
      timeline: [{ ...event, id: Date.now().toString() }, ...(prev.timeline || [])],
    }));
  }, []);

  const deleteTimelineEvent = useCallback((id) => {
    setRelationshipData((prev) => ({
      ...prev,
      timeline: (prev.timeline || []).filter((e) => e.id !== id),
    }));
  }, []);

  const addGrowthGoal = useCallback((goal) => {
    setRelationshipData((prev) => ({
      ...prev,
      growthGoals: [
        { ...goal, id: Date.now().toString(), progress: 0, completed: false, addedAt: new Date().toISOString() },
        ...(prev.growthGoals || []),
      ],
    }));
  }, []);

  const updateGoalProgress = useCallback((id, progress) => {
    setRelationshipData((prev) => ({
      ...prev,
      growthGoals: (prev.growthGoals || []).map((g) => (g.id === id ? { ...g, progress } : g)),
    }));
  }, []);

  const toggleGoalComplete = useCallback((id) => {
    setRelationshipData((prev) => ({
      ...prev,
      growthGoals: (prev.growthGoals || []).map((g) =>
        g.id === id ? { ...g, completed: !g.completed, progress: !g.completed ? 100 : g.progress } : g
      ),
    }));
  }, []);

  const deleteGrowthGoal = useCallback((id) => {
    setRelationshipData((prev) => ({
      ...prev,
      growthGoals: (prev.growthGoals || []).filter((g) => g.id !== id),
    }));
  }, []);

  const planDate = useCallback((idea) => {
    setRelationshipData((prev) => {
      if ((prev.plannedDates || []).some((d) => d.ideaId === idea.id && !d.done)) return prev;
      return {
        ...prev,
        plannedDates: [
          ...(prev.plannedDates || []),
          { ideaId: idea.id, title: idea.title, emoji: idea.emoji, plannedFor: null, done: false },
        ],
      };
    });
  }, []);

  const markDateDone = useCallback((ideaId) => {
    setRelationshipData((prev) => ({
      ...prev,
      plannedDates: (prev.plannedDates || []).map((d) => (d.ideaId === ideaId ? { ...d, done: true } : d)),
    }));
  }, []);
  // --------------------------------------------------------------------------

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
    saveManual,
    recordLanguageWin,
    aiRemaining,
    spendAiUse,
    startRevealGame,
    submitRevealAnswer,
    endRevealGame,
    plantSurprise,
    updateSurprise,
    myUid: myUid(),
    requestRepair,
    chooseRepairOption,
    closeRepair,
    demoMode,
    loadDemoData,
    exitDemo,
    relationshipId,
    isPaired: Boolean(relationshipId),
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
