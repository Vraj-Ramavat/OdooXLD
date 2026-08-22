import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const INTRO_PHOTOS = [
  "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80", // Paris
  "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=600&q=80", // Rome
  "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=600&q=80", // Dubai
  "https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=600&q=80"  // Tokyo
];

export default function MotionIntro({ onComplete }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Check user preference for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      onComplete();
      return;
    }

    // Step-based sequence
    const timers = [
      setTimeout(() => setStep(1), 800),   // Coordinate appears
      setTimeout(() => setStep(2), 2200),  // Dot appears & route starts drawing
      setTimeout(() => setStep(3), 3600),  // Markers & names fade in
      setTimeout(() => setStep(4), 5000),  // Photographs flash
      setTimeout(() => setStep(5), 6200),  // Logo text emerges
      setTimeout(() => {
        // Complete intro
        localStorage.setItem('gt_intro_played', 'true');
        onComplete();
      }, 8200)
    ];

    return () => timers.forEach(t => clearTimeout(t));
  }, [onComplete]);

  // SVG coordinates for our route line: Ahmedabad -> Dubai -> Rome -> Paris
  // Canvas size: 800x400
  const pathD = "M 100 250 Q 250 150 400 200 T 700 150";

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#18191D',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      color: '#F3EEF1',
      fontFamily: "'DM Sans', sans-serif"
    }}>
      {/* Background Cinematic Photo Fade-in */}
      <AnimatePresence>
        {step >= 4 && step < 5 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.18 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '10px',
              padding: '10px',
              pointerEvents: 'none'
            }}
          >
            {INTRO_PHOTOS.map((src, i) => (
              <motion.img 
                key={i} 
                src={src} 
                alt="travel theme"
                initial={{ scale: 1.1, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ duration: 1.5, delay: i * 0.15 }}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '8px'
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skipping Control */}
      <div style={{
        position: 'absolute',
        top: '30px',
        right: '30px',
        zIndex: 10000
      }}>
        <button 
          onClick={onComplete}
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid #38373D',
            color: '#A8A2A8',
            fontFamily: "'Space Mono', monospace",
            fontSize: '0.75rem',
            padding: '6px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => { e.target.style.color = '#F3EEF1'; e.target.style.borderColor = '#C94F82'; }}
          onMouseLeave={(e) => { e.target.style.color = '#A8A2A8'; e.target.style.borderColor = '#38373D'; }}
        >
          SKIP_INTRO //
        </button>
      </div>

      {/* Step 1: Coordinates */}
      <AnimatePresence>
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8 }}
            style={{
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}
          >
            <span style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '1rem',
              color: '#C94F82',
              letterSpacing: '0.2em'
            }}>
              23.0225° N &nbsp; 72.5714° E
            </span>
            <span style={{
              fontSize: '0.8rem',
              color: '#A8A2A8',
              letterSpacing: '0.1em'
            }}>
              INITIALIZING TRAVEL PASS...
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step 2 & 3: Map route drawing */}
      <AnimatePresence>
        {step >= 2 && step <= 4 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'relative',
              width: '800px',
              height: '400px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <svg width="100%" height="100%" viewBox="0 0 800 400" style={{ position: 'absolute', top: 0, left: 0 }}>
              {/* The Route Path */}
              <motion.path
                d={pathD}
                fill="none"
                stroke="#E6B83D"
                strokeWidth="2"
                strokeDasharray="6, 6"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2.5, ease: "easeInOut" }}
              />

              {/* Airplane Icon Following Path */}
              <motion.g
                initial={{ offsetDistance: "0%" }}
                animate={{ offsetDistance: "100%" }}
                transition={{ duration: 2.5, ease: "easeInOut" }}
                style={{
                  motionPath: `path('${pathD}')`,
                  motionRotation: "auto"
                }}
              >
                {/* Custom Airplane SVG */}
                <path 
                  d="M-6,-6 L12,0 L-6,6 L-2,0 Z" 
                  fill="#F3EEF1" 
                  stroke="#C94F82" 
                  strokeWidth="1.5"
                />
              </motion.g>

              {/* Destination markers */}
              {step >= 3 && (
                <>
                  {/* Ahmedabad */}
                  <g transform="translate(100, 250)">
                    <circle r="5" fill="#C94F82" />
                    <circle r="9" fill="none" stroke="#C94F82" strokeWidth="1" opacity="0.6" />
                  </g>
                  {/* Dubai */}
                  <g transform="translate(245, 178)">
                    <circle r="5" fill="#48B7B0" />
                  </g>
                  {/* Rome */}
                  <g transform="translate(425, 195)">
                    <circle r="5" fill="#C94F82" />
                  </g>
                  {/* Paris */}
                  <g transform="translate(700, 150)">
                    <circle r="5" fill="#48B7B0" />
                    <circle r="9" fill="none" stroke="#48B7B0" strokeWidth="1" opacity="0.6" />
                  </g>
                </>
              )}
            </svg>

            {/* Labels overlay */}
            {step >= 3 && (
              <div style={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none' }}>
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  style={{ position: 'absolute', left: '70px', top: '265px', fontFamily: "'Space Mono', monospace", fontSize: '0.65rem' }}
                >
                  AHMEDABAD
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  style={{ position: 'absolute', left: '225px', top: '145px', fontFamily: "'Space Mono', monospace", fontSize: '0.65rem' }}
                >
                  DUBAI
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.4 }}
                  style={{ position: 'absolute', left: '410px', top: '215px', fontFamily: "'Space Mono', monospace", fontSize: '0.65rem' }}
                >
                  ROME
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2.0 }}
                  style={{ position: 'absolute', left: '685px', top: '115px', fontFamily: "'Space Mono', monospace", fontSize: '0.65rem' }}
                >
                  PARIS
                </motion.div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step 5: Large Editorial Title */}
      <AnimatePresence>
        {step >= 5 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            style={{
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '4.5rem',
              fontWeight: 900,
              letterSpacing: '0.08em',
              color: '#F3EEF1',
              textShadow: '0 4px 20px rgba(0,0,0,0.5)'
            }}>
              GLOBALTROTTER
            </h1>
            <h3 style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '0.9rem',
              color: '#C94F82',
              letterSpacing: '0.4em',
              textTransform: 'uppercase'
            }}>
              DIGITAL TRAVEL JOURNAL
            </h3>
            
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 140 }}
              transition={{ delay: 0.6, duration: 1 }}
              style={{
                height: '1.5px',
                backgroundColor: '#E6B83D',
                margin: '20px auto 0'
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
