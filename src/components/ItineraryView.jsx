import React, { useEffect, useState } from 'react';
import { db } from '../db/supabaseClient';
import { Calendar as CalendarIcon, Clock, DollarSign, MapPin, List, Map, Compass } from 'lucide-react';

export default function ItineraryView({ activeUser, selectedTripId, onSelectTrip, onNavigate }) {
  const [tripsList, setTripsList] = useState([]);
  const [trip, setTrip] = useState(null);
  const [itinerary, setItinerary] = useState([]);
  const [activeMode, setActiveMode] = useState('TIMELINE'); // TIMELINE, CALENDAR, MAP
  const [loading, setLoading] = useState(false);

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
      const { data: iti } = await db.itinerary.list(tripId);
      setItinerary(iti || []);
    }
    setLoading(false);
  };

  // Group activities by day
  const getDaysArray = () => {
    if (!trip) return [];
    return Array.from({ length: trip.duration_days }, (_, i) => i + 1);
  };

  const getDayActivities = (dayNum) => {
    return itinerary.filter(item => item.day_number === dayNum);
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
          <span className="mono-text" style={{ color: 'var(--magenta)' }}>JOURNAL_PREVIEW //</span>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', fontWeight: 800, marginTop: '4px' }}>
            Itinerary: {trip ? trip.name : 'Select Journey'}
          </h1>
        </div>

        {/* Dropdown Selector */}
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
              className="btn btn-primary" 
              onClick={() => onNavigate('itinerary-builder')}
              style={{ padding: '8px 12px' }}
            >
              Continue Planning
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
          LOADING_JOURNEY_STOPS // SYNCHRONIZING
        </div>
      ) : trip ? (
        <div className="flex-col">
          {/* Timeline / Calendar / Map Toggle Buttons */}
          <div style={{
            display: 'flex',
            backgroundColor: 'var(--primary-dark)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '6px',
            alignSelf: 'flex-start',
            gap: '8px'
          }}>
            {[
              { id: 'TIMELINE', label: 'TIMELINE', icon: List },
              { id: 'CALENDAR', label: 'CALENDAR', icon: CalendarIcon },
              { id: 'MAP', label: 'JOURNEY MAP', icon: Map }
            ].map(mode => {
              const Icon = mode.icon;
              return (
                <button
                  key={mode.id}
                  onClick={() => setActiveMode(mode.id)}
                  style={{
                    backgroundColor: activeMode === mode.id ? 'var(--magenta)' : 'transparent',
                    border: 'none',
                    color: activeMode === mode.id ? 'var(--off-white)' : 'var(--muted)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontWeight: 600,
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <Icon size={14} />
                  {mode.label}
                </button>
              );
            })}
          </div>

          {/* MODE CONTENT SWITCHER */}
          {activeMode === 'TIMELINE' && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr',
              gap: '30px'
            }}>
              {/* Daily Timelines column */}
              <div className="flex-col">
                {getDaysArray().map(dayNum => {
                  const dayActs = getDayActivities(dayNum);
                  
                  // Guess matching stop name for the day
                  const stopsCount = trip.destinations?.length || 1;
                  const daysPerStop = Math.max(1, Math.floor(trip.duration_days / stopsCount));
                  const stopIdx = Math.min(stopsCount - 1, Math.floor((dayNum - 1) / daysPerStop));
                  const currentStop = trip.destinations?.[stopIdx];

                  return (
                    <div key={dayNum} className="editorial-card flex-col" style={{ gap: '16px' }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-end',
                        borderBottom: '1px solid var(--border)',
                        paddingBottom: '10px'
                      }}>
                        <div>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--magenta)' }}>
                            DAY {String(dayNum).padStart(2, '0')} //
                          </span>
                          <h3 className="serif-title" style={{ fontSize: '1.5rem', marginTop: '2px' }}>
                            {currentStop ? `${currentStop.name.toUpperCase()}, ${currentStop.country.toUpperCase()}` : 'STOP LOCATION'}
                          </h3>
                        </div>
                        
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--muted)' }}>
                          {dayActs.length} {dayActs.length === 1 ? 'ACTIVITY' : 'ACTIVITIES'}
                        </span>
                      </div>

                      {/* Daily activity timeline items connected */}
                      <div className="timeline-list">
                        {dayActs.map((act, actIdx) => {
                          // Rotate dot colors
                          const dotColors = ['var(--magenta)', 'var(--teal)', 'var(--mustard)', 'var(--coral)'];
                          const color = dotColors[actIdx % dotColors.length];

                          return (
                            <div key={act.id} className="timeline-item" style={{ paddingBottom: '24px' }}>
                              <span className="timeline-dot" style={{ backgroundColor: color, top: '8px' }}></span>
                              
                              <div style={{
                                backgroundColor: 'var(--primary-dark)',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-sm)',
                                padding: '14px 20px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                  <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--magenta)', fontSize: '0.95rem', fontWeight: 'bold' }}>
                                    {act.start_time}
                                  </div>
                                  <div>
                                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--off-white)' }}>
                                      {act.activity_name}
                                    </h4>
                                    <div style={{ display: 'flex', gap: '14px', marginTop: '4px', fontSize: '0.75rem', color: 'var(--muted)' }}>
                                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Clock size={11} /> {act.duration_mins} MINS
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {act.cost > 0 && (
                                  <div style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontWeight: 'bold',
                                    fontSize: '0.9rem',
                                    color: 'var(--mustard)',
                                    backgroundColor: 'rgba(230, 184, 61, 0.05)',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    border: '1px solid rgba(230, 184, 61, 0.15)'
                                  }}>
                                    ₹{Number(act.cost).toLocaleString('en-IN')}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}

                        {dayActs.length === 0 && (
                          <p style={{ color: 'var(--muted)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', paddingLeft: '10px' }}>
                            NO_ACTIVITIES_SCHEDULED_TODAY // SELECT_planning_to_add
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Sidebar Info Card */}
              <div className="flex-col">
                <div className="editorial-card dark">
                  <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '14px' }}>
                    JOURNEY_INSIGHTS //
                  </h4>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
                      <span style={{ color: 'var(--muted)' }}>Destinations:</span>
                      <strong style={{ color: 'var(--off-white)' }}>{trip.destinations?.length || 0} stops</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
                      <span style={{ color: 'var(--muted)' }}>Total Outlined Days:</span>
                      <strong style={{ color: 'var(--off-white)' }}>{trip.duration_days} days</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
                      <span style={{ color: 'var(--muted)' }}>Scheduled Items:</span>
                      <strong style={{ color: 'var(--off-white)' }}>{itinerary.length} events</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px' }}>
                      <span style={{ color: 'var(--muted)' }}>Overall Est. Cost:</span>
                      <strong style={{ color: 'var(--mustard)', fontFamily: 'var(--font-mono)' }}>
                        ₹{itinerary.reduce((acc, c) => acc + Number(c.cost), 0).toLocaleString('en-IN')}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeMode === 'CALENDAR' && (
            <div className="editorial-card">
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', marginBottom: '16px' }}>
                Trip Calendar Summary
              </h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '16px'
              }}>
                {getDaysArray().map(dayNum => {
                  const dayActs = getDayActivities(dayNum);
                  const dayCost = dayActs.reduce((a, b) => a + Number(b.cost), 0);
                  const overBudget = dayCost > (trip.budget / trip.duration_days);

                  return (
                    <div 
                      key={dayNum}
                      style={{
                        backgroundColor: 'var(--primary-dark)',
                        border: `1.5px solid ${overBudget ? 'var(--coral)' : 'var(--border)'}`,
                        borderRadius: 'var(--radius-md)',
                        padding: '16px',
                        minHeight: '140px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: overBudget ? 'var(--coral)' : 'var(--teal)', fontWeight: 'bold' }}>
                            DAY {dayNum}
                          </span>
                          {overBudget && (
                            <span style={{ width: '6px', height: '6px', backgroundColor: 'var(--coral)', borderRadius: '50%' }}></span>
                          )}
                        </div>
                        
                        <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '8px', maxHeight: '60px', overflow: 'hidden' }}>
                          {dayActs.map(a => (
                            <div key={a.id} style={{ textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                              • {a.activity_name}
                            </div>
                          ))}
                          {dayActs.length === 0 && <i>No activities mapped</i>}
                        </div>
                      </div>

                      <div style={{ 
                        borderTop: '1px solid var(--border)', 
                        paddingTop: '8px', 
                        fontSize: '0.75rem', 
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--off-white)',
                        textAlign: 'right'
                      }}>
                        ₹{dayCost.toLocaleString('en-IN')}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeMode === 'MAP' && (
            <div className="editorial-card flex-col" style={{ padding: '40px', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
              <Compass size={40} style={{ color: 'var(--magenta)', marginBottom: '16px' }} />
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', marginBottom: '10px' }}>
                Relational Journey Mapping
              </h3>
              
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '30px', maxWidth: '500px', textAlign: 'center' }}>
                Below is the linear route representing your destination stop chain. Nodes denote travel markers connected by dotted boundaries.
              </p>

              {/* Dotted Route infograph */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexWrap: 'wrap',
                gap: '20px',
                padding: '20px 40px',
                backgroundColor: 'var(--primary-dark)',
                borderRadius: 'var(--radius-lg)',
                border: '1.5px solid var(--border)',
                position: 'relative'
              }}>
                {trip.destinations?.map((stop, idx) => (
                  <React.Fragment key={stop.stop_id}>
                    {idx > 0 && (
                      <div style={{
                        width: '80px',
                        height: '1px',
                        borderTop: '2px dotted var(--magenta)',
                        position: 'relative'
                      }}>
                        <div style={{
                          position: 'absolute',
                          top: '-10px',
                          left: '32px',
                          color: 'var(--mustard)',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.6rem'
                        }}>
                          FLIGHT
                        </div>
                      </div>
                    )}
                    
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--card)',
                        border: '2px solid var(--teal)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--off-white)',
                        fontWeight: 'bold',
                        fontSize: '0.9rem'
                      }}>
                        {idx + 1}
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{stop.name.toUpperCase()}</div>
                        <div style={{ color: 'var(--muted)', fontSize: '0.65rem', fontFamily: 'var(--font-mono)' }}>
                          {stop.coordinates_lat}° N / {stop.coordinates_lng}° E
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                ))}

                {(!trip.destinations || trip.destinations.length === 0) && (
                  <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>No destination markers listed.</p>
                )}
              </div>
            </div>
          )}

        </div>
      ) : (
        <div className="editorial-card" style={{ padding: '60px', textAlign: 'center' }}>
          <CalendarIcon size={36} style={{ color: 'var(--muted)', marginBottom: '14px' }} />
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', marginBottom: '6px' }}>
            No Active Trip Selected
          </h3>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
            Choose one of your voyage logs from the selector menu to inspect itinerary details.
          </p>
        </div>
      )}
    </div>
  );
}
