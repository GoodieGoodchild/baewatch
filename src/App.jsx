import React, { useState, useEffect } from 'react';
import SplashScreen from './pages/SplashScreen';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import PartnerInvitePage from './pages/PartnerInvitePage';
import OnboardingPage from './pages/OnboardingPage';
import HomePage from './pages/HomePage';
import CheckInPage from './pages/CheckInPage';
import ConversationCoachPage from './pages/ConversationCoachPage';
import MemoriesPage from './pages/MemoriesPage';
import GamesPage from './pages/GamesPage';
import WeatherDetailsPage from './pages/WeatherDetailsPage';
import ProfileEditPage from './pages/ProfileEditPage';
import DailyQuestionPage from './pages/DailyQuestionPage';
import BucketListPage from './pages/BucketListPage';
import RepairPage from './pages/RepairPage';
import UnderstandingMePage from './pages/UnderstandingMePage';
import LoveLanguagesPage from './pages/LoveLanguagesPage';
import InsightsPage from './pages/InsightsPage';
import TimelinePage from './pages/TimelinePage';
import GrowthPage from './pages/GrowthPage';
import DatePlannerPage from './pages/DatePlannerPage';
import LoveLanguageQuizPage from './pages/LoveLanguageQuizPage';
import ManualPage from './pages/ManualPage';
import ChatPage from './pages/ChatPage';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

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
      }
    }
  }, []);

  useEffect(() => {
    if (currentUser && inviteCodeFromUrl) {
      setCurrentPage('partner-invite');
    }
  }, [currentUser, inviteCodeFromUrl]);

  // The gate: home is only reachable once you've told us who you are.
  // Order matters — it's the clinical intake: name/mood -> how you love ->
  // your attachment patterns -> connect your partner. Each step's data guides
  // the couple from day one, so nobody starts blind.
  const gatePage = () => {
    if (!relationshipData.profile?.yourName) return 'onboarding';
    if (!relationshipData.profile?.yourLoveLanguage) return 'love-quiz';
    if (!relationshipData.selfInsight?.dominant) return 'understanding-me';
    if (!isPaired && !demoMode) return 'partner-invite';
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
    <React.Fragment>
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
    </React.Fragment>
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

