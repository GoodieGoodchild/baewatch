import React, { useState, useEffect, lazy, Suspense } from 'react';
// Eager: everything a logged-out visitor needs (splash + auth).
import SplashScreen from './pages/SplashScreen';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
// Lazy: authenticated pages load on demand, keeping first paint light.
const PartnerInvitePage = lazy(() => import('./pages/PartnerInvitePage'));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'));
const HomePage = lazy(() => import('./pages/HomePage'));
const CheckInPage = lazy(() => import('./pages/CheckInPage'));
const ConversationCoachPage = lazy(() => import('./pages/ConversationCoachPage'));
const MemoriesPage = lazy(() => import('./pages/MemoriesPage'));
const GamesPage = lazy(() => import('./pages/GamesPage'));
const WeatherDetailsPage = lazy(() => import('./pages/WeatherDetailsPage'));
const ProfileEditPage = lazy(() => import('./pages/ProfileEditPage'));
const DailyQuestionPage = lazy(() => import('./pages/DailyQuestionPage'));
const BucketListPage = lazy(() => import('./pages/BucketListPage'));
const RepairPage = lazy(() => import('./pages/RepairPage'));
const UnderstandingMePage = lazy(() => import('./pages/UnderstandingMePage'));
const LoveLanguagesPage = lazy(() => import('./pages/LoveLanguagesPage'));
const InsightsPage = lazy(() => import('./pages/InsightsPage'));
const TimelinePage = lazy(() => import('./pages/TimelinePage'));
const GrowthPage = lazy(() => import('./pages/GrowthPage'));
const DatePlannerPage = lazy(() => import('./pages/DatePlannerPage'));
const LoveLanguageQuizPage = lazy(() => import('./pages/LoveLanguageQuizPage'));
const ManualPage = lazy(() => import('./pages/ManualPage'));
const ChatPage = lazy(() => import('./pages/ChatPage'));
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

// Lightweight loader shown only on a page's first visit while its chunk loads.
const PageLoader = () => (
  <div className="min-h-screen bg-bae-cream flex items-center justify-center">
    <span className="text-4xl animate-pulse">💕</span>
  </div>
);

function AppContent() {
  const { currentUser } = useAuth();
  const { updateProfile, relationshipData, isLoaded, demoMode, loadDemoData, isPaired } = useApp();
  const [currentPage, setCurrentPage] = useState('splash');
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [appReady, setAppReady] = useState(false);
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [inviteCodeFromUrl, setInviteCodeFromUrl] = useState('');

  useEffect(() => {
    if (currentUser) {
      setHasOnboarded(isLoaded && Boolean(relationshipData.profile?.yourName));
    } else {
      setHasOnboarded(false);
    }
  }, [currentUser, isLoaded, relationshipData]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const invite = params.get('invite');
      if (invite) {
        setInviteCodeFromUrl(invite);
        // An invited partner is almost always a NEW user — open signup, not login.
        setAuthMode('signup');
      }
    }
  }, []);

  useEffect(() => {
    if (currentUser && inviteCodeFromUrl) {
      setCurrentPage('partner-invite');
    }
  }, [currentUser, inviteCodeFromUrl]);

  // Signing out from anywhere returns to the auth screen.
  useEffect(() => {
    if (!currentUser && appReady && currentPage !== 'auth') {
      setCurrentPage('auth');
    }
  }, [currentUser, appReady, currentPage]);

  // The gate: home is only reachable once you've told us who you are.
  // Order matters — it's the clinical intake: name/mood -> how you love ->
  // your attachment patterns -> connect your partner. Each step's data guides
  // the couple from day one, so nobody starts blind.
  // invitePending: you've generated a code and sent it — you may explore while
  // your partner signs up (the home connect card keeps pairing one tap away).
  const gatePage = () => {
    if (!relationshipData.profile?.yourName) return 'onboarding';
    if (!relationshipData.profile?.yourLoveLanguage) return 'love-quiz';
    if (!relationshipData.selfInsight?.dominant) return 'understanding-me';
    if (!isPaired && !demoMode && !relationshipData.profile?.invitePending) return 'partner-invite';
    return 'home';
  };

  const handleSplashComplete = () => {
    setCurrentPage(currentUser ? gatePage() : 'auth');
    setAppReady(true);
  };

  const handleOnboardingComplete = (data) => {
    updateProfile(data);
    setHasOnboarded(true);
    setCurrentPage('love-quiz');
  };

  // Any navigation to 'home' re-checks the gate, so required steps can't be
  // skipped by wandering, but deliberate page-to-page navigation stays free.
  const handleNavigate = (page) => {
    setCurrentPage(page === 'home' ? gatePage() : page);
  };

  const switchAuthMode = (mode) => {
    setAuthMode(mode);
  };

  const handlePartnerInviteComplete = () => {
    setCurrentPage(gatePage());
  };

  const handleExploreDemo = () => {
    loadDemoData();
    setCurrentPage('home');
  };

  // Splash renders OUTSIDE AnimatePresence: its continuous animations can stall
  // framer's mode="wait" exit tracking and strand the app on the splash screen.
  // A hard swap here is invisible anyway (both screens share the same palette).
  const showSplash = !appReady || (currentUser && !isLoaded);
  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <Suspense fallback={<PageLoader />}>
      {currentPage === 'auth' ? (
        authMode === 'login' ? (
          <LoginPage
            key="login"
            onSwitchToSignup={() => switchAuthMode('signup')}
            onExploreDemo={handleExploreDemo}
          />
        ) : (
          <SignupPage
            key="signup"
            initialInviteCode={inviteCodeFromUrl}
            onSwitchToLogin={() => switchAuthMode('login')}
            onSignupSuccess={() => setCurrentPage('partner-invite')}
          />
        )
      ) : currentPage === 'partner-invite' ? (
        <PartnerInvitePage
          key="partner-invite"
          initialInviteCode={inviteCodeFromUrl}
          onComplete={handlePartnerInviteComplete}
        />
      ) : currentPage === 'onboarding' ? (
        <OnboardingPage key="onboarding" onComplete={handleOnboardingComplete} />
      ) : currentPage === 'home' ? (
        <HomePage key="home" onNavigate={handleNavigate} />
      ) : currentPage === 'checkin' ? (
        <CheckInPage key="checkin" onNavigate={handleNavigate} />
      ) : currentPage === 'coach' ? (
        <ConversationCoachPage key="coach" onNavigate={handleNavigate} />
      ) : currentPage === 'memories' ? (
        <MemoriesPage key="memories" onNavigate={handleNavigate} />
      ) : currentPage === 'games' ? (
        <GamesPage key="games" onNavigate={handleNavigate} />
      ) : currentPage === 'weather' ? (
        <WeatherDetailsPage key="weather" onNavigate={handleNavigate} />
      ) : currentPage === 'profile-edit' ? (
        <ProfileEditPage key="profile-edit" onNavigate={handleNavigate} />
      ) : currentPage === 'daily-question' ? (
        <DailyQuestionPage key="daily-question" onNavigate={handleNavigate} />
      ) : currentPage === 'bucket-list' ? (
        <BucketListPage key="bucket-list" onNavigate={handleNavigate} />
      ) : currentPage === 'repair' ? (
        <RepairPage key="repair" onNavigate={handleNavigate} />
      ) : currentPage === 'understanding-me' ? (
        <UnderstandingMePage key="understanding-me" onNavigate={handleNavigate} />
      ) : currentPage === 'insights' ? (
        <InsightsPage key="insights" onNavigate={handleNavigate} />
      ) : currentPage === 'love-languages' ? (
        <LoveLanguagesPage key="love-languages" onNavigate={handleNavigate} />
      ) : currentPage === 'timeline' ? (
        <TimelinePage key="timeline" onNavigate={handleNavigate} />
      ) : currentPage === 'growth' ? (
        <GrowthPage key="growth" onNavigate={handleNavigate} />
      ) : currentPage === 'date-planner' ? (
        <DatePlannerPage key="date-planner" onNavigate={handleNavigate} />
      ) : currentPage === 'love-quiz' ? (
        <LoveLanguageQuizPage key="love-quiz" onNavigate={handleNavigate} />
      ) : currentPage === 'manual' ? (
        <ManualPage key="manual" onNavigate={handleNavigate} />
      ) : currentPage === 'chat' ? (
        <ChatPage key="chat" onNavigate={handleNavigate} />
      ) : null}
    </Suspense>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}

export default App;

