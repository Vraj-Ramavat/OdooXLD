import React, { useEffect, useState } from 'react';
import { db } from './db/supabaseClient';

// Import Screens
import MotionIntro from './components/MotionIntro';
import Sidebar from './components/Sidebar';
import LoginSignup from './components/LoginSignup';
import Dashboard from './components/Dashboard';
import CreateTrip from './components/CreateTrip';
import MyTrips from './components/MyTrips';
import ItineraryBuilder from './components/ItineraryBuilder';
import ItineraryView from './components/ItineraryView';
import CitySearch from './components/CitySearch';
import ActivitySearch from './components/ActivitySearch';
import BudgetPage from './components/BudgetPage';
import CalendarPage from './components/CalendarPage';
import CommunityPage from './components/CommunityPage';
import PublicTripPage from './components/PublicTripPage';
import ProfilePage from './components/ProfilePage';
import SettingsPage from './components/SettingsPage';
import TravelAssistant from './components/TravelAssistant';

export default function App() {
  const [user, setUser] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('intro'); // intro, dashboard, etc.
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [sharedToken, setSharedToken] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [authChecking, setAuthChecking] = useState(true);

  // Check login session & route hashes on mount
  useEffect(() => {
    checkSession();
    parseHashRoute();

    window.addEventListener('hashchange', parseHashRoute);
    return () => window.removeEventListener('hashchange', parseHashRoute);
  }, []);

  const checkSession = async () => {
    const { data } = await db.auth.getUser();
    if (data && data.user) {
      setUser(data.user);
      
      // Auto pre-select their first trip if available
      const { data: userTrips } = await db.trips.list(data.user.id);
      if (userTrips && userTrips.length > 0) {
        setSelectedTripId(userTrips[0].id);
      }
    }
    
    // Check if intro has already been played
    const introPlayed = localStorage.getItem('gt_intro_played');
    
    // Route logic
    const hash = window.location.hash;
    if (hash.startsWith('#shared/')) {
      // Shared links can be viewed anonymously, skip intro & skip login redirect
      setCurrentScreen('shared-trip');
    } else if (introPlayed === 'true') {
      setCurrentScreen(data && data.user ? 'dashboard' : 'login');
    } else {
      setCurrentScreen('intro');
    }
    
    setAuthChecking(false);
  };

  const parseHashRoute = () => {
    const hash = window.location.hash;
    if (hash.startsWith('#shared/')) {
      const token = hash.split('/')[1];
      setSharedToken(token);
      setCurrentScreen('shared-trip');
    } else if (hash === '#dashboard' && user) {
      setCurrentScreen('dashboard');
    } else if (hash === '#my-trips' && user) {
      setCurrentScreen('my-trips');
    }
  };

  const handleNavigate = (screen) => {
    setCurrentScreen(screen);
    // Sync hash to URL
    if (screen === 'shared-trip' && sharedToken) {
      window.location.hash = `shared/${sharedToken}`;
    } else {
      window.location.hash = screen;
    }
  };

  const handleAuthSuccess = (authUser) => {
    setUser(authUser);
    handleNavigate('dashboard');
  };

  const handleSignOut = async () => {
    await db.auth.signOut();
    setUser(null);
    handleNavigate('login');
  };

  const handleToggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    // Flipped custom css class on root container
    if (isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  };

  const handleSelectTrip = (id) => {
    setSelectedTripId(id);
  };

  // Render routing switcher
  const renderScreen = () => {
    if (currentScreen === 'shared-trip') {
      return (
        <PublicTripPage 
          activeUser={user} 
          shareToken={sharedToken} 
          onNavigate={handleNavigate} 
        />
      );
    }

    if (!user) {
      return <LoginSignup onAuthSuccess={handleAuthSuccess} />;
    }

    switch (currentScreen) {
      case 'dashboard':
        return (
          <Dashboard 
            activeUser={user} 
            onNavigate={handleNavigate} 
            onSelectTrip={handleSelectTrip} 
          />
        );
      case 'create-trip':
        return (
          <CreateTrip 
            activeUser={user} 
            onNavigate={handleNavigate} 
            onSelectTrip={handleSelectTrip} 
          />
        );
      case 'my-trips':
        return (
          <MyTrips 
            activeUser={user} 
            onNavigate={handleNavigate} 
            onSelectTrip={handleSelectTrip} 
          />
        );
      case 'itinerary-builder':
        return (
          <ItineraryBuilder 
            activeUser={user} 
            selectedTripId={selectedTripId} 
            onSelectTrip={handleSelectTrip} 
            onNavigate={handleNavigate}
          />
        );
      case 'itinerary-view':
        return (
          <ItineraryView 
            activeUser={user} 
            selectedTripId={selectedTripId} 
            onSelectTrip={handleSelectTrip} 
            onNavigate={handleNavigate}
          />
        );
      case 'explore-cities':
        return (
          <CitySearch 
            activeUser={user} 
            onNavigate={handleNavigate} 
          />
        );
      case 'explore-activities':
        return (
          <ActivitySearch 
            activeUser={user} 
            selectedTripId={selectedTripId} 
            onNavigate={handleNavigate} 
          />
        );
      case 'budget':
        return (
          <BudgetPage 
            activeUser={user} 
            selectedTripId={selectedTripId} 
            onSelectTrip={handleSelectTrip} 
          />
        );
      case 'calendar':
        return (
          <CalendarPage 
            activeUser={user} 
            selectedTripId={selectedTripId} 
            onSelectTrip={handleSelectTrip} 
          />
        );
      case 'community':
        return (
          <CommunityPage 
            activeUser={user} 
            onNavigate={handleNavigate} 
            onSelectTrip={handleSelectTrip} 
            onSetSharedToken={(tok) => setSharedToken(tok)} 
          />
        );
      case 'profile':
        return (
          <ProfilePage 
            activeUser={user} 
            onNavigate={handleNavigate} 
          />
        );
      case 'settings':
        return (
          <SettingsPage 
            activeUser={user} 
            onProfileUpdate={(updated) => setUser(updated)} 
            onSignOut={handleSignOut} 
            isDarkMode={isDarkMode}
            onToggleTheme={handleToggleTheme}
          />
        );
      case 'travel-assistant':
        return (
          <TravelAssistant 
            activeUser={user} 
            onNavigate={handleNavigate}
          />
        );
      default:
        return (
          <Dashboard 
            activeUser={user} 
            onNavigate={handleNavigate} 
            onSelectTrip={handleSelectTrip} 
          />
        );
    }
  };

  if (currentScreen === 'intro') {
    return <MotionIntro onComplete={() => handleNavigate(user ? 'dashboard' : 'login')} />;
  }

  if (authChecking) {
    return (
      <div style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#18191D',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#F3EEF1',
        fontFamily: "'Space Mono', monospace",
        fontSize: '0.85rem'
      }}>
        AUTHORIZING_PASSPORT // STANDBY...
      </div>
    );
  }

  // If viewing a shared trip anonymously, render without sidebar shell
  const isAnonymousShared = currentScreen === 'shared-trip' && !user;

  return (
    <div className="app-container">
      {!isAnonymousShared && currentScreen !== 'login' && currentScreen !== 'signup' && (
        <Sidebar 
          currentScreen={currentScreen} 
          onNavigate={handleNavigate} 
          activeUser={user} 
          onSignOut={handleSignOut}
          isDarkMode={isDarkMode}
          onToggleTheme={handleToggleTheme}
        />
      )}
      
      <main className="main-content" style={{ 
        marginLeft: (isAnonymousShared || currentScreen === 'login' || currentScreen === 'signup') ? 0 : 'var(--sidebar-width)',
        padding: (currentScreen === 'login' || currentScreen === 'signup') ? 0 : '40px'
      }}>
        {renderScreen()}
      </main>
    </div>
  );
}
