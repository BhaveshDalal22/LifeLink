import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Building2, Save } from 'lucide-react';
import { hospitalService } from '../../services/hospitalService';
import { SPECIALIZATIONS, BENGALURU_CENTER } from '../../utils/constants';
import MapView from '../../components/MapView';
import LocationPicker from '../../components/LocationPicker';

const CAPACITY_FIELDS = [
  { key: 'totalBeds', label: 'Total Beds' },
  { key: 'availableBeds', label: 'Available Beds' },
  { key: 'icuTotal', label: 'ICU Total' },
  { key: 'icuAvailable', label: 'ICU Available' },
  { key: 'emergencyBedsTotal', label: 'Emergency Beds Total' },
  { key: 'emergencyBedsAvailable', label: 'Emergency Beds Available' },
  { key: 'ventilatorsTotal', label: 'Ventilators Total' },
  { key: 'ventilatorsAvailable', label: 'Ventilators Available' }
];

export default function AddHospital() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', address: '', area: '', city: 'Bengaluru', state: 'Karnataka', contact: '',
    specializations: [],
    totalBeds: 0, availableBeds: 0, icuTotal: 0, icuAvailable: 0,
    emergencyBedsTotal: 0, emergencyBedsAvailable: 0, ventilatorsTotal: 0, ventilatorsAvailable: 0
  });
  const [position, setPosition] = useState(BENGALURU_CENTER);
  const [saving, setSaving] = useState(false);

  const toggleSpecialization = (s) => {
    setForm((f) => ({
      ...f,
      specializations: f.specializations.includes(s) ? f.specializations.filter((x) => x !== s) : [...f.specializations, s]
    }));
  };

  const validate = () => {
    if (!form.name || !form.address || !form.area || !form.contact) return 'Please fill in all required fields.';
    if (Number(form.availableBeds) > Number(form.totalBeds)) return 'Available beds cannot exceed total beds.';
    if (Number(form.icuAvailable) > Number(form.icuTotal)) return 'Available ICU beds cannot exceed total ICU beds.';
    if (Number(form.emergencyBedsAvailable) > Number(form.emergencyBedsTotal)) return 'Available emergency beds cannot exceed total emergency beds.';
    if (Number(form.ventilatorsAvailable) > Number(form.ventilatorsTotal)) return 'Available ventilators cannot exceed total ventilators.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validate();
    if (error) { toast.error(error); return; }
    setSaving(true);
    try {
      await hospitalService.create({ ...form, latitude: position.lat, longitude: position.lng });
      toast.success('Hospital added successfully.');
      navigate('/admin/hospitals');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add hospital.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white">
          <Building2 size={22} />
        </span>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Add Hospital</h1>
          <p className="text-sm text-slate-500">New hospitals are added unverified. Verify from Manage Hospitals.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card mt-6 space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label">Hospital Name *</label>
            <input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Address *</label>
            <input required className="input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
          <div>
            <label className="label">Area *</label>
            <input required className="input" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} />
          </div>
          <div>
            <label className="label">City</label>
            <input className="input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </div>
          <div>
            <label className="label">State</label>
            <input className="input" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
          </div>
          <div>
            <label className="label">Contact Number *</label>
            <input required className="input" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
          </div>
        </div>

        <div>
          <label className="label">Specializations</label>
          <div className="flex flex-wrap gap-2">
            {SPECIALIZATIONS.map((s) => (
              <button
                type="button" key={s} onClick={() => toggleSpecialization(s)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                  form.specializations.includes(s) ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-300 text-slate-600'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Location (click map to set latitude/longitude) *</label>
          <MapView center={position} zoom={12} height="280px">
            <LocationPicker position={position} onChange={setPosition} />
          </MapView>
          <p className="mt-1 text-xs text-slate-400">Selected: {position.lat.toFixed(5)}, {position.lng.toFixed(5)}</p>
        </div>

        <div>
          <p className="label mb-2">Capacity</p>
          <div className="grid grid-cols-2 gap-4">
            {CAPACITY_FIELDS.map((f) => (
              <div key={f.key}>
                <label className="text-xs text-slate-500">{f.label}</label>
                <input
                  type="number" min="0" className="input mt-1" value={form[f.key]}
                  onChange={(e) => setForm({ ...form, [f.key]: Number(e.target.value) })}
                />
              </div>
            ))}
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full">
          <Save size={16} /> {saving ? 'Saving...' : 'Add Hospital'}
        </button>
      </form>
    </div>
  );
}
