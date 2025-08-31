import React from 'react';

// Simple fade-in animation using CSS transitions
export function FadeIn({ children, duration = 400, style = {}, ...props }) {
  const fadeStyle = {
    animation: `fadeIn ${duration}ms ease`,
    ...style,
  };
  return (
    <div style={fadeStyle} {...props}>
      {children}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
