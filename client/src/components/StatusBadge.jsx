import React from 'react';

// Generic badge - pass a `colorClass` from utils/statusColors.js
export default function StatusBadge({ label, colorClass }) {
  return <span className={`badge ${colorClass}`}>{label}</span>;
}
