import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
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
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

function AppContent() {
  const { currentUser } = useAuth();
  const { updateProfile, relationshipData, isLoaded } = useApp();
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

  const handleSplashComplete = () => {
    if (currentUser) {
      setCurrentPage(hasOnboarded ? 'home' : 'partner-invite');
    } else {
      setCurrentPage('auth');
    }
    setAppReady(true);
  };

  const handleOnboardingComplete = (data) => {
    updateProfile(data);
    setHasOnboarded(true);
    setCurrentPage('home');
  };

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  const switchAuthMode = (mode) => {
    setAuthMode(mode);
  };

  const handlePartnerInviteComplete = () => {
    setCurrentPage(hasOnboarded ? 'home' : 'onboarding');
  };

  if (!appReady || (currentUser && !isLoaded)) {
    return (
      <AnimatePresence mode="wait">
        <SplashScreen key="splash" onComplete={handleSplashComplete} />
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {currentPage === 'auth' ? (
        authMode === 'login' ? (
          <LoginPage key="login" onSwitchToSignup={() => switchAuthMode('signup')} />
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
      ) : null}
    </AnimatePresence>
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

