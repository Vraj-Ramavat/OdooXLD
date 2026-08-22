import React, { useEffect, useState } from 'react';
import { db } from '../db/supabaseClient';
import { Heart, Share2, Copy, Eye, BookOpen, Star, Sparkles, Check } from 'lucide-react';

export default function CommunityPage({ activeUser, onNavigate, onSelectTrip, onSetSharedToken }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likedPosts, setLikedPosts] = useState({});
  const [successMsg, setSuccessMsg] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    loadCommunityPosts();
  }, [activeUser]);

  const loadCommunityPosts = async () => {
    setLoading(true);
    const { data } = await db.community.list();
    if (data) {
      setPosts(data);
    }
    setLoading(false);
  };

  const handleLike = (postId) => {
    setLikedPosts(prev => {
      const isLiked = !prev[postId];
      // Increment/decrement likes count locally
      setPosts(current => current.map(p => {
        if (p.id === postId) {
          return { ...p, likes: p.likes + (isLiked ? 1 : -1) };
        }
        return p;
      }));
      return { ...prev, [postId]: isLiked };
    });
  };

  const handleCopyLink = (postId) => {
    const url = `${window.location.origin}${window.location.pathname}#shared/${postId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(postId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCloneTrip = async (postId, tripName) => {
    if (!activeUser) {
      alert("Please log in first to copy this journey!");
      return;
    }

    setLoading(true);
    const { data, error } = await db.community.clone(postId, activeUser.id);
    setLoading(false);

    if (error) {
      alert("Error cloning itinerary records");
    } else {
      setSuccessMsg(`"${tripName}" successfully cloned! Check "My Trips" to customize it.`);
      // Reload timeline logs in background
      db.timeline.list();
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  };

  return (
    <div className="flex-col">
      {/* Editorial Header */}
      <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '20px' }}>
        <span className="mono-text" style={{ color: 'var(--magenta)' }}>MAGAZINE_FEED // ISSUE_04</span>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '3rem', fontWeight: 900, marginTop: '4px', letterSpacing: '0.02em' }}>
          Journeys Worth Sharing
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '1rem', marginTop: '4px', fontStyle: 'italic' }}>
          Slow-travel chronicles, curated pathways, and notes from global documentarians.
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
          CLONED_JOURNEY // {successMsg}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
          SYNCHRONIZING_COMMUNITY_CHRONICLES // LOADING
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          
          {/* Featured Spread (Large photograph-driven card layout) */}
          {posts.length > 0 && (
            <div className="featured-trip-hero" style={{ height: '480px' }}>
              <img 
                src={posts[0].cover_image} 
                alt={posts[0].name} 
                style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.35)' }} 
              />
              <div className="featured-trip-overlay" style={{ padding: '50px' }}>
                <div style={{ maxWidth: '65%' }}>
                  <span className="hero-tag" style={{ color: 'var(--mustard)' }}>★ FEATURED JOURNAL SPREAD</span>
                  <h2 className="hero-title" style={{ fontSize: '3.6rem' }}>{posts[0].name}</h2>
                  
                  <p style={{ color: 'var(--muted)', fontSize: '0.95rem', fontFamily: 'var(--font-mono)', marginBottom: '14px' }}>
                    CHARTED_BY: {posts[0].author.toUpperCase()} // DATES: {posts[0].dates.toUpperCase()}
                  </p>

                  <div className="hero-route" style={{ fontSize: '1.1rem' }}>
                    {posts[0].cities.join(' → ')}
                  </div>

                  <div style={{ display: 'flex', gap: '14px', marginTop: '24px' }}>
                    <button 
                      className="btn btn-primary"
                      onClick={() => {
                        onSetSharedToken(posts[0].id);
                        onNavigate('shared-trip');
                      }}
                    >
                      <BookOpen size={16} /> Read Chronicles
                    </button>
                    <button 
                      className="btn btn-secondary"
                      onClick={() => handleCloneTrip(posts[0].id, posts[0].name)}
                    >
                      <Copy size={14} /> Copy This Journey
                    </button>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  gap: '12px'
                }}>
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.85rem',
                    color: 'var(--off-white)',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--border)',
                    padding: '8px 14px',
                    borderRadius: '4px'
                  }}>
                    BUDGET: ₹{posts[0].budget.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Grid Layout of other Magazine Cards */}
          <div className="grid-cols-3">
            {posts.slice(1).map(post => (
              <div 
                key={post.id}
                className="editorial-card"
                style={{
                  padding: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  height: '420px',
                  backgroundColor: 'var(--card)'
                }}
              >
                {/* Image top */}
                <div style={{ height: '200px', relative: 'position', overflow: 'hidden' }}>
                  <img 
                    src={post.cover_image} 
                    alt={post.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.65)' }} 
                  />
                  
                  {/* Author Widget Overlay */}
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: 'rgba(24,25,29,0.8)',
                    padding: '6px 10px',
                    borderRadius: '20px',
                    border: '1px solid var(--border)'
                  }}>
                    <img 
                      src={post.author_avatar} 
                      alt={post.author} 
                      style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover' }} 
                    />
                    <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--off-white)' }}>{post.author}</span>
                  </div>

                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    backgroundColor: 'rgba(24,25,29,0.85)',
                    border: '1px solid var(--border)',
                    color: 'var(--mustard)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.65rem',
                    padding: '4px 8px',
                    borderRadius: '4px'
                  }}>
                    {post.duration} DAYS
                  </div>
                </div>

                {/* Info Center */}
                <div style={{ padding: '20px', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3 className="serif-title" style={{ fontSize: '1.35rem', color: 'var(--off-white)' }}>
                      {post.name}
                    </h3>
                    
                    <p style={{ color: 'var(--muted)', fontSize: '0.75rem', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                      DATES // {post.dates.toUpperCase()}
                    </p>

                    <div style={{ color: 'var(--teal)', fontSize: '0.8rem', marginTop: '10px', fontWeight: 500 }}>
                      {post.cities.join(' → ')}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid var(--border)',
                    paddingTop: '12px',
                    marginTop: '12px'
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.6rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>EST_BUDGET</span>
                      <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--mustard)' }}>
                        ₹{post.budget.toLocaleString('en-IN')}
                      </strong>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      {/* Read shared view */}
                      <button 
                        className="btn" 
                        onClick={() => {
                          onSetSharedToken(post.id);
                          onNavigate('shared-trip');
                        }}
                        style={{ padding: '6px 10px', backgroundColor: 'var(--primary-dark)', border: '1px solid var(--border)' }}
                        title="View Public Spread"
                      >
                        <Eye size={13} style={{ color: 'var(--teal)' }} />
                      </button>

                      {/* Clone */}
                      <button 
                        className="btn" 
                        onClick={() => handleCloneTrip(post.id, post.name)}
                        style={{ padding: '6px 10px', backgroundColor: 'var(--primary-dark)', border: '1px solid var(--border)' }}
                        title="Copy Itinerary"
                      >
                        <Copy size={13} style={{ color: 'var(--mustard)' }} />
                      </button>

                      {/* Like */}
                      <button 
                        className="btn" 
                        onClick={() => handleLike(post.id)}
                        style={{ padding: '6px 10px', backgroundColor: 'var(--primary-dark)', border: '1px solid var(--border)' }}
                      >
                        <Heart size={13} fill={likedPosts[post.id] ? 'var(--coral)' : 'none'} style={{ color: likedPosts[post.id] ? 'var(--coral)' : 'var(--muted)' }} />
                        <span style={{ fontSize: '0.7rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginLeft: '3px' }}>{post.likes}</span>
                      </button>

                      {/* Share link copy */}
                      <button 
                        className="btn" 
                        onClick={() => handleCopyLink(post.id)}
                        style={{ padding: '6px 10px', backgroundColor: 'var(--primary-dark)', border: '1px solid var(--border)' }}
                      >
                        {copiedId === post.id ? <Check size={13} style={{ color: 'var(--teal)' }} /> : <Share2 size={13} style={{ color: 'var(--magenta)' }} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}
    </div>
  );
}
