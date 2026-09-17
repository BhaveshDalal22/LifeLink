import React from 'react';

export default function StatCard({ icon: Icon, label, value, tone = 'brand' }) {
  const toneMap = {
    brand: 'bg-brand-50 text-brand-700',
    teal: 'bg-teal-50 text-teal-600',
    red: 'bg-red-50 text-red-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-700'
  };
  return (
    <div className="card flex items-center gap-4">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${toneMap[tone] || toneMap.brand}`}>
        {Icon && <Icon size={22} />}
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900 leading-none">{value}</p>
        <p className="mt-1 text-sm text-slate-500">{label}</p>
      </div>
    </div>
  );
}
