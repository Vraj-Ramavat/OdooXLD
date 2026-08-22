import React, { useState } from 'react';
import { db } from '../db/supabaseClient';
import { Settings, Save, AlertTriangle, Shield, Bell, HelpCircle } from 'lucide-react';

export default function SettingsPage({ activeUser, onProfileUpdate, onSignOut, isDarkMode, onToggleTheme }) {
  const [fullName, setFullName] = useState(activeUser?.full_name || 'Alex Johnson');
  const [bio, setBio] = useState(activeUser?.bio || '');
  const [country, setCountry] = useState(activeUser?.country || 'India');
  const [currency, setCurrency] = useState('INR');
  const [privacyPublic, setPrivacyPublic] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setStatusMsg('');
    setErrorMsg('');

    try {
      const { data, error } = await db.profiles.update(activeUser.id, {
        full_name: fullName,
        bio: bio,
        country: country
      });

      if (error) {
        setErrorMsg('Error updating passport details');
      } else {
        setStatusMsg('Passport updates saved successfully!');
        if (onProfileUpdate) {
          onProfileUpdate(data);
        }
        setTimeout(() => setStatusMsg(''), 3000);
      }
    } catch (err) {
      setErrorMsg('Unexpected update error');
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm("WARNING: This will permanently delete your passport, all trip plans, custom stops, and expense ledgers. This action cannot be undone. Proceed?")) {
      // Clear localStorage tables completely and reload
      localStorage.clear();
      onSignOut();
      window.location.reload();
    }
  };

  return (
    <div className="flex-col" style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Title block */}
      <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '20px' }}>
        <span className="mono-text" style={{ color: 'var(--magenta)' }}>SYSTEM_PREFERENCES //</span>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', fontWeight: 800, marginTop: '4px' }}>
          Settings
        </h1>
      </div>

      {statusMsg && (
        <div style={{
          backgroundColor: 'rgba(72, 183, 176, 0.15)',
          border: '1px solid var(--teal)',
          color: 'var(--teal)',
          padding: '12px 16px',
          borderRadius: '6px',
          fontFamily: "'Space Mono', monospace",
          fontSize: '0.85rem'
        }}>
          CONFIRMED // {statusMsg}
        </div>
      )}

      {errorMsg && (
        <div style={{
          backgroundColor: 'rgba(232, 121, 112, 0.15)',
          border: '1px solid var(--coral)',
          color: 'var(--coral)',
          padding: '12px 16px',
          borderRadius: '6px',
          fontFamily: "'Space Mono', monospace",
          fontSize: '0.85rem'
        }}>
          ALERT // {errorMsg}
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1.2fr',
        gap: '30px'
      }}>
        {/* LEFT COLUMN: Preferences Form */}
        <form onSubmit={handleSave} className="flex-col">
          
          {/* Personal Info section */}
          <div className="editorial-card dark flex-col">
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
              Personal Passport Information
            </h3>

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input 
                type="text" 
                className="form-input" 
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Country of Origin</label>
              <input 
                type="text" 
                className="form-input" 
                value={country}
                onChange={e => setCountry(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Bio / Travel Philosophy</label>
              <textarea 
                className="form-input" 
                value={bio}
                onChange={e => setBio(e.target.value)}
                style={{ minHeight: '100px', resize: 'vertical' }}
              />
            </div>
          </div>

          {/* Regional & Financial Preferences */}
          <div className="editorial-card dark flex-col">
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
              Regional & Display
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Default Currency</label>
                <select className="form-input" value={currency} onChange={e => setCurrency(e.target.value)}>
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Language</label>
                <select className="form-input">
                  <option value="en">English (US/UK)</option>
                  <option value="fr">Français</option>
                  <option value="ja">日本語</option>
                </select>
              </div>
            </div>

            <div className="theme-toggle-row" style={{ padding: '12px 0 0', borderTop: '1px solid var(--border)', marginTop: '14px' }}>
              <label style={{ color: 'var(--off-white)', fontSize: '0.85rem' }}>Journal Light Theme (Cream Paper)</label>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={!isDarkMode} 
                  onChange={onToggleTheme} 
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>

          {/* Submit */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '160px' }}>
              <Save size={16} /> Save Changes
            </button>
          </div>

        </form>

        {/* RIGHT COLUMN: Privacy & Dangerous actions */}
        <div className="flex-col">
          
          {/* Security details */}
          <div className="editorial-card dark flex-col">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--teal)', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
              <Shield size={16} />
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem' }}>Privacy Rules</h3>
            </div>

            <div className="theme-toggle-row" style={{ padding: '8px 0' }}>
              <label style={{ color: 'var(--off-white)', fontSize: '0.85rem' }}>Public Passport Feed</label>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={privacyPublic}
                  onChange={e => setPrivacyPublic(e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="theme-toggle-row" style={{ padding: '8px 0', borderTop: '1px solid var(--border)' }}>
              <label style={{ color: 'var(--off-white)', fontSize: '0.85rem' }}>Email Notifications</label>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={emailAlerts}
                  onChange={e => setEmailAlerts(e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>

          {/* Danger zone */}
          <div className="editorial-card dark flex-col" style={{ borderLeft: '3px solid var(--coral)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--coral)' }}>
              <AlertTriangle size={16} />
              <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>DANGER_ZONE //</h3>
            </div>

            <p style={{ color: 'var(--muted)', fontSize: '0.8rem', marginTop: '6px' }}>
              Deleting your passport clears all database references immediately. This operation is irrevocable.
            </p>

            <button 
              type="button" 
              className="btn" 
              onClick={handleDeleteAccount}
              style={{
                backgroundColor: 'rgba(232, 121, 112, 0.15)',
                border: '1px solid var(--coral)',
                color: 'var(--coral)',
                width: '100%',
                fontSize: '0.8rem',
                justifyContent: 'center',
                marginTop: '10px'
              }}
            >
              Delete Passport Data
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
