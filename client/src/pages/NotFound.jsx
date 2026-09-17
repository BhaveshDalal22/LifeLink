import React from 'react';
import { Link } from 'react-router-dom';
import { HeartPulse } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 px-4 text-center">
      <HeartPulse className="text-brand-600" size={40} />
      <h1 className="text-3xl font-bold text-slate-900">404 - Page Not Found</h1>
      <p className="text-slate-500">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn-primary mt-2">Back to Home</Link>
    </div>
  );
}
