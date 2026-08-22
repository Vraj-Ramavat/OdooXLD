import React from 'react';
import { User, MapPin, Compass, Calendar, Globe, Award, Sparkles } from 'lucide-react';
import VoyaraLogo from './VoyaraLogo';

const PASSPORT_STAMPS = [
  { city: "Paris", country: "France", year: "2024", color: "magenta" },
  { city: "Rome", country: "Italy", year: "2024", color: "teal" },
  { city: "Dubai", country: "UAE", year: "2025", color: "mustard" },
  { city: "Tokyo", country: "Japan", year: "2025", color: "magenta" },
  { city: "Bali", country: "Indonesia", year: "2026", color: "teal" },
  { city: "Barcelona", country: "Spain", year: "2026", color: "mustard" }
];

export default function ProfilePage({ activeUser, onNavigate }) {
  // Stats summary (prepopulated defaults or dynamic)
  const stats = {
    cities: activeUser?.cities_visited || 12,
    countries: activeUser?.countries_visited || 7,
    days: activeUser?.days_traveled || 38,
    manifesto: activeUser?.bio || "Curator of slow itineraries. Seeking cinematic angles, late-night vinyl bars, and authentic culinary secrets around the globe."
  };

  return (
    <div className="flex-col">
      {/* Title */}
      <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '20px' }}>
        <span className="mono-text" style={{ color: 'var(--magenta)' }}>TRAVEL_PASSPORT // REGISTERED</span>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', fontWeight: 800, marginTop: '4px' }}>
          Digital Travel Passport
        </h1>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.2fr 2fr',
        gap: '30px'
      }}>
        {/* LEFT COLUMN: Passport Badge Card */}
        <div className="editorial-card" style={{ 
          padding: 0, 
          display: 'flex', 
          flexDirection: 'column', 
          backgroundColor: 'var(--card-dark)',
          border: '1.5px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden'
        }}>
          {/* Passport Header (Creative Editorial) */}
          <div style={{ 
            backgroundColor: 'var(--primary-dark)', 
            borderBottom: '1px solid var(--border)', 
            padding: '24px',
            textAlign: 'center'
          }}>
            <VoyaraLogo size={36} style={{ marginBottom: '8px' }} />
            <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', letterSpacing: '0.2em', color: 'var(--off-white)' }}>
              VOYARA UNION
            </h3>
            <span style={{ fontSize: '0.6rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
              PASSPORT NO. VY-8822-1404
            </span>
          </div>

          {/* User Image and Core fields */}
          <div style={{ padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <img 
              src={activeUser?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80"} 
              alt={activeUser?.full_name} 
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid var(--border)',
                boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
              }}
            />

            <div style={{ textAlign: 'center' }}>
              <h2 className="serif-title" style={{ fontSize: '1.8rem', color: 'var(--off-white)' }}>
                {activeUser?.full_name || 'Alex Johnson'}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: 'var(--muted)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                <MapPin size={12} style={{ color: 'var(--magenta)' }} />
                <span>ORIGIN: {(activeUser?.country || 'India').toUpperCase()}</span>
              </div>
            </div>

            {/* Travel Manifesto */}
            <div style={{
              borderTop: '1px dashed var(--border)',
              paddingTop: '16px',
              width: '100%',
              fontSize: '0.8rem',
              color: 'var(--muted)',
              textAlign: 'center',
              lineHeight: '1.5'
            }}>
              <span className="form-label" style={{ display: 'block', marginBottom: '6px' }}>MANIFESTO</span>
              "{stats.manifesto}"
            </div>

            <button 
              className="btn btn-secondary" 
              onClick={() => onNavigate('settings')}
              style={{ width: '100%', height: '40px', justifyContent: 'center', fontSize: '0.8rem' }}
            >
              Modify Passport Info
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Statistics and Destination Stamps */}
        <div className="flex-col" style={{ gap: '30px' }}>
          
          {/* Travel Stats Panel */}
          <div className="editorial-card">
            <h3 className="serif-title" style={{ fontSize: '1.5rem', marginBottom: '16px' }}>
              Chronicle Overview
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <div style={{ 
                backgroundColor: 'var(--primary-dark)', 
                border: '1px solid var(--border)', 
                padding: '20px', 
                borderRadius: 'var(--radius-md)',
                textAlign: 'center'
              }}>
                <Compass size={24} style={{ color: 'var(--magenta)', margin: '0 auto 8px' }} />
                <span className="form-label" style={{ display: 'block', fontSize: '0.65rem' }}>CITIES LOGGED</span>
                <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '1.8rem', color: 'var(--off-white)' }}>{stats.cities}</strong>
              </div>

              <div style={{ 
                backgroundColor: 'var(--primary-dark)', 
                border: '1px solid var(--border)', 
                padding: '20px', 
                borderRadius: 'var(--radius-md)',
                textAlign: 'center'
              }}>
                <Globe size={24} style={{ color: 'var(--teal)', margin: '0 auto 8px' }} />
                <span className="form-label" style={{ display: 'block', fontSize: '0.65rem' }}>COUNTRIES</span>
                <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '1.8rem', color: 'var(--off-white)' }}>{stats.countries}</strong>
              </div>

              <div style={{ 
                backgroundColor: 'var(--primary-dark)', 
                border: '1px solid var(--border)', 
                padding: '20px', 
                borderRadius: 'var(--radius-md)',
                textAlign: 'center'
              }}>
                <Calendar size={24} style={{ color: 'var(--mustard)', margin: '0 auto 8px' }} />
                <span className="form-label" style={{ display: 'block', fontSize: '0.65rem' }}>DAYS LOGGED</span>
                <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '1.8rem', color: 'var(--off-white)' }}>{stats.days}</strong>
              </div>
            </div>
          </div>

          {/* Stamps Box */}
          <div className="editorial-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 className="serif-title" style={{ fontSize: '1.5rem' }}>Destination Stamps</h3>
              <span className="form-label" style={{ fontSize: '0.65rem' }}>PASSPORT_INSPECTED</span>
            </div>

            {/* Stamp grid (Circular dashed stamps) */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '24px',
              padding: '10px 0'
            }}>
              {PASSPORT_STAMPS.map((stamp, idx) => (
                <div 
                  key={idx}
                  className={`passport-stamp ${stamp.color}`}
                  style={{
                    margin: '0 auto'
                  }}
                >
                  <span className="city">{stamp.city}</span>
                  <span className="country">{stamp.country}</span>
                  <span style={{ fontSize: '0.6rem', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                    {stamp.year}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ 
              marginTop: '20px', 
              borderTop: '1px dashed var(--border)', 
              paddingTop: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: 'var(--muted)',
              fontSize: '0.8rem'
            }}>
              <Award size={16} style={{ color: 'var(--mustard)' }} />
              <span>Stamps accumulate automatically when a planned trip reaches its completion date parameters.</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
