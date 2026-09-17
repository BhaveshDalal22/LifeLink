import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { UserPlus, HeartPulse } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { ROLE_DASHBOARD_PATH } from '../../utils/constants';

const ROLE_OPTIONS = [
  { value: 'patient', label: 'Patient / User' },
  { value: 'hospital_staff', label: 'Hospital Staff' },
  { value: 'ambulance_driver', label: 'Ambulance Driver' }
];

export default function Register() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '', role: 'patient', phone: '', ambulanceNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      const { confirmPassword, ...payload } = form;
      const user = await register(payload);
      toast.success('Account created successfully!');
      navigate(ROLE_DASHBOARD_PATH[user.role] || '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
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
          <h1 className="mt-4 text-2xl font-bold text-slate-900">Create your LifeLink account</h1>
          <p className="mt-1 text-sm text-slate-500">Admin accounts are created by the platform administrator.</p>
        </div>

        <form onSubmit={handleSubmit} className="card mt-8 space-y-4">
          <div>
            <label className="label">I am registering as</label>
            <select className="input" value={form.role} onChange={update('role')}>
              {ROLE_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>

          <div>
            <label className="label">Full Name</label>
            <input required className="input" value={form.name} onChange={update('name')} placeholder="Your full name" />
          </div>

          <div>
            <label className="label">Email</label>
            <input type="email" required className="input" value={form.email} onChange={update('email')} placeholder="you@example.com" />
          </div>

          <div>
            <label className="label">Phone</label>
            <input className="input" value={form.phone} onChange={update('phone')} placeholder="10-digit mobile number" />
          </div>

          {form.role === 'ambulance_driver' && (
            <div>
              <label className="label">Ambulance Number (optional)</label>
              <input className="input" value={form.ambulanceNumber} onChange={update('ambulanceNumber')} placeholder="e.g. KA-01-AB-1234" />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Password</label>
              <input type="password" required className="input" value={form.password} onChange={update('password')} placeholder="••••••••" />
            </div>
            <div>
              <label className="label">Confirm Password</label>
              <input type="password" required className="input" value={form.confirmPassword} onChange={update('confirmPassword')} placeholder="••••••••" />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            <UserPlus size={18} /> {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          Already have an account? <Link to="/login" className="font-semibold text-brand-700">Login</Link>
        </p>
      </div>
    </div>
  );
}
