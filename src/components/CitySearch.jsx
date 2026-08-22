import React, { useEffect, useState } from 'react';
import { db } from '../db/supabaseClient';
import { Search, MapPin, Plus, Star, Check, HelpCircle } from 'lucide-react';

export default function CitySearch({ activeUser, onNavigate }) {
  const [destinations, setDestinations] = useState([]);
  const [tripsList, setTripsList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filters
  const [selectedRegion, setSelectedRegion] = useState('ALL');
  const [selectedCost, setSelectedCost] = useState('ALL'); // ALL, LOW, MID, HIGH
  const [selectedPopularity, setSelectedPopularity] = useState('ALL'); // ALL, 4.7+
  
  // State for Add stop trigger
  const [showAddMenuId, setShowAddMenuId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    loadDestinations();
    loadUserTrips();
  }, [activeUser]);

  const loadDestinations = async () => {
    const { data } = await db.destinations.list();
    if (data) {
      setDestinations(data);
    }
  };

  const loadUserTrips = async () => {
    if (!activeUser) return;
    const { data } = await db.trips.list(activeUser.id);
    if (data) {
      setTripsList(data);
    }
  };

  const handleAddToTrip = async (destId, tripId) => {
    setLoading(true);
    // Find the selected trip details to see current stops count
    const { data: trip } = await db.trips.get(tripId);
    if (trip) {
      const nextOrder = (trip.destinations?.length || 0) + 1;
      // Add stop
      mockDb.addTripStop(tripId, destId, nextOrder);
      
      // Force trigger timeline log addition
      mockDb.addTimelineItem(`Added destination stop to itinerary`, trip.name, '#48B7B0');
      
      setSuccessMsg(`City successfully added as stop #${nextOrder} in ${trip.name}!`);
      setShowAddMenuId(null);
      loadUserTrips(); // Reload

      setTimeout(() => setSuccessMsg(''), 3000);
    }
    setLoading(false);
  };

  // Filter logic
  const filtered = destinations.filter(d => {
    // Search filter
    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          d.country.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Region filter
    const matchesRegion = selectedRegion === 'ALL' || d.region === selectedRegion;
    
    // Cost filter
    let matchesCost = true;
    if (selectedCost === 'LOW') matchesCost = d.cost_index <= 3.0;
    else if (selectedCost === 'MID') matchesCost = d.cost_index > 3.0 && d.cost_index <= 4.4;
    else if (selectedCost === 'HIGH') matchesCost = d.cost_index > 4.4;

    // Popularity filter
    let matchesPop = true;
    if (selectedPopularity === 'HIGH') matchesPop = d.popularity >= 4.7;

    return matchesSearch && matchesRegion && matchesCost && matchesPop;
  });

  return (
    <div className="flex-col">
      {/* Title block */}
      <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '20px' }}>
        <span className="mono-text" style={{ color: 'var(--teal)' }}>DISCOVERY_INDEX //</span>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', fontWeight: 800, marginTop: '4px' }}>
          Discover Destinations
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.95rem' }}>
          Browse cinematic global nodes, inspect cost ratings, and assign them directly to trip outlines.
        </p>
      </div>

      {successMsg && (
        <div style={{
          backgroundColor: 'rgba(72, 183, 176, 0.15)',
          border: '1px solid var(--teal)',
          color: 'var(--teal)',
          padding: '12px 16px',
          borderRadius: '6px',
          fontFamily: "'Space Mono', monospace",
          fontSize: '0.85rem'
        }}>
          CONFIRMATION // {successMsg}
        </div>
      )}

      {/* Search & Filter row */}
      <div className="editorial-card dark flex-col" style={{ gap: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '12px' }}>
          {/* Search bar */}
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '14px', top: '13px', color: 'var(--muted)' }} />
            <input 
              type="text" 
              placeholder="Search cities or countries..." 
              className="form-input"
              style={{ paddingLeft: '40px' }}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Region */}
          <select className="form-input" value={selectedRegion} onChange={e => setSelectedRegion(e.target.value)}>
            <option value="ALL">All Regions</option>
            <option value="Europe">Europe</option>
            <option value="Asia">Asia</option>
            <option value="Middle East">Middle East</option>
          </select>

          {/* Cost Category */}
          <select className="form-input" value={selectedCost} onChange={e => setSelectedCost(e.target.value)}>
            <option value="ALL">All Budget Indices</option>
            <option value="LOW">Budget (Low Cost)</option>
            <option value="MID">Moderate Cost</option>
            <option value="HIGH">Premium / Luxury Cost</option>
          </select>

          {/* Popularity rating */}
          <select className="form-input" value={selectedPopularity} onChange={e => setSelectedPopularity(e.target.value)}>
            <option value="ALL">All Ratings</option>
            <option value="HIGH">Highly Rated (★ 4.7+)</option>
          </select>
        </div>
      </div>

      {/* Grid of Results */}
      <div className="grid-cols-4">
        {filtered.map(dest => (
          <div 
            key={dest.id}
            className="editorial-card"
            style={{
              padding: 0,
              height: '360px',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Cover image */}
            <div style={{ height: '180px', relative: 'position', overflow: 'hidden' }}>
              <img 
                src={dest.image_url} 
                alt={dest.name} 
                style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.65)' }} 
              />
              <span style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                backgroundColor: 'rgba(24, 25, 29, 0.85)',
                border: '1px solid var(--border)',
                color: 'var(--mustard)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.65rem',
                padding: '4px 8px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Star size={10} fill="var(--mustard)" stroke="none" />
                {dest.popularity}
              </span>
            </div>

            {/* Information panel */}
            <div style={{ padding: '16px', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h3 className="serif-title" style={{ fontSize: '1.3rem', color: 'var(--off-white)' }}>
                  {dest.name}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--muted)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                  <MapPin size={10} />
                  <span>{dest.country.toUpperCase()} // {dest.region.toUpperCase()}</span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '12px',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--muted)'
                }}>
                  <span>EST_SPEND:</span>
                  <span style={{ color: 'var(--off-white)', fontWeight: 'bold' }}>
                    ₹{(dest.cost_index * 3000).toLocaleString('en-IN')} / Day
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '6px',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--muted)'
                }}>
                  <span>COORDINATES:</span>
                  <span style={{ color: 'var(--off-white)' }}>
                    {dest.coordinates_lat}° N, {dest.coordinates_lng}° E
                  </span>
                </div>
              </div>

              {/* Add stop button */}
              <div style={{ marginTop: '14px', position: 'relative' }}>
                {showAddMenuId === dest.id ? (
                  <div style={{
                    position: 'absolute',
                    bottom: '40px',
                    left: 0,
                    right: 0,
                    backgroundColor: 'var(--primary-dark)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
                    zIndex: 10,
                    maxHeight: '120px',
                    overflowY: 'auto',
                    padding: '4px'
                  }}>
                    {tripsList.map(t => (
                      <div 
                        key={t.id}
                        onClick={() => handleAddToTrip(dest.id, t.id)}
                        style={{
                          padding: '8px 12px',
                          fontSize: '0.75rem',
                          color: 'var(--off-white)',
                          cursor: 'pointer',
                          borderRadius: '4px',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                      >
                        Add to: {t.name}
                      </div>
                    ))}
                    {tripsList.length === 0 && (
                      <div style={{ padding: '8px', fontSize: '0.7rem', color: 'var(--muted)', textAlign: 'center' }}>
                        No trips found. Create a trip first!
                      </div>
                    )}
                  </div>
                ) : null}

                <button 
                  className="btn"
                  onClick={() => {
                    if (showAddMenuId === dest.id) setShowAddMenuId(null);
                    else setShowAddMenuId(dest.id);
                  }}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--teal)',
                    color: 'var(--bg)',
                    padding: '8px',
                    fontSize: '0.8rem',
                    justifyContent: 'center'
                  }}
                >
                  <Plus size={14} />
                  Add to Trip Stop
                </button>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div style={{
            gridColumn: '1 / -1',
            padding: '60px',
            textAlign: 'center',
            backgroundColor: 'var(--primary-dark)',
            borderRadius: 'var(--radius-lg)',
            border: '1.5px dashed var(--border)'
          }}>
            <HelpCircle size={36} style={{ color: 'var(--muted)', marginBottom: '14px' }} />
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: '8px' }}>
              No Destinations Match Filters
            </h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
              Try loosening your search keywords or checking other region parameters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
