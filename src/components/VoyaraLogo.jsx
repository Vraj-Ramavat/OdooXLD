import React from 'react';

export default function VoyaraLogo({ size = 40, showWordmark = false, className = '', strokeWidth = 4, style = {} }) {
  return (
    <div 
      className={`voyara-logo-container ${className}`} 
      style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        gap: '12px', 
        verticalAlign: 'middle',
        ...style 
      }}
    >
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <defs>
          <linearGradient id="voyara-logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--magenta, #C94F82)" />
            <stop offset="50%" stopColor="var(--teal, #48B7B0)" />
            <stop offset="100%" stopColor="var(--mustard, #E6B83D)" />
          </linearGradient>
        </defs>

        {/* Outer dashed helper path showing the circular flow of the journey */}
        <path
          d="M 50 82 
             C 32 82, 18 68, 18 50 
             C 18 32, 32 18, 50 18 
             C 68 18, 82 32, 82 50 
             C 82 68, 68 82, 50 82 Z"
          stroke="url(#voyara-logo-grad)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          opacity="0.25"
        />

        {/* The elegant continuous flowing ribbon representing 'The Infinite Journey' */}
        <path
          d="M 50 78
             C 32 78, 22 62, 22 46
             C 22 28, 38 20, 50 20
             C 62 20, 78 28, 78 46
             C 78 62, 68 78, 50 78
             C 38 78, 28 66, 38 52
             C 45 42, 55 42, 62 52
             C 72 66, 62 78, 50 78"
          stroke="url(#voyara-logo-grad)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Start Point / Subtle destination node representing the end of a journey */}
        <circle cx="50" cy="78" r="4.5" fill="var(--mustard, #E6B83D)" />
        
        {/* Destination Node in the inner loop */}
        <circle cx="50" cy="50" r="3.5" fill="var(--magenta, #C94F82)" opacity="0.9" />
      </svg>

      {showWordmark && (
        <span 
          style={{
            fontFamily: "var(--font-sans), 'DM Sans', sans-serif",
            fontWeight: 700,
            fontSize: `${size * 0.45}px`,
            letterSpacing: '0.18em',
            color: 'var(--off-white)',
            textTransform: 'uppercase',
            lineHeight: 1,
            userSelect: 'none'
          }}
        >
          VOYARA
        </span>
      )}
    </div>
  );
}
