import React, { useState } from 'react';

export function StarRatingInput({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;

  return (
    <div className="stars" role="group" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`star ${display >= star ? 'filled' : ''}`}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          role="button"
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onChange(star)}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export function StarDisplay({ value, showNumber = true }) {
  const filled = Math.round(parseFloat(value) || 0);
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <span className="star-display">
        {'★'.repeat(filled)}
        <span style={{ opacity: 0.25 }}>{'★'.repeat(5 - filled)}</span>
      </span>
      {showNumber && value && (
        <span style={{ fontSize: 13, color: '#6b7280', marginLeft: 2 }}>
          {parseFloat(value).toFixed(1)}
        </span>
      )}
    </span>
  );
}
