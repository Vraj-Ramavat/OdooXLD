import React, { useEffect, useState } from 'react';
import { db } from '../db/supabaseClient';
import { 
  Compass, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Bell, 
  Search, 
  Plus, 
  BookOpen, 
  TrendingUp, 
  Sparkles,
  ArrowRight,
  ChevronRight,
  Star
} from 'lucide-react';

export default function Dashboard({ 
  activeUser, 
  onNavigate, 
  onSelectTrip 
}) {
  const [featuredTrip, setFeaturedTrip] = useState(null);
  const [upcomingTrips, setUpcomingTrips] = useState([]);
  const [stats, setStats] = useState({
    cities: 12,
    countries: 7,
    days: 38,
    spent: 245000
  });
  const [popularDests, setPopularDests] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Budget breakdown for donut chart (live computed)
  const [budgetSummary, setBudgetSummary] = useState({
    total: 145000,
    spent: 85000,
    remaining: 60000,
    breakdown: {
      Transport: 35000,
      Stay: 25000,
      Activities: 15000,
      Food: 8000,
      Other: 2000
    }
  });

  useEffect(() => {
    loadDashboardData();
  }, [activeUser]);

  const loadDashboardData = async () => {
    if (!activeUser) return;
    
    // 1. Fetch user trips
    const { data: userTrips } = await db.trips.list(activeUser.id);
    if (userTrips && userTrips.length > 0) {
      // Find featured trip (e.g., 'European Explorer' or first trip)
      const featured = userTrips.find(t => t.name.includes("European Explorer")) || userTrips[0];
      
      // Load detailed info for featured trip
      const { data: detailed } = await db.trips.get(featured.id);
      setFeaturedTrip(detailed);

      // Remaining trips as upcoming
      const remaining = userTrips.filter(t => t.id !== featured.id);
      setUpcomingTrips(remaining.slice(0, 3));

      // Calculate dynamic budget details for featured trip
      const { data: expenses } = await db.expenses.list(featured.id);
      if (expenses && expenses.length > 0) {
        const sum = expenses.reduce((acc, curr) => acc + Number(curr.amount), 0);
        const categories = expenses.reduce((acc, curr) => {
          const cat = curr.category || 'Other';
          acc[cat] = (acc[cat] || 0) + Number(curr.amount);
          return acc;
        }, { Transport: 0, Stay: 0, Activities: 0, Food: 0, Other: 0 });

        setBudgetSummary({
          total: featured.budget,
          spent: sum,
          remaining: Math.max(0, featured.budget - sum),
          breakdown: categories
        });
      } else {
        // Fallback defaults
        setBudgetSummary({
          total: featured.budget,
          spent: 85000,
          remaining: featured.budget - 85000,
          breakdown: { Transport: 45000, Stay: 20000, Activities: 10000, Food: 8000, Other: 2000 }
        });
      }
    }

    // 2. Fetch popular destinations
    const { data: dests } = await db.destinations.list();
    if (dests) {
      // Filter list down to popular
      setPopularDests(dests.filter(d => ['Paris', 'Santorini', 'Tokyo', 'Bali'].includes(d.name)));
    }

    // 3. Fetch activity timeline logs
    const { data: logs } = await db.timeline.list();
    if (logs) {
      setActivityLogs(logs);
    }

    // 4. Update stats summary
    if (activeUser.cities_visited) {
      setStats({
        cities: activeUser.cities_visited,
        countries: activeUser.countries_visited,
        days: activeUser.days_traveled,
        spent: activeUser.total_spent
      });
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    onNavigate('explore-cities');
  };

  // Helper to draw clean inline SVG Donut Chart
  const renderDonutChart = () => {
    const { breakdown, spent } = budgetSummary;
    const cats = Object.keys(breakdown);
    const colors = ['#C94F82', '#48B7B0', '#E6B83D', '#E87970', '#A8A2A8'];
    
    let totalVal = Object.values(breakdown).reduce((a, b) => a + b, 0) || 1;
    let accumulatedPercent = 0;
    
    // Circle math
    const radius = 35;
    const circ = 2 * Math.PI * radius; // ~219.9
    
    return (
      <svg width="140" height="140" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="transparent" stroke="#38373D" strokeWidth="12" />
        {cats.map((cat, index) => {
          const val = breakdown[cat] || 0;
          const pct = val / totalVal;
          const strokeLength = pct * circ;
          const strokeOffset = circ - (accumulatedPercent * circ);
          accumulatedPercent += pct;

          if (strokeLength <= 0) return null;

          return (
            <circle
              key={cat}
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke={colors[index % colors.length]}
              strokeWidth="12"
              strokeDasharray={`${strokeLength} ${circ}`}
              strokeDashoffset={strokeOffset}
              transform="rotate(-90 50 50)"
              style={{ transition: 'stroke-dasharray 0.5s ease' }}
            />
          );
        })}
        {/* Center Text label */}
        <text x="50%" y="46%" dominantBaseline="middle" textAnchor="middle" fill="#A8A2A8" fontSize="6" fontFamily="'Space Mono', monospace">
          SPENT
        </text>
        <text x="50%" y="58%" dominantBaseline="middle" textAnchor="middle" fill="#F3EEF1" fontSize="9" fontWeight="bold" fontFamily="'Space Mono', monospace">
          {`₹${Math.round(spent / 1000)}k`}
        </text>
      </svg>
    );
  };

  return (
    <div className="flex-col">
      {/* Top Header Row */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--border)',
        paddingBottom: '20px'
      }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', fontWeight: 800 }}>
            Good morning, {activeUser?.full_name?.split(' ')[0] || 'Alex'} 👋
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.95rem', marginTop: '4px' }}>
            Where will your next adventure take you?
          </p>
        </div>

        {/* Search bar & Alert info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <form onSubmit={handleSearch} style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '14px', top: '13px', color: 'var(--muted)' }} />
            <input 
              type="text" 
              placeholder="Search destinations, trips..." 
              className="form-input"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ 
                width: '260px', 
                height: '42px',
                paddingLeft: '40px', 
                backgroundColor: 'var(--primary-dark)' 
              }}
            />
          </form>
          <div style={{
            width: '42px',
            height: '42px',
            backgroundColor: 'var(--primary-dark)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            position: 'relative'
          }} onClick={() => onNavigate('settings')}>
            <Bell size={18} style={{ color: 'var(--off-white)' }} />
            <span style={{
              position: 'absolute',
              top: '11px',
              right: '11px',
              width: '6px',
              height: '6px',
              backgroundColor: 'var(--magenta)',
              borderRadius: '50%'
            }}></span>
          </div>
        </div>
      </div>

      {/* Main Double Column Grid */}
      <div className="dashboard-grid">
        {/* LEFT COMPONENT COLUMN */}
        <div className="flex-col">
          
          {/* FEATURED TRIP PANEL */}
          {featuredTrip ? (
            <div className="featured-trip-hero">
              <img 
                src={featuredTrip.cover_image} 
                alt={featuredTrip.name} 
                className="featured-trip-img"
              />
              <div className="featured-trip-overlay">
                <div className="hero-left-content">
                  <span className="hero-tag">YOUR NEXT JOURNEY</span>
                  <h2 className="hero-title">{featuredTrip.name}</h2>
                  
                  <div className="hero-route">
                    {featuredTrip.destinations && featuredTrip.destinations.map((dest, idx) => (
                      <React.Fragment key={dest.id}>
                        {idx > 0 && <span>→</span>}
                        {dest.name}
                      </React.Fragment>
                    ))}
                  </div>

                  <div className="hero-meta-row">
                    <div>
                      DATES: <strong>{new Date(featuredTrip.start_date).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})} — {new Date(featuredTrip.end_date).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}</strong>
                    </div>
                    <div>
                      DURATION: <strong>{featuredTrip.duration_days} Days</strong>
                    </div>
                    <div>
                      EST. BUDGET: <strong>₹{Number(featuredTrip.budget).toLocaleString('en-IN')}</strong>
                    </div>
                  </div>

                  <div className="hero-buttons">
                    <button 
                      className="btn btn-primary"
                      onClick={() => {
                        onSelectTrip(featuredTrip.id);
                        onNavigate('itinerary-view');
                      }}
                    >
                      <BookOpen size={16} />
                      View Itinerary
                    </button>
                    <button 
                      className="btn btn-secondary"
                      onClick={() => {
                        onSelectTrip(featuredTrip.id);
                        onNavigate('itinerary-builder');
                      }}
                    >
                      Continue Planning
                    </button>
                  </div>
                </div>

                {/* Dotted travel route overlays */}
                {featuredTrip.destinations && featuredTrip.destinations.length > 0 && (
                  <div className="hero-route-map">
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--muted)', letterSpacing: '0.1em', marginBottom: '4px' }}>
                      ROUTE_TRACK
                    </div>
                    {featuredTrip.destinations.map((dest) => (
                      <div key={dest.id} className="route-stop">
                        <div className="route-dot"></div>
                        <span className="route-name">{dest.name.toUpperCase()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="editorial-card" style={{ padding: '40px', textAlign: 'center' }}>
              <Sparkles size={32} style={{ color: 'var(--magenta)', marginBottom: '16px' }} />
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', marginBottom: '10px' }}>No Journeys Outlined Yet</h2>
              <p style={{ color: 'var(--muted)', marginBottom: '24px' }}>Every grand explorer starts with a blank sheet. Outline your path now.</p>
              <button className="btn btn-primary" onClick={() => onNavigate('create-trip')}>
                <Plus size={16} />
                Plan New Trip
              </button>
            </div>
          )}

          {/* TRAVEL STATS BAR */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            <div className="editorial-card dark" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ color: 'var(--magenta)' }}><Compass size={22} /></div>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--muted)' }}>CITIES VISITED</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: 'bold' }}>{stats.cities}</div>
              </div>
            </div>
            <div className="editorial-card dark" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ color: 'var(--teal)' }}><MapPin size={22} /></div>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--muted)' }}>COUNTRIES</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: 'bold' }}>{stats.countries}</div>
              </div>
            </div>
            <div className="editorial-card dark" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ color: 'var(--mustard)' }}><Calendar size={22} /></div>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--muted)' }}>DAYS TRAVELED</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: 'bold' }}>{stats.days}</div>
              </div>
            </div>
            <div className="editorial-card dark" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ color: 'var(--coral)' }}><DollarSign size={22} /></div>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--muted)' }}>TOTAL SPENT</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 'bold' }}>₹{stats.spent.toLocaleString('en-IN')}</div>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT METRICS & ACTIVITY COLUMN */}
        <div className="flex-col">
          
          {/* QUICK ACTIONS PANEL */}
          <div className="editorial-card dark">
            <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--muted)', letterSpacing: '0.1em', marginBottom: '14px' }}>
              QUICK_ACTIONS //
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button 
                className="btn" 
                onClick={() => onNavigate('create-trip')}
                style={{ backgroundColor: 'var(--magenta)', color: '#fff', fontSize: '0.8rem', padding: '12px' }}
              >
                Plan New Trip
              </button>
              <button 
                className="btn" 
                onClick={() => onNavigate('explore-cities')}
                style={{ backgroundColor: 'var(--teal)', color: 'var(--bg)', fontSize: '0.8rem', padding: '12px' }}
              >
                Explore Cities
              </button>
              <button 
                className="btn" 
                onClick={() => onNavigate('explore-activities')}
                style={{ backgroundColor: 'var(--mustard)', color: 'var(--bg)', fontSize: '0.8rem', padding: '12px' }}
              >
                Find Activities
              </button>
              <button 
                className="btn" 
                onClick={() => onNavigate('calendar')}
                style={{ backgroundColor: 'var(--coral)', color: 'var(--bg)', fontSize: '0.8rem', padding: '12px' }}
              >
                View Calendar
              </button>
            </div>
          </div>

          {/* BUDGET OVERVIEW CARD */}
          <div className="editorial-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>BUDGET OVERVIEW</h4>
                <div style={{ fontSize: '1.8rem', fontWeight: 'bold', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                  ₹{budgetSummary.total.toLocaleString('en-IN')}
                </div>
              </div>
              <TrendingUp size={20} style={{ color: 'var(--magenta)' }} />
            </div>

            {/* Donut chart layout */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', margin: '20px 0' }}>
              {renderDonutChart()}
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexGrow: 1 }}>
                {Object.keys(budgetSummary.breakdown).map((cat, idx) => {
                  const colors = ['var(--magenta)', 'var(--teal)', 'var(--mustard)', 'var(--coral)', 'var(--muted)'];
                  return (
                    <div key={cat} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: colors[idx] }}></span>
                        <span style={{ color: 'var(--muted)' }}>{cat}</span>
                      </div>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>
                        ₹{(budgetSummary.breakdown[cat] || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              borderTop: '1px solid var(--border)',
              paddingTop: '16px',
              marginTop: '10px'
            }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>SPENT</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', fontFamily: 'var(--font-mono)', color: 'var(--magenta)' }}>
                  ₹{budgetSummary.spent.toLocaleString('en-IN')}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>REMAINING</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', fontFamily: 'var(--font-mono)', color: 'var(--teal)' }}>
                  ₹{budgetSummary.remaining.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* FULL WIDTH LOWER SECTION */}
      <div className="flex-col" style={{ gap: '30px', marginTop: '30px' }}>
        
        {/* POPULAR DESTINATIONS HORIZONTAL GRID */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: 700 }}>Popular Destinations</h3>
              <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Explore top destinations around the world</p>
            </div>
            <a 
              onClick={() => onNavigate('explore-cities')}
              style={{ 
                color: 'var(--teal)', 
                fontSize: '0.85rem', 
                fontFamily: 'var(--font-mono)', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '4px',
                cursor: 'pointer'
              }}
            >
              DISCOVER_MORE <ChevronRight size={14} />
            </a>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '16px'
          }}>
            {popularDests.map((dest) => (
              <div 
                key={dest.id} 
                className="editorial-card"
                style={{
                  padding: 0,
                  height: '240px',
                  cursor: 'pointer'
                }}
                onClick={() => onNavigate('explore-cities')}
              >
                <img 
                  src={dest.image_url} 
                  alt={dest.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.65)' }} 
                />
                {/* Photo overlays */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  zIndex: 2
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <span style={{
                      backgroundColor: 'rgba(24, 25, 29, 0.75)',
                      border: '1px solid var(--border)',
                      color: 'var(--mustard)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.65rem',
                      padding: '3px 6px',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px'
                    }}>
                      <Star size={10} fill="var(--mustard)" stroke="none" />
                      {dest.popularity}
                    </span>
                  </div>
                  <div>
                    <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: 'var(--off-white)' }}>{dest.name}</h4>
                    <p style={{ color: 'var(--muted)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                      {dest.country.toUpperCase()}
                    </p>
                    <div style={{ 
                      color: 'var(--off-white)', 
                      fontFamily: 'var(--font-mono)', 
                      fontSize: '0.75rem', 
                      marginTop: '8px',
                      borderTop: '1px solid rgba(255,255,255,0.1)',
                      paddingTop: '6px'
                    }}>
                      ₹{dest.cost_index * 3000} / DAY
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* UPCOMING TRIPS LIST (TEAL-ACCENTED) */}
        <div className="editorial-card dark" style={{ borderLeft: '3px solid var(--teal)' }}>
          <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--muted)', letterSpacing: '0.1em', marginBottom: '16px' }}>
            UPCOMING_TRIPS //
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {upcomingTrips.map(trip => (
              <div 
                key={trip.id} 
                style={{ display: 'flex', gap: '12px', cursor: 'pointer', alignItems: 'center' }}
                onClick={() => {
                  onSelectTrip(trip.id);
                  onNavigate('itinerary-view');
                }}
              >
                <img 
                  src={trip.cover_image} 
                  alt={trip.name} 
                  style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border)' }} 
                />
                <div style={{ flexGrow: 1 }}>
                  <h5 style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--off-white)' }}>{trip.name}</h5>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px', fontSize: '0.75rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                    <span>{new Date(trip.start_date).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})}</span>
                    <span>{trip.duration_days || 8} DAYS</span>
                  </div>
                </div>
              </div>
            ))}
            
            {upcomingTrips.length === 0 && (
              <div style={{ fontSize: '0.8rem', color: 'var(--muted)', textAlign: 'center', padding: '10px 0' }}>
                No other upcoming journeys scheduled.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
