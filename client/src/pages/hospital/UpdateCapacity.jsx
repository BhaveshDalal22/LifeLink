import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { ClipboardList, Save } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { hospitalService } from '../../services/hospitalService';
import LoadingSpinner from '../../components/LoadingSpinner';

const FIELDS = [
  { key: 'totalBeds', label: 'Total Beds', pairKey: 'availableBeds' },
  { key: 'availableBeds', label: 'Available Beds' },
  { key: 'icuTotal', label: 'ICU Total', pairKey: 'icuAvailable' },
  { key: 'icuAvailable', label: 'ICU Available' },
  { key: 'emergencyBedsTotal', label: 'Emergency Beds Total', pairKey: 'emergencyBedsAvailable' },
  { key: 'emergencyBedsAvailable', label: 'Emergency Beds Available' },
  { key: 'ventilatorsTotal', label: 'Ventilators Total', pairKey: 'ventilatorsAvailable' },
  { key: 'ventilatorsAvailable', label: 'Ventilators Available' }
];

const CAMEL_TO_SNAKE = {
  totalBeds: 'total_beds', availableBeds: 'available_beds',
  icuTotal: 'icu_total', icuAvailable: 'icu_available',
  emergencyBedsTotal: 'emergency_beds_total', emergencyBedsAvailable: 'emergency_beds_available',
  ventilatorsTotal: 'ventilators_total', ventilatorsAvailable: 'ventilators_available'
};

export default function UpdateCapacity() {
  const { user } = useAuth();
  const hospitalId = user?.hospital_id || null;
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!hospitalId) { setLoading(false); return; }
    hospitalService.getById(hospitalId).then((res) => {
      const h = res.data.hospital;
      setForm(
        Object.fromEntries(Object.entries(CAMEL_TO_SNAKE).map(([camel, snake]) => [camel, h[snake] ?? 0]))
      );
    }).finally(() => setLoading(false));
  }, [hospitalId]);

  const handleChange = (key, value) => {
    setForm((f) => ({ ...f, [key]: Number(value) }));
  };

  const validate = () => {
    if (form.availableBeds > form.totalBeds) return 'Available beds cannot exceed total beds.';
    if (form.icuAvailable > form.icuTotal) return 'Available ICU beds cannot exceed total ICU beds.';
    if (form.emergencyBedsAvailable > form.emergencyBedsTotal) return 'Available emergency beds cannot exceed total emergency beds.';
    if (form.ventilatorsAvailable > form.ventilatorsTotal) return 'Available ventilators cannot exceed total ventilators.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validate();
    if (error) { toast.error(error); return; }
    setSaving(true);
    try {
      await hospitalService.updateCapacity(hospitalId, form);
      toast.success('Capacity updated successfully.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update capacity.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner label="Loading capacity data..." />;
  if (!hospitalId || !form) return <p className="text-slate-500">No hospital linked to your account.</p>;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white">
          <ClipboardList size={22} />
        </span>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Update Hospital Capacity</h1>
          <p className="text-sm text-slate-500">Available resources cannot exceed total resources.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card mt-6 space-y-6">
        {[0, 2, 4, 6].map((startIdx) => (
          <div key={startIdx} className="grid grid-cols-2 gap-4">
            {FIELDS.slice(startIdx, startIdx + 2).map((f) => (
              <div key={f.key}>
                <label className="label">{f.label}</label>
                <input
                  type="number" min="0" className="input" value={form[f.key]}
                  onChange={(e) => handleChange(f.key, e.target.value)}
                />
              </div>
            ))}
          </div>
        ))}

        <button type="submit" disabled={saving} className="btn-primary w-full">
          <Save size={16} /> {saving ? 'Saving...' : 'Save Capacity'}
        </button>
      </form>
    </div>
  );
}
