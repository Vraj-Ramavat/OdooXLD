import React, { useEffect, useState } from 'react';
import { db } from '../db/supabaseClient';
import { Search, Clock, DollarSign, Star, Plus, Check, MapPin } from 'lucide-react';

const CATEGORIES = ['Food', 'Culture', 'Nature', 'Adventure', 'Shopping', 'Nightlife'];

export default function ActivitySearch({ activeUser, selectedTripId, onNavigate }) {
  const [activities, setActivities] = useState([]);
  const [tripsList, setTripsList] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [maxCost, setMaxCost] = useState('ALL'); // ALL, 2000, 5000
  const [minRating, setMinRating] = useState('ALL'); // ALL, 4.8+
  
  // Selection
  const [targetDay, setTargetDay] = useState(1);
  const [showAddMenuId, setShowAddMenuId] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    loadActivities();
    loadTrips();
  }, [activeUser, selectedTripId]);

  const loadActivities = async () => {
    const { data } = await db.activities.list();
    if (data) {
      setActivities(data);
    }
  };

  const loadTrips = async () => {
    if (!activeUser) return;
    const { data } = await db.trips.list(activeUser.id);
    if (data) {
      setTripsList(data);
      // Auto-select trip if selectedTripId is provided
      const preSelected = data.find(t => t.id === selectedTripId) || data[0];
      if (preSelected) {
        loadTripStops(preSelected.id);
      }
    }
  };

  const loadTripStops = async (tripId) => {
    const { data } = await db.trips.get(tripId);
    if (data) {
      setSelectedTrip(data);
    }
  };

  const handleTripChange = (tripId) => {
    if (!tripId) {
      setSelectedTrip(null);
      return;
    }
    loadTripStops(tripId);
  };

  const handleAddActivity = async (act) => {
    if (!selectedTrip) {
      alert("Please select a trip first in the configuration bar!");
      return;
    }

    const itemData = {
      day_number: Number(targetDay),
      start_time: act.category === 'Food' ? '13:00' : '10:00', // Mock start time slot
      activity_name: act.name,
      duration_mins: act.duration_mins,
      cost: act.cost,
      activity_id: act.id
    };

    const { data, error } = await db.itinerary.add(selectedTrip.id, itemData);
    if (error) {
      alert("Error adding activity to database");
    } else {
      setSuccessMsg(`"${act.name}" successfully added to Day ${targetDay} of ${selectedTrip.name}!`);
      setShowAddMenuId(null);
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  // Filter activities
  const filtered = activities.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          a.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCat = activeCategory === 'ALL' || a.category === activeCategory;

    let matchesCost = true;
    if (maxCost === '2000') matchesCost = a.cost <= 2000;
    else if (maxCost === '5000') matchesCost = a.cost <= 5000;

    let matchesRating = true;
    if (minRating === '4.8') matchesRating = a.rating >= 4.8;

    return matchesSearch && matchesCat && matchesCost && matchesRating;
  });

  return (
    <div className="flex-col">
      {/* Title block */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--border)',
        paddingBottom: '20px'
      }}>
        <div>
          <span className="mono-text" style={{ color: 'var(--mustard)' }}>EXPLORE_ACTIVITIES //</span>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', fontWeight: 800, marginTop: '4px' }}>
            Find Things to Do
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.95rem' }}>
            Map pre-vetted activities directly into active day stops.
          </p>
        </div>

        {/* Global Trip configure bar */}
        <div style={{
          display: 'flex',
          backgroundColor: 'var(--primary-dark)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 16px',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div>
            <span style={{ fontSize: '0.65rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)', display: 'block' }}>TARGET_JOURNEY</span>
            <select 
              className="form-input" 
              style={{ width: '200px', height: '36px', padding: '0 8px', marginTop: '4px', backgroundColor: 'var(--card)' }}
              value={selectedTrip?.id || ''}
              onChange={e => handleTripChange(e.target.value)}
            >
              <option value="">Choose trip...</option>
              {tripsList.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          {selectedTrip && (
            <div>
              <span style={{ fontSize: '0.65rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)', display: 'block' }}>TARGET_DAY</span>
              <select 
                className="form-input" 
                style={{ width: '80px', height: '36px', padding: '0 8px', marginTop: '4px', backgroundColor: 'var(--card)' }}
                value={targetDay}
                onChange={e => setTargetDay(e.target.value)}
              >
                {Array.from({ length: selectedTrip.duration_days || 1 }).map((_, idx) => (
                  <option key={idx + 1} value={idx + 1}>Day {idx + 1}</option>
                ))}
              </select>
            </div>
          )}
        </div>
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
          DRAFT_SYNC // {successMsg}
        </div>
      )}

      {/* Categories Horizontal scrolling chips */}
      <div style={{
        display: 'flex',
        gap: '10px',
        overflowX: 'auto',
        paddingBottom: '4px'
      }}>
        <button
          onClick={() => setActiveCategory('ALL')}
          style={{
            backgroundColor: activeCategory === 'ALL' ? 'var(--magenta)' : 'var(--primary-dark)',
            border: '1px solid var(--border)',
            color: 'var(--off-white)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            padding: '8px 16px',
            borderRadius: '20px',
            cursor: 'pointer',
            fontWeight: 600,
            whiteSpace: 'nowrap'
          }}
        >
          ALL CATEGORIES
        </button>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              backgroundColor: activeCategory === cat ? 'var(--magenta)' : 'var(--primary-dark)',
              border: '1px solid var(--border)',
              color: 'var(--off-white)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              padding: '8px 16px',
              borderRadius: '20px',
              cursor: 'pointer',
              fontWeight: 600,
              whiteSpace: 'nowrap'
            }}
          >
            {cat.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Filter Options box */}
      <div className="editorial-card dark" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px' }}>
          {/* Keyword Search */}
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '14px', top: '13px', color: 'var(--muted)' }} />
            <input 
              type="text" 
              placeholder="Search activities e.g. sushi, hike, guide..." 
              className="form-input"
              style={{ paddingLeft: '40px' }}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Cost limit */}
          <select className="form-input" value={maxCost} onChange={e => setMaxCost(e.target.value)}>
            <option value="ALL">All Costs</option>
            <option value="2000">Under ₹2,000</option>
            <option value="5000">Under ₹5,000</option>
          </select>

          {/* Rating */}
          <select className="form-input" value={minRating} onChange={e => setMinRating(e.target.value)}>
            <option value="ALL">All Ratings</option>
            <option value="4.8">Top Rated (★ 4.8+)</option>
          </select>
        </div>
      </div>

      {/* Activities Grid */}
      <div className="grid-cols-3">
        {filtered.map(act => (
          <div 
            key={act.id}
            className="editorial-card"
            style={{
              padding: 0,
              height: '350px',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Image */}
            <div style={{ height: '160px', position: 'relative', overflow: 'hidden' }}>
              <img 
                src={act.image_url} 
                alt={act.name} 
                style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.7)' }} 
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
                gap: '3px'
              }}>
                <Star size={10} fill="var(--mustard)" stroke="none" />
                {act.rating}
              </span>
              <span style={{
                position: 'absolute',
                bottom: '12px',
                left: '12px',
                backgroundColor: 'rgba(201, 79, 130, 0.9)',
                color: '#fff',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6rem',
                padding: '3px 6px',
                borderRadius: '4px'
              }}>
                {act.category.toUpperCase()}
              </span>
            </div>

            {/* Core details */}
            <div style={{ padding: '16px', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h3 className="serif-title" style={{ fontSize: '1.25rem', color: 'var(--off-white)', margin: 0 }}>
                  {act.name}
                </h3>
                <p style={{ color: 'var(--muted)', fontSize: '0.8rem', marginTop: '6px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebKitLineClamp: 2, WebKitBoxOrient: 'vertical' }}>
                  {act.description}
                </p>

                <div style={{ display: 'flex', gap: '14px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--muted)', marginTop: '12px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Clock size={12} /> {act.duration_mins} MINS
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '2px', color: 'var(--mustard)', fontWeight: 'bold' }}>
                    <DollarSign size={12} /> ₹{Number(act.cost).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Add trigger */}
              <button 
                className="btn btn-primary"
                onClick={() => handleAddActivity(act)}
                style={{
                  width: '100%',
                  fontSize: '0.8rem',
                  padding: '8px',
                  justifyContent: 'center',
                  backgroundColor: 'var(--magenta)'
                }}
              >
                <Plus size={14} /> Add to Itinerary
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
