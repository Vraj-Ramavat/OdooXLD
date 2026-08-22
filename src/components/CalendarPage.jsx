import React, { useEffect, useState } from 'react';
import { db } from '../db/supabaseClient';
import { Calendar as CalendarIcon, Clock, DollarSign, AlertTriangle, Plus, Trash2, Edit } from 'lucide-react';

export default function CalendarPage({ activeUser, selectedTripId, onSelectTrip }) {
  const [tripsList, setTripsList] = useState([]);
  const [activeTrip, setActiveTrip] = useState(null);
  const [itinerary, setItinerary] = useState([]);
  
  // Date tracking for Calendar Month view
  const [currentMonth, setCurrentMonth] = useState(new Date("2026-05-01")); // default to European Explorer month
  const [selectedDateStr, setSelectedDateStr] = useState("2026-05-20"); // default to start date
  const [dayDetailsModal, setDayDetailsModal] = useState(false);
  const [activeDayNum, setActiveDayNum] = useState(1);

  // Form states for quick add event inside calendar
  const [showAddForm, setShowAddForm] = useState(false);
  const [eventName, setEventName] = useState('');
  const [eventTime, setEventTime] = useState('09:00');
  const [eventCost, setEventCost] = useState('0');

  useEffect(() => {
    loadTrips();
  }, [activeUser]);

  useEffect(() => {
    if (selectedTripId) {
      loadTripDetails(selectedTripId);
    }
  }, [selectedTripId]);

  const loadTrips = async () => {
    if (!activeUser) return;
    const { data } = await db.trips.list(activeUser.id);
    if (data) {
      setTripsList(data);
      // Auto-select a trip if none selected
      const selected = data.find(t => t.id === selectedTripId) || data[0];
      if (selected) {
        onSelectTrip(selected.id);
        loadTripDetails(selected.id);
      }
    }
  };

  const loadTripDetails = async (tripId) => {
    const { data } = await db.trips.get(tripId);
    if (data) {
      setActiveTrip(data);
      const { data: iti } = await db.itinerary.list(tripId);
      setItinerary(iti || []);
      
      // Auto-center calendar on trip start month
      const start = new Date(data.start_date);
      setCurrentMonth(new Date(start.getFullYear(), start.getMonth(), 1));
      setSelectedDateStr(data.start_date);
    }
  };

  const handleTripChange = (tripId) => {
    if (!tripId) return;
    onSelectTrip(tripId);
    loadTripDetails(tripId);
  };

  // Quick add event from calendar modal
  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!eventName) return;

    await db.itinerary.add(activeTrip.id, {
      day_number: activeDayNum,
      start_time: eventTime,
      activity_name: eventName,
      duration_mins: 60,
      cost: Number(eventCost)
    });

    setEventName('');
    setEventCost('0');
    setShowAddForm(false);
    loadTripDetails(activeTrip.id);
  };

  const handleDeleteEvent = async (id) => {
    if (window.confirm("Remove this activity from calendar schedule?")) {
      await db.itinerary.delete(activeTrip.id, id);
      loadTripDetails(activeTrip.id);
    }
  };

  // Helper calendar calculations
  const getDaysInMonth = (date) => {
    const yr = date.getFullYear();
    const mo = date.getMonth();
    return new Date(yr, mo + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    const yr = date.getFullYear();
    const mo = date.getMonth();
    return new Date(yr, mo, 1).getDay(); // Sunday = 0
  };

  const handleMonthChange = (direction) => {
    const next = new Date(currentMonth);
    next.setMonth(next.getMonth() + (direction === 'prev' ? -1 : 1));
    setCurrentMonth(next);
  };

  // Check if date lies in active trip range
  const getDateTripInfo = (dStr) => {
    if (!activeTrip) return null;
    const sDate = new Date(activeTrip.start_date);
    const eDate = new Date(activeTrip.end_date);
    const curr = new Date(dStr);
    
    if (curr >= sDate && curr <= eDate) {
      // Calculate day number (1-indexed)
      const diffTime = Math.abs(curr - sDate);
      const dayNum = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return { dayNum };
    }
    return null;
  };

  const renderCells = () => {
    const daysCount = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const cells = [];

    // Fill blank cells for preceding month padding
    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`blank-${i}`} style={{ height: '110px', border: '1px solid var(--border)', opacity: 0.15 }}></div>);
    }

    // Fill days
    for (let day = 1; day <= daysCount; day++) {
      const year = currentMonth.getFullYear();
      const monthStr = String(currentMonth.getMonth() + 1).padStart(2, '0');
      const dayStr = String(day).padStart(2, '0');
      const dateStr = `${year}-${monthStr}-${dayStr}`;

      const tripInfo = getDateTripInfo(dateStr);
      const isSelected = selectedDateStr === dateStr;
      
      let hasWarning = false;
      let dayActivities = [];
      if (tripInfo) {
        dayActivities = itinerary.filter(item => item.day_number === tripInfo.dayNum);
        const dayCost = dayActivities.reduce((a, b) => a + Number(b.cost), 0);
        const expectedDailyLimit = activeTrip ? (activeTrip.budget / activeTrip.duration_days) : 0;
        if (dayCost > expectedDailyLimit) {
          hasWarning = true;
        }
      }

      cells.push(
        <div 
          key={day}
          onClick={() => {
            setSelectedDateStr(dateStr);
            if (tripInfo) {
              setActiveDayNum(tripInfo.dayNum);
              setDayDetailsModal(true);
            }
          }}
          style={{
            height: '110px',
            border: '1px solid var(--border)',
            padding: '8px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            transition: 'all 0.2s',
            // Colors matching request rules
            backgroundColor: isSelected 
              ? 'rgba(201, 79, 130, 0.15)'  // Selected: Magenta hint
              : tripInfo 
                ? 'rgba(72, 183, 176, 0.08)' // Travel days: Teal hint
                : 'transparent',
            borderColor: isSelected 
              ? 'var(--magenta)' 
              : hasWarning 
                ? 'var(--coral)' 
                : 'var(--border)'
          }}
          onMouseEnter={(e) => {
            if (!isSelected) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)';
          }}
          onMouseLeave={(e) => {
            if (!isSelected) e.currentTarget.style.borderColor = hasWarning ? 'var(--coral)' : 'var(--border)';
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ 
              fontFamily: 'var(--font-mono)', 
              fontSize: '0.85rem', 
              fontWeight: 'bold',
              color: isSelected 
                ? 'var(--magenta)' 
                : tripInfo 
                  ? 'var(--teal)' 
                  : 'var(--off-white)'
            }}>
              {day}
            </span>

            {tripInfo && (
              <span style={{ 
                fontFamily: 'var(--font-mono)', 
                fontSize: '0.55rem', 
                backgroundColor: 'rgba(72, 183, 176, 0.2)',
                color: 'var(--teal)',
                padding: '2px 4px',
                borderRadius: '3px'
              }}>
                DAY {tripInfo.dayNum}
              </span>
            )}
          </div>

          {/* Activities list inside cell */}
          <div style={{ flexGrow: 1, marginTop: '6px', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {dayActivities.slice(0, 2).map(act => (
              <div 
                key={act.id} 
                style={{
                  fontSize: '0.65rem',
                  color: 'var(--off-white)',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  padding: '2px 4px',
                  borderRadius: '2px'
                }}
              >
                {act.activity_name}
              </div>
            ))}
            {dayActivities.length > 2 && (
              <span style={{ fontSize: '0.6rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                + {dayActivities.length - 2} MORE //
              </span>
            )}
          </div>

          {/* Budget warning icon */}
          {hasWarning && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', color: 'var(--coral)' }}>
              <AlertTriangle size={11} />
            </div>
          )}
        </div>
      );
    }

    return cells;
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  // Selected day items
  const selectedTripInfo = getDateTripInfo(selectedDateStr);
  const selectedDayActivities = selectedTripInfo 
    ? itinerary.filter(item => item.day_number === selectedTripInfo.dayNum)
    : [];

  return (
    <div className="flex-col">
      {/* Header row */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--border)',
        paddingBottom: '20px'
      }}>
        <div>
          <span className="mono-text" style={{ color: 'var(--teal)' }}>JOURNAL_CALENDAR //</span>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', fontWeight: 800, marginTop: '4px' }}>
            Editorial Calendar
          </h1>
        </div>

        {/* Dropdown configure */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <label className="form-label" style={{ marginBottom: 0 }}>ACTIVE_TRIP:</label>
          <select 
            className="form-input" 
            style={{ width: '220px', height: '40px', padding: '0 12px' }}
            value={activeTrip?.id || ''}
            onChange={(e) => handleTripChange(e.target.value)}
          >
            {tripsList.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '2.5fr 1fr',
        gap: '30px'
      }}>
        {/* LEFT COLUMN: Calendar month grid */}
        <div className="editorial-card flex-col" style={{ gap: '20px' }}>
          {/* Calendar navigation */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 className="serif-title" style={{ fontSize: '1.6rem' }}>
              {monthNames[currentMonth.getMonth()].toUpperCase()} {currentMonth.getFullYear()}
            </h3>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-secondary" onClick={() => handleMonthChange('prev')} style={{ padding: '6px 12px' }}>
                Prev
              </button>
              <button className="btn btn-secondary" onClick={() => handleMonthChange('next')} style={{ padding: '6px 12px' }}>
                Next
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
            textAlign: 'center',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            color: 'var(--muted)',
            borderBottom: '1px solid var(--border)',
            paddingBottom: '8px'
          }}>
            <div>SUN</div>
            <div>MON</div>
            <div>TUE</div>
            <div>WED</div>
            <div>THU</div>
            <div>FRI</div>
            <div>SAT</div>
          </div>

          {/* Days cells */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
            gap: '6px'
          }}>
            {renderCells()}
          </div>
        </div>

        {/* RIGHT COLUMN: Daily events outline */}
        <div className="editorial-card dark flex-col">
          <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '14px' }}>
            <span className="form-label">SELECTED_DAY //</span>
            <h3 className="serif-title" style={{ fontSize: '1.4rem', marginTop: '4px' }}>
              {new Date(selectedDateStr).toLocaleDateString('en-US', {day: 'numeric', month: 'long', year: 'numeric'})}
            </h3>
            {selectedTripInfo && (
              <span style={{ 
                fontFamily: 'var(--font-mono)', 
                fontSize: '0.7rem', 
                color: 'var(--teal)', 
                marginTop: '4px',
                display: 'block'
              }}>
                TRIP DAY {selectedTripInfo.dayNum} IN {activeTrip.name.toUpperCase()}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {selectedDayActivities.map(act => (
              <div 
                key={act.id}
                style={{
                  padding: '12px 14px',
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--magenta)', fontWeight: 'bold' }}>
                    {act.start_time}
                  </span>
                  <button 
                    onClick={() => handleDeleteEvent(act.id)}
                    style={{ background: 'none', border: 'none', color: 'var(--coral)', cursor: 'pointer' }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
                <div style={{ fontWeight: 500, color: 'var(--off-white)', marginTop: '6px' }}>{act.activity_name}</div>
                {act.cost > 0 && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--mustard)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                    ₹{Number(act.cost).toLocaleString('en-IN')}
                  </div>
                )}
              </div>
            ))}

            {selectedDayActivities.length === 0 && (
              <p style={{ color: 'var(--muted)', fontSize: '0.85rem', textAlign: 'center', padding: '20px 0' }}>
                {selectedTripInfo ? 'No events scheduled for this day.' : 'Select a travel day cell (highlighted in teal) to view scheduled activities.'}
              </p>
            )}
          </div>

          {selectedTripInfo && !showAddForm && (
            <button className="btn btn-primary" onClick={() => setShowAddForm(true)} style={{ marginTop: '10px', justifyContent: 'center' }}>
              <Plus size={14} /> Add Event
            </button>
          )}

          {showAddForm && (
            <form onSubmit={handleAddEvent} className="flex-col" style={{ gap: '10px', marginTop: '10px', borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Event Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={eventName}
                  onChange={e => setEventName(e.target.value)}
                  placeholder="e.g. Dinner reservation"
                  required
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Time</label>
                  <input 
                    type="time" 
                    className="form-input" 
                    value={eventTime}
                    onChange={e => setEventTime(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Cost</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={eventCost}
                    onChange={e => setEventCost(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)} style={{ flex: 1, padding: '6px' }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '6px' }}>
                  Add
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
