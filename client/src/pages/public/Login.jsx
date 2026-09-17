import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { LogIn, Mail, Lock, HeartPulse } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { ROLE_DASHBOARD_PATH } from '../../utils/constants';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(ROLE_DASHBOARD_PATH[user.role] || '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white">
            <HeartPulse size={24} />
          </span>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">Log in to LifeLink</h1>
          <p className="mt-1 text-sm text-slate-500">One login for patients, hospital staff, and ambulance drivers.</p>
        </div>

        <form onSubmit={handleSubmit} className="card mt-8 space-y-4">
          <div>
            <label className="label">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email" required className="input pl-9" placeholder="you@example.com"
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="label">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password" required className="input pl-9" placeholder="••••••••"
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            <LogIn size={18} /> {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          Don't have an account? <Link to="/register" className="font-semibold text-brand-700">Register</Link>
        </p>

        <div className="mt-6 rounded-lg border border-dashed border-slate-300 bg-white p-4 text-xs text-slate-500">
          <p className="font-semibold text-slate-700">Demo accounts (password: Demo@123)</p>
          <ul className="mt-1.5 space-y-0.5">
            <li>Patient — patient1@lifelink.com</li>
            <li>Hospital Staff — staff.yelahanka@lifelink.com</li>
            <li>Ambulance Driver — driver1@lifelink.com</li>
            <li>Admin — admin@lifelink.com</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
