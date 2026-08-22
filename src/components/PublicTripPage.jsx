import React, { useEffect, useState } from 'react';
import { db } from '../db/supabaseClient';
import { MapPin, Calendar, DollarSign, Clock, Copy, ArrowLeft, Users, Sparkles } from 'lucide-react';

export default function PublicTripPage({ activeUser, shareToken, onNavigate }) {
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cloning, setCloning] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (shareToken) {
      loadSharedTrip();
    }
  }, [shareToken]);

  const loadSharedTrip = async () => {
    setLoading(true);
    const { data } = await db.community.getShared(shareToken);
    if (data) {
      setTrip(data);
    }
    setLoading(false);
  };

  const handleClone = async () => {
    if (!activeUser) {
      alert("Please authenticate to clone this journey!");
      onNavigate('dashboard');
      return;
    }

    setCloning(true);
    const { data, error } = await db.community.clone(shareToken, activeUser.id);
    setCloning(false);

    if (error) {
      alert("Error copying itinerary logs: " + error);
    } else {
      setSuccess(true);
      setTimeout(() => {
        onNavigate('my-trips');
      }, 1500);
    }
  };

  return (
    <div className="flex-col">
      {/* Top Back Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button 
          className="btn btn-secondary" 
          onClick={() => onNavigate('community')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px' }}
        >
          <ArrowLeft size={14} /> Back to Feed
        </button>

        <span className="mono-text" style={{ color: 'var(--magenta)' }}>SHARED_PASSPORT // READ_ONLY</span>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
          DECRYPTING_SHARED_JOURNEY // LOADING
        </div>
      ) : trip ? (
        <div className="flex-col" style={{ gap: '30px' }}>
          
          {/* Cover Hero Banner */}
          <div className="featured-trip-hero" style={{ height: '360px', marginBottom: 0 }}>
            <img 
              src={trip.cover_image} 
              alt={trip.name} 
              style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.4)' }} 
            />
            <div className="featured-trip-overlay">
              <div>
                <span className="hero-tag" style={{ color: 'var(--teal)' }}>JOURNEY SHARE SPREAD</span>
                <h1 className="hero-title">{trip.name}</h1>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--muted)', fontSize: '0.85rem', marginTop: '6px' }}>
                  <Users size={14} />
                  <span>Charted by: <strong style={{ color: 'var(--off-white)' }}>{trip.author}</strong></span>
                  <span>•</span>
                  <span>Dates: <strong>{trip.dates || `${trip.start_date} — ${trip.end_date}`}</strong></span>
                </div>
              </div>

              {/* Clone Action Button */}
              <button 
                className="btn btn-primary"
                onClick={handleClone}
                disabled={cloning}
                style={{
                  alignSelf: 'flex-end',
                  height: '46px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: 'var(--magenta)'
                }}
              >
                <Copy size={16} />
                {cloning ? 'Cloning Itinerary...' : 'Copy This Journey'}
              </button>
            </div>
          </div>

          {success && (
            <div style={{
              backgroundColor: 'rgba(72, 183, 176, 0.15)',
              border: '1px solid var(--teal)',
              color: 'var(--teal)',
              padding: '12px 16px',
              borderRadius: '6px',
              fontFamily: "'Space Mono', monospace",
              fontSize: '0.85rem'
            }}>
              SYNC // Relay copied successfully! Relocating to passport...
            </div>
          )}

          {/* Two-Column split details */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '30px'
          }}>
            
            {/* Itinerary steps */}
            <div className="flex-col">
              <h2 className="serif-title" style={{ fontSize: '1.8rem', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
                Itinerary Outline
              </h2>

              <div className="timeline-list">
                {trip.itinerary && trip.itinerary.map((act, actIdx) => (
                  <div key={act.id || actIdx} className="timeline-item" style={{ paddingBottom: '20px' }}>
                    <span className="timeline-dot" style={{ backgroundColor: 'var(--teal)', top: '8px' }}></span>
                    
                    <div style={{
                      backgroundColor: 'var(--primary-dark)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '12px 16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--magenta)', fontWeight: 'bold' }}>
                          {act.start_time || '09:00'}
                        </span>
                        <div>
                          <div style={{ fontWeight: 500, color: 'var(--off-white)' }}>{act.activity_name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--muted)', display: 'flex', gap: '10px', marginTop: '2px' }}>
                            <span>DAY {act.day_number}</span>
                            <span>•</span>
                            <span>{act.duration_mins || 60} mins</span>
                          </div>
                        </div>
                      </div>

                      {act.cost > 0 && (
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--mustard)', fontWeight: 'bold' }}>
                          ₹{Number(act.cost).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {(!trip.itinerary || trip.itinerary.length === 0) && (
                  <div className="editorial-card dark" style={{ textAlign: 'center', padding: '30px' }}>
                    <Sparkles size={20} style={{ color: 'var(--mustard)', marginBottom: '8px' }} />
                    <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem' }}>No detailed activities logged.</h4>
                    <p style={{ color: 'var(--muted)', fontSize: '0.8rem', marginTop: '4px' }}>
                      This trip contains raw destination stops. Copy this journey to outline daily logs!
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right sidebar info */}
            <div className="flex-col">
              <div className="editorial-card dark">
                <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '12px' }}>
                  ESTIMATED_EXPENDITURE
                </h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justify: 'space-between', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--muted)' }}>Estimated budget:</span>
                    <strong style={{ color: 'var(--mustard)', fontFamily: 'var(--font-mono)' }}>₹{trip.budget.toLocaleString('en-IN')}</strong>
                  </div>
                  <div style={{ display: 'flex', justify: 'space-between', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--muted)' }}>Duration:</span>
                    <strong style={{ color: 'var(--off-white)' }}>{trip.duration_days} Days</strong>
                  </div>
                  <div style={{ display: 'flex', justify: 'space-between', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--muted)' }}>Cities Visited:</span>
                    <strong style={{ color: 'var(--off-white)' }}>{trip.cities ? trip.cities.length : 1} Cities</strong>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      ) : (
        <div className="editorial-card" style={{ padding: '60px', textAlign: 'center' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', marginBottom: '8px' }}>
            Shared Trip Not Found
          </h3>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
            The requested share token is invalid or the post has been archived by the author.
          </p>
        </div>
      )}
    </div>
  );
}
