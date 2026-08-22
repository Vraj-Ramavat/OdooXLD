import React, { useEffect, useState } from 'react';
import { db } from '../db/supabaseClient';
import { TrendingUp, AlertTriangle, HelpCircle, DollarSign, Calendar, Plus, Trash2 } from 'lucide-react';

export default function BudgetPage({ activeUser, selectedTripId, onSelectTrip }) {
  const [tripsList, setTripsList] = useState([]);
  const [trip, setTrip] = useState(null);
  
  // Expenses and calculations
  const [expenses, setExpenses] = useState([]);
  const [itinerary, setItinerary] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form states for adding custom expenses
  const [category, setCategory] = useState('Transport');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    loadTrips();
  }, [activeUser]);

  useEffect(() => {
    if (selectedTripId) {
      loadTripDetails(selectedTripId);
    } else {
      setTrip(null);
      setExpenses([]);
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
      const { data: expList } = await db.expenses.list(tripId);
      setExpenses(expList || []);
      const { data: itiList } = await db.itinerary.list(tripId);
      setItinerary(itiList || []);
      setDate(data.start_date); // default to start date
    }
    setLoading(false);
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    await db.expenses.add(trip.id, {
      category,
      amount: Number(amount),
      description: description || `${category} Expense`,
      date: date || trip.start_date
    });

    setAmount('');
    setDescription('');
    loadTripDetails(trip.id);
  };

  const handleDeleteExpense = async (id) => {
    if (window.confirm("Delete this expense record?")) {
      await db.expenses.delete(id);
      loadTripDetails(trip.id);
    }
  };

  // 1. Math calculations
  const totalBudget = trip ? Number(trip.budget) : 145000;
  const totalSpent = expenses.reduce((a, b) => a + Number(b.amount), 0);
  const remaining = Math.max(0, totalBudget - totalSpent);
  const averageSpentPerDay = trip ? Math.round(totalSpent / trip.duration_days) : 0;
  const expectedDailyBudget = trip ? Math.round(totalBudget / trip.duration_days) : 0;

  // Category grouping
  const groupExpensesByCategory = () => {
    const cats = { Transport: 0, Stay: 0, Activities: 0, Food: 0, Other: 0 };
    expenses.forEach(e => {
      const c = e.category || 'Other';
      const parsedCat = c === 'Meals' ? 'Food' : c === 'Accommodation' ? 'Stay' : c;
      if (cats[parsedCat] !== undefined) {
        cats[parsedCat] += Number(e.amount);
      } else {
        cats.Other += Number(e.amount);
      }
    });
    return cats;
  };

  const catExpenses = groupExpensesByCategory();
  const maxCatValue = Math.max(...Object.values(catExpenses)) || 1;

  // Group itinerary activity cost per day (warnings check)
  const getDailyActivitiesCost = () => {
    const dailyCosts = {};
    itinerary.forEach(item => {
      dailyCosts[item.day_number] = (dailyCosts[item.day_number] || 0) + Number(item.cost);
    });
    return dailyCosts;
  };

  const dailyCostsMap = getDailyActivitiesCost();

  // Find days that are over-budget (exceed expected daily average budget)
  const getOverBudgetDays = () => {
    const overs = [];
    if (!trip) return overs;

    for (let day = 1; day <= trip.duration_days; day++) {
      const cost = dailyCostsMap[day] || 0;
      if (cost > expectedDailyBudget) {
        const pctOver = Math.round(((cost - expectedDailyBudget) / expectedDailyBudget) * 100);
        overs.push({
          dayNum: day,
          cost,
          pctOver
        });
      }
    }
    return overs;
  };

  const overBudgetDays = getOverBudgetDays();

  // Donut SVG Render helper
  const renderDonut = () => {
    const colors = ['#C94F82', '#48B7B0', '#E6B83D', '#E87970', '#A8A2A8'];
    const radius = 35;
    const circ = 2 * Math.PI * radius; // ~219.9
    let accumulatedPercent = 0;
    const totalVal = Object.values(catExpenses).reduce((a, b) => a + b, 0) || 1;

    return (
      <svg width="180" height="180" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="transparent" stroke="#38373D" strokeWidth="10" />
        {Object.keys(catExpenses).map((cat, idx) => {
          const val = catExpenses[cat];
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
              stroke={colors[idx % colors.length]}
              strokeWidth="10"
              strokeDasharray={`${strokeLength} ${circ}`}
              strokeDashoffset={strokeOffset}
              transform="rotate(-90 50 50)"
              style={{ transition: 'stroke-dasharray 0.5s ease' }}
            />
          );
        })}
        <text x="50%" y="46%" dominantBaseline="middle" textAnchor="middle" fill="#A8A2A8" fontSize="5" fontFamily="'Space Mono', monospace">
          TOTAL_SPENT
        </text>
        <text x="50%" y="58%" dominantBaseline="middle" textAnchor="middle" fill="#F3EEF1" fontSize="8" fontWeight="bold" fontFamily="'Space Mono', monospace">
          {`₹${Math.round(totalSpent / 1000)}k`}
        </text>
      </svg>
    );
  };

  return (
    <div className="flex-col">
      {/* Title Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--border)',
        paddingBottom: '20px'
      }}>
        <div>
          <span className="mono-text" style={{ color: 'var(--mustard)' }}>LEDGER_INDEX //</span>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', fontWeight: 800, marginTop: '4px' }}>
            Trip Budget: {trip ? trip.name : 'Select Journey'}
          </h1>
        </div>

        {/* Selector dropdown */}
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
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
          CALCULATING_EXPENDITURE // LOADING
        </div>
      ) : trip ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '30px'
        }}>
          {/* LEFT CHART & LEDGER LAYOUT */}
          <div className="flex-col" style={{ gap: '30px' }}>
            
            {/* Top Overview Cards row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <div className="editorial-card dark">
                <span className="form-label">TOTAL LIMIT</span>
                <div style={{ fontSize: '1.8rem', fontWeight: 'bold', fontFamily: 'var(--font-mono)', color: 'var(--off-white)', marginTop: '4px' }}>
                  ₹{totalBudget.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="editorial-card dark" style={{ borderLeft: '3px solid var(--magenta)' }}>
                <span className="form-label">SPENT TO DATE</span>
                <div style={{ fontSize: '1.8rem', fontWeight: 'bold', fontFamily: 'var(--font-mono)', color: 'var(--magenta)', marginTop: '4px' }}>
                  ₹{totalSpent.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="editorial-card dark" style={{ borderLeft: '3px solid var(--teal)' }}>
                <span className="form-label">REMAINING FUNDS</span>
                <div style={{ fontSize: '1.8rem', fontWeight: 'bold', fontFamily: 'var(--font-mono)', color: 'var(--teal)', marginTop: '4px' }}>
                  ₹{remaining.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Donut & Vertical Bar Chart side by side */}
            <div className="editorial-card" style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '30px', alignItems: 'center' }}>
              {/* Donut column */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', borderRight: '1px solid var(--border)', paddingRight: '20px' }}>
                {renderDonut()}
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}>
                  {Object.keys(catExpenses).map((cat, idx) => {
                    const colors = ['var(--magenta)', 'var(--teal)', 'var(--mustard)', 'var(--coral)', 'var(--muted)'];
                    return (
                      <div key={cat} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: colors[idx] }}></span>
                          <span style={{ color: 'var(--muted)' }}>{cat}</span>
                        </div>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>
                          ₹{catExpenses[cat].toLocaleString('en-IN')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bar Chart column */}
              <div className="flex-col" style={{ gap: '14px' }}>
                <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--muted)', letterSpacing: '0.05em' }}>
                  CATEGORY_BREAKDOWN_BARS
                </h4>
                {Object.keys(catExpenses).map((cat, idx) => {
                  const colors = ['var(--magenta)', 'var(--teal)', 'var(--mustard)', 'var(--coral)', 'var(--muted)'];
                  const pct = Math.max(5, Math.round((catExpenses[cat] / maxCatValue) * 100));

                  return (
                    <div key={cat} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                        <span>{cat}</span>
                        <span style={{ fontFamily: 'var(--font-mono)' }}>
                          ₹{catExpenses[cat].toLocaleString('en-IN')}
                        </span>
                      </div>
                      
                      {/* Bar fill */}
                      <div style={{ height: '8px', backgroundColor: 'var(--primary-dark)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%',
                          width: `${pct}%`,
                          backgroundColor: colors[idx],
                          transition: 'width 0.6s ease'
                        }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Daily spending chart - simple chronological list with visual height bars */}
            <div className="editorial-card">
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', marginBottom: '14px' }}>Daily Activity Cost Bar Graph</h3>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                height: '180px',
                padding: '10px 20px',
                backgroundColor: 'var(--primary-dark)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)'
              }}>
                {Array.from({ length: trip.duration_days }).map((_, idx) => {
                  const dayNum = idx + 1;
                  const cost = dailyCostsMap[dayNum] || 0;
                  const maxCostLimit = expectedDailyBudget * 2; // scale factor
                  const heightPct = Math.max(8, Math.min(100, Math.round((cost / maxCostLimit) * 100)));
                  const overLimit = cost > expectedDailyBudget;

                  return (
                    <div 
                      key={dayNum} 
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '8px',
                        flexGrow: 1
                      }}
                    >
                      <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: overLimit ? 'var(--coral)' : 'var(--muted)' }}>
                        ₹{Math.round(cost / 100) / 10}k
                      </span>
                      
                      {/* Vertical Bar */}
                      <div style={{
                        height: '100px',
                        width: '24px',
                        backgroundColor: 'var(--card)',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'flex-end',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: '100%',
                          height: `${heightPct}%`,
                          backgroundColor: overLimit ? 'var(--coral)' : 'var(--teal)',
                          transition: 'height 0.4s'
                        }}></div>
                      </div>

                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 'bold' }}>
                        D{dayNum}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Expense logs list */}
            <div className="editorial-card">
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: '14px' }}>Transaction Ledger</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {expenses.map(e => (
                  <div 
                    key={e.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 16px',
                      backgroundColor: 'var(--primary-dark)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{e.description}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '2px', display: 'flex', gap: '10px' }}>
                        <span>{e.date}</span>
                        <span>•</span>
                        <span>{e.category.toUpperCase()}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold', color: 'var(--off-white)' }}>
                        ₹{Number(e.amount).toLocaleString('en-IN')}
                      </span>
                      <button 
                        onClick={() => handleDeleteExpense(e.id)}
                        style={{ background: 'none', border: 'none', color: 'var(--coral)', cursor: 'pointer' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}

                {expenses.length === 0 && (
                  <p style={{ color: 'var(--muted)', fontSize: '0.85rem', textAlign: 'center', padding: '16px 0' }}>
                    No manual expense records filed yet.
                  </p>
                )}
              </div>
            </div>

          </div>

          {/* RIGHT SIDE PANEL: WARNINGS & ADD EXPENSE FORM */}
          <div className="flex-col">
            
            {/* OVER BUDGET WARNING PANEL */}
            <div className="editorial-card dark" style={{ borderLeft: '3px solid var(--coral)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--coral)' }}>
                <AlertTriangle size={18} />
                <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                  BUDGET_ALERTS //
                </h4>
              </div>
              
              <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {overBudgetDays.map(item => (
                  <div key={item.dayNum} style={{
                    fontSize: '0.8rem',
                    backgroundColor: 'rgba(232, 121, 112, 0.05)',
                    border: '1px solid rgba(232, 121, 112, 0.15)',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--off-white)'
                  }}>
                    <strong>DAY {String(item.dayNum).padStart(2, '0')}</strong>: {item.pctOver}% OVER BUDGET
                    <div style={{ color: 'var(--coral)', fontSize: '0.7rem', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                      Spent: ₹{item.cost.toLocaleString('en-IN')} / Daily limit: ₹{expectedDailyBudget.toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}

                {overBudgetDays.length === 0 && (
                  <p style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>
                    All days currently pacing within daily budget estimates.
                  </p>
                )}
              </div>
            </div>

            {/* ADD TRANSACTION FORM */}
            <div className="editorial-card dark">
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', marginBottom: '14px' }}>Log Expense</h3>
              
              <form onSubmit={handleAddExpense} className="flex-col" style={{ gap: '12px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Category</label>
                  <select 
                    className="form-input" 
                    value={category} 
                    onChange={e => setCategory(e.target.value)}
                    style={{ backgroundColor: 'var(--card)' }}
                  >
                    <option value="Transport">Transport</option>
                    <option value="Stay">Stay</option>
                    <option value="Activities">Activities</option>
                    <option value="Food">Food / Meals</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Amount (INR)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="₹ 0.00"
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Description</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="e.g. Flight ticket"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Date</label>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={date}
                    onChange={e => setDate(e.target.value)}
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '42px', justifyContent: 'center', marginTop: '6px' }}>
                  <Plus size={14} /> File Expense
                </button>
              </form>
            </div>

            {/* FINANCIAL STATS */}
            <div className="editorial-card dark">
              <span className="form-label">STATS DETAIL</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem', marginTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--muted)' }}>Average/Day spent:</span>
                  <strong style={{ color: 'var(--off-white)' }}>₹{averageSpentPerDay.toLocaleString('en-IN')}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--muted)' }}>Est. Daily target:</span>
                  <strong style={{ color: 'var(--off-white)' }}>₹{expectedDailyBudget.toLocaleString('en-IN')}</strong>
                </div>
              </div>
            </div>

          </div>
        </div>
      ) : (
        <div className="editorial-card" style={{ padding: '60px', textAlign: 'center' }}>
          <HelpCircle size={36} style={{ color: 'var(--muted)', marginBottom: '14px' }} />
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', marginBottom: '6px' }}>
            No Active Trip Selected
          </h3>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
            Choose one of your active logs from the selector menu to inspect budget metrics.
          </p>
        </div>
      )}
    </div>
  );
}
