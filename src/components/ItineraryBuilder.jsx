import React, { useEffect, useState } from 'react';
import { db } from '../db/supabaseClient';
import { Plus, Trash2, ArrowUp, ArrowDown, MapPin, Clock, DollarSign, Calendar, Sparkles, Eye } from 'lucide-react';

export default function ItineraryBuilder({ activeUser, selectedTripId, onSelectTrip, onNavigate }) {
  const [tripsList, setTripsList] = useState([]);
  const [trip, setTrip] = useState(null);
  const [itinerary, setItinerary] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form states for adding activities
  const [showAddModal, setShowAddModal] = useState(false);
  const [activityName, setActivityName] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [durationMins, setDurationMins] = useState('60');
  const [cost, setCost] = useState('0');
  const [targetDay, setTargetDay] = useState(1);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTrips();
  }, [activeUser]);

  useEffect(() => {
    if (selectedTripId) {
      loadTripDetails(selectedTripId);
    } else {
      setTrip(null);
      setItinerary([]);
    }
  }, [selectedTripId]);

  const loadTrips = async () => {
    if (!activeUser) return;
    const { data } = await db.trips.list(activeUser.id);
    if (data) setTripsList(data);
  };

  const loadTripDetails = async (tripId) => {
    setLoading(true);
    const { data } = await db.trips.get(tripId);
    if (data) {
      setTrip(data);
      const { data: itiItems } = await db.itinerary.list(tripId);
      setItinerary(itiItems || []);
    }
    setLoading(false);
  };

  const handleAddActivitySubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!activityName) {
      setError('Activity name is required');
      return;
    }

    const itemData = {
      day_number: Number(targetDay),
      start_time: startTime,
      activity_name: activityName,
      duration_mins: Number(durationMins),
      cost: Number(cost)
    };

    const { error: aErr } = await db.itinerary.add(trip.id, itemData);
    if (aErr) {
      setError(aErr.message || 'Error inserting activity');
    } else {
      setShowAddModal(false);
      setActivityName('');
      setStartTime('09:00');
      setDurationMins('60');
      setCost('0');
      loadTripDetails(trip.id); // Reload
    }
  };

  const handleDeleteActivity = async (itemId) => {
    if (window.confirm("Are you sure you want to delete this activity? The expense will also be removed from the budget.")) {
      await db.itinerary.delete(trip.id, itemId);
      loadTripDetails(trip.id);
    }
  };

  const handleMoveActivity = async (dayNum, actIdx, direction) => {
    const dayActivities = itinerary.filter(i => i.day_number === dayNum);
    if (direction === 'up' && actIdx > 0) {
      const temp = dayActivities[actIdx];
      dayActivities[actIdx] = dayActivities[actIdx - 1];
      dayActivities[actIdx - 1] = temp;
    } else if (direction === 'down' && actIdx < dayActivities.length - 1) {
      const temp = dayActivities[actIdx];
      dayActivities[actIdx] = dayActivities[actIdx + 1];
      dayActivities[actIdx + 1] = temp;
    }

    const otherActivities = itinerary.filter(i => i.day_number !== dayNum);
    const updatedItinerary = [...otherActivities, ...dayActivities];

    setItinerary(updatedItinerary);
    if (trip) {
      await db.itinerary.reorder(trip.id, dayActivities);
    }
  };

  // Group activities by day
  const getDayActivities = (dayNum) => {
    return itinerary.filter(i => i.day_number === dayNum);
  };

  return (
    <div className="flex-col">
      {/* Header bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--border)',
        paddingBottom: '20px'
      }}>
        <div>
          <span className="mono-text" style={{ color: 'var(--magenta)' }}>BUILD_ENGINE //</span>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', fontWeight: 800, marginTop: '4px' }}>
            Build Your Journey
          </h1>
        </div>

        {/* Trip Selector dropdown if not pre-selected */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <label className="form-label" style={{ marginBottom: 0 }}>ACTIVE_TRIP:</label>
          <select 
            className="form-input" 
            style={{ width: '220px', height: '40px', padding: '0 12px' }}
            value={selectedTripId || ''}
            onChange={(e) => onSelectTrip(e.target.value)}
          >
            <option value="">Select a Trip...</option>
            {tripsList.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          
          {trip && (
            <button 
              className="btn btn-secondary" 
              onClick={() => onNavigate('itinerary-view')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Eye size={14} /> View
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
          SYNCHRONIZING_ITINERARY // LOADING
        </div>
      ) : trip ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 300px',
          gap: '30px'
        }}>
          {/* LEFT BUILDER TIMELINE */}
          <div className="flex-col" style={{ gap: '30px' }}>
            
            {/* Stops segments */}
            {trip.destinations && trip.destinations.map((stop, stopIdx) => {
              // Guessing start/end date for each stop based on order
              const daysPerStop = Math.max(1, Math.floor(trip.duration_days / trip.destinations.length));
              const startDayOffset = stopIdx * daysPerStop;
              const stopStart = new Date(trip.start_date);
              stopStart.setDate(stopStart.getDate() + startDayOffset);
              const stopEnd = new Date(stopStart);
              stopEnd.setDate(stopEnd.getDate() + daysPerStop - 1);
              
              const formatStopDate = (d) => d.toLocaleDateString('en-US', {day: 'numeric', month: 'short'});

              return (
                <div key={stop.stop_id} style={{ display: 'flex', gap: '20px' }}>
                  {/* Left layout connector line */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    paddingTop: '8px'
                  }}>
                    <span style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--magenta)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      color: 'var(--off-white)',
                      zIndex: 2
                    }}>
                      {String(stopIdx + 1).padStart(2, '0')}
                    </span>
                    {stopIdx < trip.destinations.length - 1 && (
                      <div style={{
                        flexGrow: 1,
                        width: '1px',
                        borderLeft: '2px dotted var(--border)',
                        marginTop: '10px',
                        marginBottom: '-20px'
                      }}></div>
                    )}
                  </div>

                  {/* Card panel containing stop header & day sub-sections */}
                  <div className="editorial-card" style={{ flexGrow: 1, padding: '24px' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderBottom: '1px solid var(--border)',
                      paddingBottom: '14px',
                      marginBottom: '20px'
                    }}>
                      <div>
                        <h2 className="serif-title" style={{ fontSize: '1.8rem', letterSpacing: '0.05em' }}>
                          {stop.name.toUpperCase()} / {stop.country.toUpperCase()}
                        </h2>
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.75rem',
                          color: 'var(--muted)',
                          marginTop: '2px',
                          display: 'block'
                        }}>
                          COORD: {stop.coordinates_lat}° N, {stop.coordinates_lng}° E
                        </span>
                      </div>
                      
                      <div style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.85rem',
                        color: 'var(--teal)',
                        fontWeight: 'bold'
                      }}>
                        {formatStopDate(stopStart).toUpperCase()} — {formatStopDate(stopEnd).toUpperCase()}
                      </div>
                    </div>

                    {/* Render days for this stop */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {Array.from({ length: daysPerStop }).map((_, localIdx) => {
                        const dayNum = startDayOffset + localIdx + 1;
                        const dayActivities = getDayActivities(dayNum);
                        
                        return (
                          <div key={dayNum} style={{
                            backgroundColor: 'var(--primary-dark)',
                            borderRadius: 'var(--radius-md)',
                            padding: '16px',
                            border: '1px solid var(--border)'
                          }}>
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginBottom: '12px'
                            }}>
                              <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--off-white)', letterSpacing: '0.05em' }}>
                                DAY {String(dayNum).padStart(2, '0')} //
                              </h4>
                              
                              <button 
                                className="btn"
                                onClick={() => {
                                  setTargetDay(dayNum);
                                  setShowAddModal(true);
                                }}
                                style={{
                                  padding: '4px 8px',
                                  fontSize: '0.75rem',
                                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                  border: '1px solid var(--border)',
                                  color: 'var(--teal)'
                                }}
                              >
                                <Plus size={12} /> Add Activity
                              </button>
                            </div>

                            {/* Daily items vertical timeline */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                              {dayActivities.map((act, actIdx) => (
                                <div 
                                  key={act.id} 
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '10px 14px',
                                    backgroundColor: 'var(--card)',
                                    borderRadius: 'var(--radius-sm)',
                                    border: '1px solid var(--border)',
                                    fontSize: '0.85rem'
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--magenta)', fontWeight: 'bold' }}>
                                      {act.start_time}
                                    </div>
                                    <div>
                                      <div style={{ fontWeight: 500, color: 'var(--off-white)' }}>{act.activity_name}</div>
                                      <div style={{ fontSize: '0.75rem', color: 'var(--muted)', display: 'flex', gap: '10px', marginTop: '2px' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Clock size={10} /> {act.duration_mins}m</span>
                                        {act.cost > 0 && (
                                          <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                            <DollarSign size={10} />
                                            <span>₹{act.cost.toLocaleString('en-IN')}</span>
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Sort & Delete control row */}
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <button 
                                      onClick={() => handleMoveActivity(dayNum, actIdx, 'up')}
                                      disabled={actIdx === 0}
                                      style={{ background: 'none', border: 'none', color: actIdx === 0 ? 'rgba(255,255,255,0.02)' : 'var(--muted)', cursor: 'pointer' }}
                                    >
                                      <ArrowUp size={14} />
                                    </button>
                                    <button 
                                      onClick={() => handleMoveActivity(dayNum, actIdx, 'down')}
                                      disabled={actIdx === dayActivities.length - 1}
                                      style={{ background: 'none', border: 'none', color: actIdx === dayActivities.length - 1 ? 'rgba(255,255,255,0.02)' : 'var(--muted)', cursor: 'pointer' }}
                                    >
                                      <ArrowDown size={14} />
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteActivity(act.id)}
                                      style={{ background: 'none', border: 'none', color: 'var(--coral)', cursor: 'pointer', marginLeft: '4px' }}
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </div>
                              ))}

                              {dayActivities.length === 0 && (
                                <div style={{
                                  textAlign: 'center',
                                  padding: '12px',
                                  color: 'var(--muted)',
                                  fontSize: '0.75rem',
                                  fontFamily: 'var(--font-mono)'
                                }}>
                                  NO_ACTIVITIES_LOGGED
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* RIGHT SIDE PANEL: Trip stats overview */}
          <div className="flex-col">
            <div className="editorial-card dark">
              <img 
                src={trip.cover_image} 
                alt={trip.name} 
                style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', marginBottom: '14px', border: '1px solid var(--border)' }} 
              />
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', marginBottom: '4px' }}>{trip.name}</h3>
              <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '14px' }}>{trip.description}</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '14px', fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--muted)' }}>BUDGET LIMIT:</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>₹{Number(trip.budget).toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--muted)' }}>STOPS SCHEDULED:</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>{trip.destinations?.length || 0} Cities</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--muted)' }}>TOTAL DAYS:</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>{trip.duration_days} Days</span>
                </div>
              </div>
            </div>

            <div className="editorial-card" style={{ borderLeft: '3px solid var(--mustard)' }}>
              <Sparkles size={20} style={{ color: 'var(--mustard)', marginBottom: '8px' }} />
              <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                PLANNING_TIPS
              </h4>
              <p style={{ color: 'var(--muted)', fontSize: '0.8rem', marginTop: '6px' }}>
                Add events chronologically to compute daily schedules. High-cost items will display in the budget review warning panel if they push you over your daily limit.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="editorial-card" style={{ padding: '60px', textAlign: 'center' }}>
          <Calendar size={36} style={{ color: 'var(--muted)', marginBottom: '14px' }} />
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', marginBottom: '6px' }}>
            No Active Trip Selected
          </h3>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
            Choose one of your outline tracks from the dropdown above to continue mapping stops.
          </p>
        </div>
      )}

      {/* ADD ACTIVITY DIALOG MODAL */}
      {showAddModal && (
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
          <div className="editorial-card" style={{ maxWidth: '440px', width: '90%' }}>
            <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem' }}>Add Activity for Day {targetDay}</h3>
            </div>

            {error && (
              <div style={{
                backgroundColor: 'rgba(232, 121, 112, 0.15)',
                border: '1px solid var(--coral)',
                color: 'var(--coral)',
                padding: '8px 12px',
                borderRadius: '6px',
                marginBottom: '14px',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)'
              }}>
                ALERT // {error}
              </div>
            )}

            <form onSubmit={handleAddActivitySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Activity Title</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Louvre Guided Audio Tour"
                  value={activityName}
                  onChange={e => setActivityName(e.target.value)}
                  required 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Start Time</label>
                  <input 
                    type="time" 
                    className="form-input" 
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    required 
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Duration (mins)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={durationMins}
                    onChange={e => setDurationMins(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Estimated Cost (INR)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={cost}
                  onChange={e => setCost(e.target.value)}
                  required 
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
