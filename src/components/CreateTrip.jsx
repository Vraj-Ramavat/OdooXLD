import React, { useEffect, useState } from 'react';
import { db } from '../db/supabaseClient';
import { Search, MapPin, Trash2, ArrowRight, ArrowLeft, Plus, Sparkles } from 'lucide-react';

const COVER_PRESETS = [
  "https://images.unsplash.com/photo-1486299267070-8382e05431dd?auto=format&fit=crop&w=600&q=80", // Europe
  "https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=600&q=80", // Tokyo
  "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80", // Bali
  "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=600&q=80"  // NYC
];

export default function CreateTrip({ activeUser, onNavigate, onSelectTrip }) {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState(COVER_PRESETS[0]);
  const [budget, setBudget] = useState('100000');
  const [currency, setCurrency] = useState('INR');
  const [preferencePace, setPreferencePace] = useState('moderate');
  const [preferenceStyle, setPreferenceStyle] = useState('cultural');

  // Destination selections
  const [allDestinations, setAllDestinations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDests, setSelectedDests] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadDestinations();
  }, []);

  const loadDestinations = async () => {
    const { data } = await db.destinations.list();
    if (data) {
      setAllDestinations(data);
    }
  };

  const handleAddDest = (dest) => {
    if (selectedDests.some(d => d.id === dest.id)) return;
    setSelectedDests([...selectedDests, dest]);
  };

  const handleRemoveDest = (destId) => {
    setSelectedDests(selectedDests.filter(d => d.id !== destId));
  };

  // Move stops left/right for re-ordering
  const handleMoveStop = (idx, direction) => {
    const nextStops = [...selectedDests];
    if (direction === 'left' && idx > 0) {
      const temp = nextStops[idx];
      nextStops[idx] = nextStops[idx - 1];
      nextStops[idx - 1] = temp;
    } else if (direction === 'right' && idx < nextStops.length - 1) {
      const temp = nextStops[idx];
      nextStops[idx] = nextStops[idx + 1];
      nextStops[idx + 1] = temp;
    }
    setSelectedDests(nextStops);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');

    if (!name) {
      setError('Trip Name is required');
      return;
    }
    if (!startDate || !endDate) {
      setError('Start and End dates are required');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      setError('Start date cannot be after end date');
      return;
    }
    if (selectedDests.length === 0) {
      setError('Please add at least one destination stop');
      return;
    }

    const tripData = {
      name,
      description,
      cover_image: coverImage,
      start_date: startDate,
      end_date: endDate,
      budget: Number(budget),
      currency,
      travel_preferences: { pace: preferencePace, style: preferenceStyle },
      destinations: selectedDests.map(d => d.id)
    };

    try {
      const { data, error: tErr } = await db.trips.create(activeUser.id, tripData);
      if (tErr) {
        setError(tErr.message || 'Error inserting trip details');
      } else {
        setSuccess(true);
        // Navigate back to My Trips
        setTimeout(() => {
          if (data && data.id) {
            onSelectTrip(data.id);
          }
          onNavigate('my-trips');
        }, 1500);
      }
    } catch (err) {
      setError('Unexpected database write error');
    }
  };

  // Filtered destinations list
  const filteredDestinations = allDestinations.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-col" style={{ maxWidth: '960px', margin: '0 auto' }}>
      
      {/* Page Title */}
      <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '20px' }}>
        <span className="mono-text" style={{ color: 'var(--magenta)' }}>CREATE_JOURNEY //</span>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', fontWeight: 800, marginTop: '4px' }}>
          Plan a New Trip
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.95rem' }}>
          Define your timeline, cover imagery, budget guidelines, and draft stops.
        </p>
      </div>

      {error && (
        <div style={{
          backgroundColor: 'rgba(232, 121, 112, 0.15)',
          border: '1px solid var(--coral)',
          color: 'var(--coral)',
          padding: '12px 16px',
          borderRadius: '6px',
          fontFamily: "'Space Mono', monospace",
          fontSize: '0.85rem'
        }}>
          ALERT // {error}
        </div>
      )}

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
          SUCCESS // Journey successfully charted. Synchronizing...
        </div>
      )}

      <form onSubmit={handleCreate} className="flex-col">
        {/* Core Inputs Row */}
        <div className="grid-cols-2">
          
          <div className="editorial-card dark flex-col">
            <div className="form-group">
              <label className="form-label">Trip Name</label>
              <input 
                type="text" 
                className="form-input"
                placeholder="e.g. Autumn in Kyoto" 
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input 
                  type="date" 
                  className="form-input" 
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">End Date</label>
                <input 
                  type="date" 
                  className="form-input" 
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea 
                className="form-input"
                placeholder="Chasing leaf-falls, street-stalls, and vintage vinyl bars..." 
                value={description}
                onChange={e => setDescription(e.target.value)}
                style={{ minHeight: '100px', resize: 'vertical' }}
              />
            </div>
          </div>

          {/* Cover & Financial preferences */}
          <div className="editorial-card dark flex-col">
            <div>
              <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>Cover Image Theme</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                {COVER_PRESETS.map((url, i) => (
                  <div 
                    key={i} 
                    style={{
                      height: '60px',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      border: coverImage === url ? '2px solid var(--magenta)' : '1px solid var(--border)',
                      cursor: 'pointer',
                      position: 'relative'
                    }}
                    onClick={() => setCoverImage(url)}
                  >
                    <img src={url} alt={`Preset ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Budget</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={budget}
                  onChange={e => setBudget(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Currency</label>
                <select 
                  className="form-input" 
                  value={currency}
                  onChange={e => setCurrency(e.target.value)}
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Travel Pace</label>
                <select className="form-input" value={preferencePace} onChange={e => setPreferencePace(e.target.value)}>
                  <option value="slow">Slow & Slow-living</option>
                  <option value="moderate">Moderate Explorer</option>
                  <option value="fast">Fast & Cover All</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Travel Style</label>
                <select className="form-input" value={preferenceStyle} onChange={e => setPreferenceStyle(e.target.value)}>
                  <option value="cultural">Culture & History</option>
                  <option value="culinary">Culinary & Dining</option>
                  <option value="nature">Nature & Outdoors</option>
                  <option value="shopping">Shopping & Design</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* SELECT DESTINATIONS SECTION */}
        <div className="editorial-card">
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: '14px' }}>Select Destinations</h3>
          
          {/* Selected Tiles Sequence */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '12px',
            backgroundColor: 'var(--primary-dark)',
            padding: '20px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            marginBottom: '20px',
            position: 'relative'
          }}>
            {selectedDests.map((dest, idx) => (
              <React.Fragment key={dest.id}>
                {idx > 0 && (
                  <span style={{ 
                    fontFamily: 'var(--font-mono)', 
                    color: 'var(--mustard)', 
                    fontWeight: 'bold', 
                    fontSize: '1rem',
                    padding: '0 4px'
                  }}>
                    • • •
                  </span>
                )}
                
                <div style={{
                  backgroundColor: 'var(--card)',
                  border: '1.5px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--off-white)' }}>{dest.name.toUpperCase()}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{dest.country.toUpperCase()}</div>
                  </div>
                  
                  {/* Reorder & Remove Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', borderLeft: '1px solid var(--border)', paddingLeft: '8px', marginLeft: '4px' }}>
                    <button 
                      type="button" 
                      onClick={() => handleMoveStop(idx, 'left')} 
                      disabled={idx === 0}
                      style={{ background: 'none', border: 'none', color: idx === 0 ? 'rgba(255,255,255,0.05)' : 'var(--muted)', cursor: 'pointer' }}
                    >
                      <ArrowLeft size={14} />
                    </button>
                    <button 
                      type="button" 
                      onClick={() => handleMoveStop(idx, 'right')} 
                      disabled={idx === selectedDests.length - 1}
                      style={{ background: 'none', border: 'none', color: idx === selectedDests.length - 1 ? 'rgba(255,255,255,0.05)' : 'var(--muted)', cursor: 'pointer' }}
                    >
                      <ArrowRight size={14} />
                    </button>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveDest(dest.id)} 
                      style={{ background: 'none', border: 'none', color: 'var(--coral)', cursor: 'pointer', marginLeft: '4px' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </React.Fragment>
            ))}

            {selectedDests.length === 0 && (
              <div style={{ color: 'var(--muted)', fontSize: '0.9rem', fontFamily: 'var(--font-mono)', textAlign: 'center', width: '100%' }}>
                ROUTE_SCHEMATIC // EMPTY (ADD STOPS BELOW)
              </div>
            )}
          </div>

          {/* Search bar & Selection Results */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <div className="form-group">
                <label className="form-label">Search Cities</label>
                <div style={{ position: 'relative' }}>
                  <Search size={16} style={{ position: 'absolute', left: '14px', top: '13px', color: 'var(--muted)' }} />
                  <input 
                    type="text" 
                    placeholder="Search e.g. Paris, Tokyo, Bali..." 
                    className="form-input"
                    style={{ paddingLeft: '40px' }}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Suggestions grid */}
              <div style={{ 
                border: '1px solid var(--border)', 
                borderRadius: 'var(--radius-sm)', 
                maxHeight: '220px', 
                overflowY: 'auto',
                backgroundColor: 'var(--primary-dark)'
              }}>
                {filteredDestinations.map(dest => {
                  const isAdded = selectedDests.some(d => d.id === dest.id);
                  return (
                    <div 
                      key={dest.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px 16px',
                        borderBottom: '1px solid var(--border)',
                        backgroundColor: isAdded ? 'rgba(72, 183, 176, 0.05)' : 'transparent'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{dest.name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>{dest.country}</div>
                      </div>
                      <button
                        type="button"
                        disabled={isAdded}
                        onClick={() => handleAddDest(dest)}
                        style={{
                          backgroundColor: isAdded ? 'transparent' : 'var(--teal)',
                          color: isAdded ? 'var(--muted)' : 'var(--bg)',
                          border: 'none',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          cursor: isAdded ? 'default' : 'pointer',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.7rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Plus size={12} />
                        {isAdded ? 'ADDED' : 'ADD'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Editorial Quick Guide */}
            <div style={{ 
              backgroundColor: 'var(--primary-dark)', 
              border: '1px solid var(--border)', 
              borderRadius: 'var(--radius-sm)', 
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center'
            }}>
              <Sparkles size={28} style={{ color: 'var(--mustard)', marginBottom: '10px' }} />
              <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--off-white)', letterSpacing: '0.1em' }}>
                JOURNEY_DRAFT_SYSTEM
              </h4>
              <p style={{ color: 'var(--muted)', fontSize: '0.8rem', marginTop: '6px', maxWidth: '300px' }}>
                Add your destinations in order. You can drag and drop (or click arrows) to swap stop sequences. A linear itinerary calendar will be calculated automatically.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '14px', marginTop: '10px' }}>
          <button type="button" className="btn btn-secondary" onClick={() => onNavigate('dashboard')}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" style={{ minWidth: '180px' }}>
            Create Journey
          </button>
        </div>
      </form>
    </div>
  );
}
