import React, { useState } from 'react';
import { db } from '../db/supabaseClient';
import { Lock, Mail, User, Phone, MapPin, Globe, FileText, ArrowRight, Camera } from 'lucide-react';

export default function LoginSignup({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Signup fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isLogin) {
      const { data, error: err } = await db.auth.signIn(email, password);
      setLoading(false);
      if (err) {
        setError(typeof err === 'string' ? err : err.message || 'Invalid credentials');
      } else {
        onAuthSuccess(data.user);
      }
    } else {
      if (password !== confirmPassword) {
        setLoading(false);
        setError('Passwords do not match');
        return;
      }

      const meta = {
        firstName,
        lastName,
        phone,
        city,
        country,
        bio,
        avatarUrl: avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80'
      };

      const { data, error: err } = await db.auth.signUp(email, password, meta);
      setLoading(false);
      if (err) {
        setError(typeof err === 'string' ? err : err.message || 'Sign up failed');
      } else {
        onAuthSuccess(data.user);
      }
    }
  };

  // Mock Avatar URL selection
  const handleRandomAvatar = () => {
    const ids = [12, 34, 45, 67, 89];
    const rand = ids[Math.floor(Math.random() * ids.length)];
    setAvatarUrl(`https://xsgames.co/randomusers/assets/avatars/male/${rand}.jpg`);
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#18191D',
      fontFamily: "'DM Sans', sans-serif"
    }}>
      {/* LEFT PANEL: Large cinematic destination photo */}
      <div style={{
        flex: 1.2,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '50px',
        overflow: 'hidden',
        borderRight: '1px solid #38373D'
      }}>
        {/* Cinematic Background */}
        <img 
          src={isLogin 
            ? "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80" // Paris Map theme
            : "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80" // Kyoto theme
          } 
          alt="Cinematic Destination"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'brightness(0.3) contrast(1.15)',
            zIndex: 1,
            transition: 'all 0.8s ease'
          }}
        />

        <div style={{ position: 'relative', zIndex: 2 }}>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '2.5rem',
            fontWeight: 800,
            letterSpacing: '0.05em',
            lineHeight: 1.1,
            color: '#F3EEF1'
          }}>
            GLOBALTROTTER
          </h2>
          <p style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '0.75rem',
            color: '#C94F82',
            letterSpacing: '0.2em',
            marginTop: '4px'
          }}>
            DIGITAL TRAVEL JOURNAL
          </p>
        </div>

        <div style={{ position: 'relative', zIndex: 2, maxWidth: '80%' }}>
          <span style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '0.7rem',
            color: '#48B7B0',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            marginBottom: '8px',
            display: 'block'
          }}>
            FEATURED DISCOVERY
          </span>
          <h3 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '2rem',
            fontWeight: 700,
            marginBottom: '10px',
            lineHeight: 1.2
          }}>
            "Slow journeys aren't measured in miles, but in angles of morning light."
          </h3>
          <p style={{
            color: '#A8A2A8',
            fontSize: '0.85rem',
            fontFamily: "'Space Mono', monospace"
          }}>
            ISSUE 04 // EUROPEAN AUTUMN
          </p>
        </div>
      </div>

      {/* RIGHT PANEL: Login or Signup Form */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px 80px',
        backgroundColor: '#202126',
        overflowY: 'auto'
      }}>
        <div style={{ maxWidth: '440px', width: '100%', margin: '0 auto' }}>
          
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '2.5rem',
              fontWeight: 700,
              color: '#F3EEF1',
              marginBottom: '8px'
            }}>
              {isLogin ? 'Welcome Back' : 'Create Journal'}
            </h1>
            <p style={{ color: '#A8A2A8', fontSize: '0.9rem' }}>
              {isLogin 
                ? 'Enter your credentials to access your travel passport.' 
                : 'Embark on a new digital documentation experience.'}
            </p>
          </div>

          {error && (
            <div style={{
              backgroundColor: 'rgba(232, 121, 112, 0.15)',
              border: '1px solid #E87970',
              color: '#E87970',
              padding: '12px 16px',
              borderRadius: '6px',
              marginBottom: '20px',
              fontSize: '0.85rem',
              fontFamily: "'Space Mono', monospace"
            }}>
              ERROR // {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {!isLogin && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">First Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={firstName} 
                    onChange={e => setFirstName(e.target.value)} 
                    required 
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Last Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={lastName} 
                    onChange={e => setLastName(e.target.value)} 
                    required 
                  />
                </div>
              </div>
            )}

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: '#A8A2A8' }} />
                <input 
                  type="email" 
                  className="form-input" 
                  style={{ paddingLeft: '42px' }}
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  required 
                />
              </div>
            </div>

            {!isLogin && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Phone</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={phone} 
                    onChange={e => setPhone(e.target.value)} 
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">City</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={city} 
                    onChange={e => setCity(e.target.value)} 
                    required 
                  />
                </div>
              </div>
            )}

            {!isLogin && (
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '12px', alignItems: 'flex-end' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Country</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={country} 
                    onChange={e => setCountry(e.target.value)} 
                    required 
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Avatar</label>
                  <button 
                    type="button" 
                    onClick={handleRandomAvatar}
                    style={{
                      width: '100%',
                      height: '45px',
                      backgroundColor: '#25252A',
                      border: '1px solid #38373D',
                      borderRadius: '6px',
                      color: '#F3EEF1',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      fontSize: '0.8rem'
                    }}
                  >
                    <Camera size={14} />
                    {avatarUrl ? 'Regen' : 'Generate'}
                  </button>
                </div>
              </div>
            )}

            {!isLogin && avatarUrl && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                <img 
                  src={avatarUrl} 
                  alt="Avatar preview" 
                  style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #C94F82' }} 
                />
                <span style={{ fontSize: '0.75rem', color: '#A8A2A8', fontFamily: "'Space Mono', monospace" }}>
                  AVATAR_SET // READY
                </span>
              </div>
            )}

            {!isLogin && (
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Bio / Travel Manifesto</label>
                <textarea 
                  className="form-input" 
                  style={{ minHeight: '60px', resize: 'vertical' }}
                  value={bio} 
                  onChange={e => setBio(e.target.value)}
                  placeholder="Tell us about your travel philosophy..."
                />
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: isLogin ? '1fr' : '1fr 1fr', gap: '12px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: '#A8A2A8' }} />
                  <input 
                    type="password" 
                    className="form-input" 
                    style={{ paddingLeft: '42px' }}
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    required 
                  />
                </div>
              </div>

              {!isLogin && (
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Confirm Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: '#A8A2A8' }} />
                    <input 
                      type="password" 
                      className="form-input" 
                      style={{ paddingLeft: '42px' }}
                      value={confirmPassword} 
                      onChange={e => setConfirmPassword(e.target.value)} 
                      required 
                    />
                  </div>
                </div>
              )}
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading}
              style={{
                width: '100%',
                height: '48px',
                marginTop: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px'
              }}
            >
              {loading 
                ? 'Processing...' 
                : (isLogin ? 'Login to Passport' : 'Register Journal')}
              <ArrowRight size={16} />
            </button>
          </form>

          <div style={{
            marginTop: '28px',
            textAlign: 'center',
            fontSize: '0.85rem'
          }}>
            <p style={{ color: '#A8A2A8' }}>
              {isLogin ? "Don't have an account? " : "Already have a journal? "}
              <span 
                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                style={{
                  color: '#C94F82',
                  cursor: 'pointer',
                  fontWeight: 600,
                  textDecoration: 'underline'
                }}
              >
                {isLogin ? 'Create Account' : 'Login'}
              </span>
            </p>
            
            {isLogin && (
              <p style={{ marginTop: '12px' }}>
                <span 
                  onClick={() => setError('Password reset simulation sent to email')}
                  style={{
                    color: '#A8A2A8',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    textDecoration: 'underline'
                  }}
                >
                  Forgot Password?
                </span>
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
