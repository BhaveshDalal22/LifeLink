// Centralized color mapping so badges look consistent across the whole app

export function hospitalStatusBadge(status) {
  const map = {
    Open: 'bg-green-100 text-green-700',
    'Limited Capacity': 'bg-yellow-100 text-yellow-800',
    Full: 'bg-red-100 text-red-700',
    'Temporarily Unavailable': 'bg-slate-200 text-slate-600'
  };
  return map[status] || 'bg-slate-100 text-slate-600';
}

export function availabilityColor(available, total) {
  if (total === 0 || available === 0) return 'text-red-600';
  const ratio = available / total;
  if (ratio <= 0.2) return 'text-yellow-600';
  return 'text-green-600';
}

export function availabilityDot(available, total) {
  if (total === 0 || available === 0) return 'bg-red-500';
  const ratio = available / total;
  if (ratio <= 0.2) return 'bg-yellow-500';
  return 'bg-green-500';
}

export function severityBadge(severity) {
  const map = {
    Critical: 'bg-red-100 text-red-700 border border-red-200',
    Serious: 'bg-orange-100 text-orange-700 border border-orange-200',
    Moderate: 'bg-yellow-100 text-yellow-700 border border-yellow-200'
  };
  return map[severity] || 'bg-slate-100 text-slate-600';
}

export function ambulanceStatusBadge(status) {
  const map = {
    Available: 'bg-green-100 text-green-700',
    Requested: 'bg-yellow-100 text-yellow-800',
    Assigned: 'bg-blue-100 text-blue-700',
    'On the Way': 'bg-blue-100 text-blue-700',
    Busy: 'bg-orange-100 text-orange-700',
    Offline: 'bg-slate-200 text-slate-600'
  };
  return map[status] || 'bg-slate-100 text-slate-600';
}

export function emergencyStatusBadge(status) {
  const map = {
    Reported: 'bg-slate-100 text-slate-700',
    'Hospital Search': 'bg-blue-100 text-blue-700',
    'Hospital Requested': 'bg-blue-100 text-blue-700',
    'Ambulance Requested': 'bg-yellow-100 text-yellow-800',
    'Ambulance Assigned': 'bg-yellow-100 text-yellow-800',
    'On the Way': 'bg-orange-100 text-orange-700',
    'Patient Picked Up': 'bg-orange-100 text-orange-700',
    'Hospital Confirmed': 'bg-teal-100 text-teal-700',
    Arrived: 'bg-teal-100 text-teal-700',
    Completed: 'bg-green-100 text-green-700',
    Cancelled: 'bg-red-100 text-red-700'
  };
  return map[status] || 'bg-slate-100 text-slate-600';
}

export function requestStatusBadge(status) {
  const map = {
    Pending: 'bg-yellow-100 text-yellow-800',
    Accepted: 'bg-green-100 text-green-700',
    Rejected: 'bg-red-100 text-red-700',
    Arrived: 'bg-teal-100 text-teal-700',
    Cancelled: 'bg-slate-200 text-slate-600'
  };
  return map[status] || 'bg-slate-100 text-slate-600';
}
