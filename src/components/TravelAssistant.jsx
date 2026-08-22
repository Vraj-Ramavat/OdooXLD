import React, { useState, useEffect, useRef } from 'react';
import { db } from '../db/supabaseClient';
import { Sparkles, Send, MapPin, Plus, TrendingUp } from 'lucide-react';

export default function TravelAssistant({ activeUser, onNavigate }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeTrip, setActiveTrip] = useState(null);
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadContext();
  }, [activeUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const loadContext = async () => {
    if (!activeUser) return;
    
    // Fetch user's active trip for context
    const { data: userTrips } = await db.trips.list(activeUser.id);
    if (userTrips && userTrips.length > 0) {
      // Pick first trip or the featured one
      setActiveTrip(userTrips.find(t => t.name.includes("European")) || userTrips[0]);
    }

    // Set initial greeting
    setMessages([
      {
        id: 'msg-initial',
        role: 'assistant',
        text: `Hi ${activeUser?.full_name?.split(' ')[0] || 'Alex'} 👋\n\nI'm your GlobalTrotter travel assistant.\n\nI can help you plan destinations, organize your itinerary, estimate expenses, discover activities, and optimize your trip.\n\nWhat are you planning next?`
      }
    ]);
  };

  const handleSend = async (textOverride = null) => {
    const text = textOverride || inputValue.trim();
    if (!text) return;

    // Add user message
    const userMsg = { id: `msg-u-${Date.now()}`, role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Mock network delay
    setTimeout(async () => {
      const responseMsg = await generateAssistantResponse(text);
      setIsTyping(false);
      setMessages(prev => [...prev, responseMsg]);
    }, 1200);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const generateAssistantResponse = async (query) => {
    const q = query.toLowerCase();
    let text = "I can definitely help with that. Could you provide a few more details about your preferences?";
    let action = null;

    if (q.includes('budget') || q.includes('cost') || q.includes('estimate') || q.includes('over budget')) {
      if (activeTrip) {
        const { data: expenses } = await db.expenses.list(activeTrip.id);
        const sum = (expenses || []).reduce((acc, curr) => acc + Number(curr.amount), 0);
        const remaining = activeTrip.budget - sum;
        text = `You're currently estimated at ₹${activeTrip.budget.toLocaleString('en-IN')} for the **${activeTrip.name}** trip.\n\nYour current recorded spending is ₹${sum.toLocaleString('en-IN')}, leaving approximately ₹${Math.max(0, remaining).toLocaleString('en-IN')}.`;
        if (sum > activeTrip.budget) {
          text += "\n\nWarning: You have exceeded your initial budget estimation.";
        }
        action = { label: 'View Budget Breakdown', icon: <TrendingUp size={14} />, route: 'budget' };
      } else {
        text = "I don't see an active trip with a budget yet. Would you like to create one and set your financial preferences?";
        action = { label: 'Plan New Trip', icon: <Plus size={14} />, route: 'create-trip' };
      }
    } 
    else if (q.includes('itinerary') || q.includes('plan a day') || q.includes('empty')) {
      text = "Looking at your schedule, your Day 3 is quite empty. Would you like to add some activities or local spots to fill the gap?";
      action = { label: '+ Add Activity', icon: <Plus size={14} />, route: 'itinerary-builder' };
    }
    else if (q.includes('destination') || q.includes('hotel') || q.includes('find activities')) {
      text = "I recommend exploring the catalog. There are highly-rated experiences and accommodations curated specifically for this region.";
      action = { label: 'Explore Cities', icon: <MapPin size={14} />, route: 'explore-cities' };
    }
    else if (q.includes('plan my trip')) {
      text = "Let's start drafting a new journey. Where are you dreaming of going?";
      action = { label: 'Start Planning', icon: <Plus size={14} />, route: 'create-trip' };
    }

    return {
      id: `msg-a-${Date.now()}`,
      role: 'assistant',
      text,
      action
    };
  };

  const quickPrompts = [
    "Plan my trip",
    "Find destinations",
    "Optimize my itinerary",
    "Estimate my budget",
    "Find activities",
    "Suggest hotels",
    "Plan a day"
  ];

  return (
    <div className="flex-col" style={{ height: 'calc(100vh - 80px)' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--border)',
        paddingBottom: '20px'
      }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Sparkles size={32} style={{ color: 'var(--magenta)' }} />
            TRAVEL ASSISTANT
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.95rem', marginTop: '4px' }}>
            Your personal travel companion for planning better journeys.
          </p>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.75rem',
          color: 'var(--teal)',
          border: '1px solid rgba(72, 183, 176, 0.3)',
          backgroundColor: 'rgba(72, 183, 176, 0.05)',
          padding: '6px 12px',
          borderRadius: '20px'
        }}>
          <span style={{ fontSize: '1.2rem', lineHeight: 0.5 }}>●</span> ONLINE
        </div>
      </div>

      {/* Main Chat Panel */}
      <div className="editorial-card dark flex-col" style={{ 
        flexGrow: 1, 
        padding: '24px', 
        overflow: 'hidden', 
        display: 'flex', 
        flexDirection: 'column',
        position: 'relative'
      }}>
        
        {/* Chat History Container */}
        <div style={{ 
          flexGrow: 1, 
          overflowY: 'auto', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '24px', 
          paddingRight: '12px',
          paddingBottom: '20px'
        }} className="custom-scrollbar">
          
          <div style={{ textAlign: 'center', margin: '10px 0 30px' }}>
            <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: 'var(--off-white)' }}>
              GLOBALTROTTER <br />
              <span style={{ color: 'var(--magenta)' }}>TRAVEL ASSISTANT</span>
            </h4>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--muted)', letterSpacing: '0.1em' }}>
              Ask me anything about your journey.
            </span>
          </div>

          {messages.map((msg) => (
            <div key={msg.id} style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              width: '100%'
            }}>
              <div style={{
                maxWidth: '75%',
                display: 'flex',
                gap: '12px',
                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row'
              }}>
                {msg.role === 'assistant' && (
                  <div style={{ 
                    width: '32px', height: '32px', 
                    borderRadius: '50%', 
                    backgroundColor: 'rgba(72, 183, 176, 0.1)',
                    border: '1px solid var(--teal)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Sparkles size={14} style={{ color: 'var(--teal)' }} />
                  </div>
                )}
                
                <div style={{
                  padding: '16px 20px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: msg.role === 'user' ? 'var(--magenta)' : 'var(--card-dark)',
                  border: msg.role === 'user' ? 'none' : '1px solid var(--border)',
                  color: msg.role === 'user' ? '#ffffff' : 'var(--off-white)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.95rem',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap',
                  boxShadow: msg.role === 'assistant' ? '0 4px 20px rgba(0,0,0,0.1)' : '0 4px 12px rgba(201,79,130,0.25)'
                }}>
                  {msg.text}

                  {msg.action && (
                    <div style={{ marginTop: '16px' }}>
                      <button 
                        className="btn btn-secondary" 
                        onClick={() => onNavigate(msg.action.route)}
                        style={{ 
                          fontSize: '0.8rem', 
                          padding: '8px 16px',
                          border: '1px solid var(--teal)',
                          color: 'var(--teal)'
                        }}
                      >
                        {msg.action.icon}
                        {msg.action.label}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div style={{ display: 'flex', justifyContent: 'flex-start', width: '100%' }}>
              <div style={{
                display: 'flex',
                gap: '12px'
              }}>
                <div style={{ 
                  width: '32px', height: '32px', 
                  borderRadius: '50%', 
                  backgroundColor: 'rgba(72, 183, 176, 0.1)',
                  border: '1px solid var(--teal)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Sparkles size={14} style={{ color: 'var(--teal)' }} />
                </div>
                
                <div style={{
                  padding: '12px 20px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--card-dark)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--muted)', letterSpacing: '0.05em' }}>
                    TRAVEL_ASSISTANT thinking...
                  </span>
                  <div className="typing-indicator">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Prompts under the first message */}
          {messages.length === 1 && (
            <div style={{ 
              display: 'flex', 
              gap: '10px', 
              flexWrap: 'wrap', 
              marginTop: '10px',
              marginLeft: '44px' 
            }}>
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  className="btn btn-secondary"
                  onClick={() => handleSend(prompt)}
                  style={{
                    fontSize: '0.75rem',
                    padding: '8px 16px',
                    backgroundColor: 'var(--bg)',
                    borderRadius: '20px'
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Section */}
        <div style={{ 
          marginTop: '20px',
          paddingTop: '20px',
          borderTop: '1px solid var(--border)' 
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: '12px',
            backgroundColor: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '12px'
          }}>
            <textarea 
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your trip..."
              className="form-input"
              style={{
                flexGrow: 1,
                border: 'none',
                backgroundColor: 'transparent',
                resize: 'none',
                minHeight: '48px',
                maxHeight: '120px',
                padding: '0',
                outline: 'none',
                lineHeight: '1.5'
              }}
            />
            <button 
              className="btn"
              disabled={!inputValue.trim()}
              onClick={() => handleSend()}
              style={{
                backgroundColor: inputValue.trim() ? 'var(--magenta)' : 'var(--border)',
                color: '#fff',
                padding: '12px',
                borderRadius: '50%',
                flexShrink: 0,
                width: '44px',
                height: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: inputValue.trim() ? 1 : 0.5,
                transition: 'var(--transition-fast)'
              }}
            >
              <Send size={18} style={{ transform: 'translateX(-1px)' }} />
            </button>
          </div>
          <div style={{ 
            fontFamily: 'var(--font-mono)', 
            fontSize: '0.65rem', 
            color: 'var(--muted)', 
            textAlign: 'center',
            marginTop: '8px'
          }}>
            Press Enter to send, Shift + Enter for new line. AI can make mistakes. Check important info.
          </div>
        </div>

      </div>
      
      {/* Typing Indicator CSS Animation */}
      <style>{`
        .typing-indicator { display: flex; gap: 4px; align-items: center; }
        .typing-indicator span {
          width: 4px; height: 4px; border-radius: 50%; background-color: var(--teal);
          animation: bounce 1.4s infinite ease-in-out both;
        }
        .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
        .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
