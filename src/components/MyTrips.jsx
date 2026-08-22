import React, { useEffect, useState } from 'react';
import { db } from '../db/supabaseClient';
import { MapPin, Calendar, DollarSign, Eye, Edit, Trash2, Share2, Plus, Sparkles, Copy, Check } from 'lucide-react';

export default function MyTrips({ activeUser, onNavigate, onSelectTrip }) {
  const [trips, setTrips] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, UPCOMING, ONGOING, COMPLETED
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, budget-desc, budget-asc, duration
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrips();
  }, [activeUser]);

  const loadTrips = async () => {
    if (!activeUser) return;
    setLoading(true);
    const { data } = await db.trips.list(activeUser.id);
    if (data) {
      setTrips(data);
    }
    setLoading(false);
  };

  // Filter and sort trips
  const getProcessedTrips = () => {
    const today = new Date("2026-08-22");
    let filtered = trips.filter(t => {
      const sDate = new Date(t.start_date);
      const eDate = new Date(t.end_date);
      
      if (activeTab === 'UPCOMING') {
        return sDate > today;
      } else if (activeTab === 'ONGOING') {
        return sDate <= today && eDate >= today;
      } else if (activeTab === 'COMPLETED') {
        return eDate < today;
      }
      return true;
    });

    // Apply sorting
    return filtered.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.start_date) - new Date(a.start_date);
      if (sortBy === 'oldest') return new Date(a.start_date) - new Date(b.start_date);
      if (sortBy === 'budget-desc') return Number(b.budget) - Number(a.budget);
      if (sortBy === 'budget-asc') return Number(a.budget) - Number(b.budget);
      if (sortBy === 'duration') return (b.duration_days || 0) - (a.duration_days || 0);
      return 0;
    });
  };

  const handleDelete = async (tripId) => {
    if (window.confirm("Are you sure you want to delete this trip and all its itinerary stops?")) {
      await db.trips.delete(tripId);
      loadTrips();
      // Add timeline action
      db.timeline.list(); // triggers internal log refreshes
    }
  };

  const handleShare = async (tripId) => {
    const { data, error } = await db.community.publish(tripId);
    if (data) {
      // Create shareable URL based on hash routing
      const url = `${window.location.origin}${window.location.pathname}#shared/${data}`;
      setShareLink(url);
      setShowShareModal(true);
      setCopied(false);
      loadTrips(); // Reload to show public state
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredTrips = getProcessedTrips();

  return (
    <div className="flex-col">
      {/* Title & Add Trip Trigger */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--border)',
        paddingBottom: '20px'
      }}>
        <div>
          <span className="mono-text" style={{ color: 'var(--magenta)' }}>JOURNAL_PASSPORT //</span>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', fontWeight: 800, marginTop: '4px' }}>
            My Trips
          </h1>
        </div>

        <button className="btn btn-primary" onClick={() => onNavigate('create-trip')}>
          <Plus size={16} />
          Plan New Trip
        </button>
      </div>

      {/* Toolbar: Group By Status Tabs & Sort By Dropdown */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        margin: '10px 0'
      }}>
        {/* Group By Status Tabs */}
        <div className="tabs-container" style={{ margin: 0 }}>
          <span className="mono-text text-xs text-[#A8A2A8] mr-2 self-center font-mono">GROUP_BY:</span>
          {['ALL', 'UPCOMING', 'ONGOING', 'COMPLETED'].map(tab => (
            <button 
              key={tab} 
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Sort By Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label className="mono-text text-xs text-[#A8A2A8] font-mono">SORT_BY:</label>
          <select 
            className="form-input" 
            style={{ width: '180px', height: '36px', padding: '0 10px', fontSize: '0.8rem', fontFamily: "'Space Mono', monospace" }}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Date: Newest First</option>
            <option value="oldest">Date: Oldest First</option>
            <option value="budget-desc">Budget: High to Low</option>
            <option value="budget-asc">Budget: Low to High</option>
            <option value="duration">Duration: Longest</option>
          </select>
        </div>
      </div>

      {/* Grid of Trip Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
          SYNCHRONIZING_TRIPS // LOADING
        </div>
      ) : (
        <div className="grid-cols-3">
          {filteredTrips.map(trip => (
            <div 
              key={trip.id} 
              className="editorial-card"
              style={{
                padding: 0,
                display: 'flex',
                flexDirection: 'column',
                height: '380px'
              }}
            >
              {/* Card Photo Cover */}
              <div style={{ height: '180px', position: 'relative', overflow: 'hidden' }}>
                <img 
                  src={trip.cover_image} 
                  alt={trip.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.65)' }} 
                />
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  backgroundColor: 'rgba(24, 25, 29, 0.75)',
                  border: '1px solid var(--border)',
                  color: 'var(--teal)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.65rem',
                  padding: '4px 8px',
                  borderRadius: '4px'
                }}>
                  {trip.duration_days} DAYS
                </div>
                {trip.is_public && (
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    backgroundColor: 'rgba(201, 79, 130, 0.9)',
                    color: 'var(--off-white)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.65rem',
                    padding: '4px 8px',
                    borderRadius: '4px'
                  }}>
                    PUBLISHED
                  </div>
                )}
              </div>

              {/* Card Contents */}
              <div style={{ padding: '20px', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 className="serif-title" style={{ fontSize: '1.4rem', color: 'var(--off-white)', margin: 0 }}>
                    {trip.name}
                  </h3>
                  
                  {/* Date ranges */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--muted)', fontSize: '0.75rem', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
                    <Calendar size={12} />
                    <span>
                      {new Date(trip.start_date).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})} — {new Date(trip.end_date).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}
                    </span>
                  </div>

                  {/* Route stop counts */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--muted)', fontSize: '0.8rem', marginTop: '10px' }}>
                    <MapPin size={12} style={{ color: 'var(--magenta)' }} />
                    <span style={{ fontWeight: 500, color: 'var(--off-white)' }}>
                      {trip.cities && trip.cities.length > 0 
                        ? `${trip.cities.length} Cities (${trip.cities.join(', ')})`
                        : 'No stops added'}
                    </span>
                  </div>
                </div>

                {/* Footer and Action bars */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTop: '1px solid var(--border)',
                  paddingTop: '14px',
                  marginTop: '14px'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.6rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>EST_BUDGET</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--mustard)' }}>
                      ₹{Number(trip.budget).toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Icon Actions */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      className="btn" 
                      onClick={() => {
                        onSelectTrip(trip.id);
                        onNavigate('itinerary-view');
                      }}
                      style={{ padding: '6px 10px', backgroundColor: 'var(--primary-dark)', border: '1px solid var(--border)' }}
                      title="View Itinerary"
                    >
                      <Eye size={14} style={{ color: 'var(--teal)' }} />
                    </button>
                    <button 
                      className="btn" 
                      onClick={() => {
                        onSelectTrip(trip.id);
                        onNavigate('itinerary-builder');
                      }}
                      style={{ padding: '6px 10px', backgroundColor: 'var(--primary-dark)', border: '1px solid var(--border)' }}
                      title="Edit Itinerary"
                    >
                      <Edit size={14} style={{ color: 'var(--mustard)' }} />
                    </button>
                    <button 
                      className="btn" 
                      onClick={() => handleShare(trip.id)}
                      style={{ padding: '6px 10px', backgroundColor: 'var(--primary-dark)', border: '1px solid var(--border)' }}
                      title="Publish and Share"
                    >
                      <Share2 size={14} style={{ color: 'var(--magenta)' }} />
                    </button>
                    <button 
                      className="btn" 
                      onClick={() => handleDelete(trip.id)}
                      style={{ padding: '6px 10px', backgroundColor: 'var(--primary-dark)', border: '1px solid var(--border)' }}
                      title="Delete Trip"
                    >
                      <Trash2 size={14} style={{ color: 'var(--coral)' }} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredTrips.length === 0 && (
            <div style={{ 
              gridColumn: '1 / -1', 
              padding: '60px', 
              textAlign: 'center', 
              backgroundColor: 'var(--primary-dark)', 
              borderRadius: 'var(--radius-lg)',
              border: '1.5px dashed var(--border)'
            }}>
              <Sparkles size={36} style={{ color: 'var(--mustard)', marginBottom: '14px' }} />
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: '8px' }}>
                No Trips in this Tab
              </h3>
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
                You don't have any trips listed under {activeTab.toLowerCase()}. Add your upcoming voyage now.
              </p>
              <button className="btn btn-primary" onClick={() => onNavigate('create-trip')}>
                <Plus size={16} />
                Plan New Trip
              </button>
            </div>
          )}
        </div>
      )}

      {/* SHARE MODAL */}
      {showShareModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(24, 25, 29, 0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <div className="editorial-card" style={{ maxWidth: '500px', width: '90%', padding: '30px' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', marginBottom: '10px' }}>Trip Published!</h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
              Your itinerary has been added to the public journal feed. Share this secret link to let other travelers clone your trip stops.
            </p>

            <div style={{
              display: 'flex',
              backgroundColor: 'var(--primary-dark)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '8px 12px',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px'
            }}>
              <input 
                type="text" 
                readOnly 
                value={shareLink} 
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: 'var(--off-white)', 
                  fontFamily: 'var(--font-mono)', 
                  fontSize: '0.75rem',
                  width: '80%',
                  outline: 'none'
                }} 
              />
              <button 
                onClick={handleCopyLink}
                style={{
                  background: 'none',
                  border: 'none',
                  color: copied ? 'var(--teal)' : 'var(--magenta)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem'
                }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'COPIED' : 'COPY'}
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" onClick={() => setShowShareModal(false)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
