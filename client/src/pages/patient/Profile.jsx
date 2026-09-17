import React from 'react';
import { User, Mail, Phone, Shield } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
      <div className="card mt-6">
        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-brand-700">
            <User size={28} />
          </span>
          <div>
            <p className="text-lg font-semibold text-slate-900">{user?.name}</p>
            <p className="text-sm capitalize text-slate-500">{user?.role?.replace('_', ' ')}</p>
          </div>
        </div>

        <dl className="mt-6 space-y-4 border-t border-slate-100 pt-6">
          <div className="flex items-center gap-3">
            <Mail size={16} className="text-slate-400" />
            <div>
              <dt className="text-xs text-slate-400">Email</dt>
              <dd className="text-sm font-medium text-slate-800">{user?.email}</dd>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone size={16} className="text-slate-400" />
            <div>
              <dt className="text-xs text-slate-400">Phone</dt>
              <dd className="text-sm font-medium text-slate-800">{user?.phone || '—'}</dd>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Shield size={16} className="text-slate-400" />
            <div>
              <dt className="text-xs text-slate-400">Account Role</dt>
              <dd className="text-sm font-medium capitalize text-slate-800">{user?.role?.replace('_', ' ')}</dd>
            </div>
          </div>
        </dl>
        <p className="mt-6 text-xs text-slate-400">Profile editing is not part of this demo version.</p>
      </div>
    </div>
  );
}
