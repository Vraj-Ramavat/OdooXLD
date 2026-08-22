import React from 'react';
import { 
  LayoutDashboard, 
  Map, 
  Compass, 
  Calendar, 
  DollarSign, 
  Users, 
  Sparkles, 
  User, 
  Settings, 
  BookOpen,
  LogOut,
  Globe
} from 'lucide-react';

export default function Sidebar({ 
  currentScreen, 
  onNavigate, 
  activeUser, 
  onSignOut,
  isDarkMode,
  onToggleTheme 
}) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'my-trips', label: 'My Trips', icon: Map },
    { id: 'itinerary-builder', label: 'Itinerary', icon: BookOpen },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'explore-cities', label: 'Explore', icon: Compass },
    { id: 'budget', label: 'Budget', icon: DollarSign },
    { id: 'community', label: 'Community', icon: Users },
    { id: 'travel-assistant', label: 'Travel Assistant', icon: Sparkles },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <aside className="sidebar">
      {/* Top Header Logo */}
      <div>
        <div className="sidebar-logo">
          <h1>GLOBALTROTTER</h1>
          <p>Digital Journal</p>
        </div>

        {/* Navigation Items */}
        <nav>
          <ul className="nav-links">
            {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = currentScreen === item.id || 
                               (item.id === 'itinerary-builder' && currentScreen === 'itinerary-view') ||
                               (item.id === 'explore-cities' && currentScreen === 'explore-activities');
              
              return (
                <li key={item.id}>
                  <a 
                    className={`nav-link ${isActive ? 'active' : ''}`}
                    onClick={() => onNavigate(item.id)}
                  >
                    <Icon />
                    <span>{item.label}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Sidebar Bottom Section */}
      <div className="sidebar-footer">
        {/* User profile widget */}
        <a className="profile-widget" onClick={() => onNavigate('profile')}>
          <img 
            src={activeUser?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80"} 
            alt={activeUser?.full_name} 
          />
          <div className="profile-info">
            <h4>{activeUser?.full_name || 'Alex Johnson'}</h4>
            <p>View Profile</p>
          </div>
        </a>

        {/* Theme Toggle row */}
        <div className="theme-toggle-row">
          <label>JOURNAL_DARK</label>
          <label className="toggle-switch">
            <input 
              type="checkbox" 
              checked={isDarkMode} 
              onChange={onToggleTheme} 
            />
            <span className="slider"></span>
          </label>
        </div>

        {/* Sign out link */}
        <button 
          onClick={onSignOut}
          style={{
            background: 'none',
            border: 'none',
            color: '#A8A2A8',
            fontSize: '0.8rem',
            fontFamily: "'Space Mono', monospace",
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            padding: '8px 12px',
            width: '100%',
            textAlign: 'left'
          }}
          onMouseEnter={(e) => e.target.style.color = '#E87970'}
          onMouseLeave={(e) => e.target.style.color = '#A8A2A8'}
        >
          <LogOut size={14} />
          <span>SIGN_OUT</span>
        </button>
      </div>
    </aside>
  );
}
