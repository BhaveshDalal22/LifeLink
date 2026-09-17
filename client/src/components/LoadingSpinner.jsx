import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ label = 'Loading...', size = 20 }) {
  return (
    <div className="flex items-center justify-center gap-2 py-8 text-slate-500">
      <Loader2 size={size} className="animate-spin" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
