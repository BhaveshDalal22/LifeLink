import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Siren, LocateFixed, MapPin } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useGeolocation } from '../../hooks/useGeolocation';
import { emergencyService } from '../../services/emergencyService';
import { EMERGENCY_TYPES, SEVERITY_LEVELS, REQUIRED_RESOURCES } from '../../utils/constants';
import MapView from '../../components/MapView';
import LocationPicker from '../../components/LocationPicker';
import HospitalCard from '../../components/HospitalCard';

export default function ReportEmergency() {
  const { user } = useAuth();
  const { location, hasLocation, status, requestLocation, setManualLocation } = useGeolocation();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    patientName: user?.name || '',
    emergencyType: 'Cardiac',
    severity: 'Critical',
    requiredResources: [],
    additionalInfo: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const toggleResource = (resource) => {
    setForm((f) => ({
      ...f,
      requiredResources: f.requiredResources.includes(resource)
        ? f.requiredResources.filter((r) => r !== resource)
        : [...f.requiredResources, resource]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.patientName || !form.emergencyType || !form.severity) {
      toast.error('Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await emergencyService.create({
        ...form,
        requiredResources: form.requiredResources.join(', '),
        latitude: location.lat,
        longitude: location.lng
      });
      toast.success('Emergency reported. Nearby hospitals found.');
      setResult(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to report emergency.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestHospital = async (hospital) => {
    try {
      await emergencyService.requestHospital({ emergencyId: result.emergency.emergency_id, hospitalId: hospital.hospital_id });
      toast.success(`Admission requested at ${hospital.name}.`);
      navigate(`/patient/tracking/${result.emergency.emergency_id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to request admission.');
    }
  };

  if (result) {
    return (
      <div className="space-y-6">
        <div className="card border-l-4 border-green-500">
          <h1 className="text-xl font-bold text-slate-900">Emergency Reported Successfully</h1>
          <p className="mt-1 text-sm text-slate-500">
            Emergency #{result.emergency.emergency_id} — {result.emergency.emergency_type} ({result.emergency.severity})
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button onClick={() => navigate(`/patient/tracking/${result.emergency.emergency_id}`)} className="btn-primary">
              Track This Emergency
            </button>
            <button onClick={() => navigate('/patient/request-ambulance', { state: { emergencyId: result.emergency.emergency_id } })} className="btn-secondary">
              Request Ambulance
            </button>
          </div>
        </div>

        <div>
          <h2 className="font-semibold text-slate-900">Recommended Hospitals</h2>
          <p className="mt-1 text-sm text-slate-500">Ranked by specialization match, resource availability, and distance.</p>
          <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
            {result.recommendedHospitals.map((h) => (
              <HospitalCard key={h.hospital_id} hospital={h} onRequest={handleRequestHospital} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emergency-500 text-white">
          <Siren size={22} />
        </span>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Report Emergency</h1>
          <p className="text-sm text-slate-500">Fill in the details below. All fields marked * are required.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card mt-6 space-y-5">
        <div>
          <label className="label">Patient Name *</label>
          <input required className="input" value={form.patientName} onChange={(e) => setForm({ ...form, patientName: e.target.value })} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Emergency Type *</label>
            <select className="input" value={form.emergencyType} onChange={(e) => setForm({ ...form, emergencyType: e.target.value })}>
              {EMERGENCY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Severity *</label>
            <select className="input" value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}>
              {SEVERITY_LEVELS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="label">Required Resources</label>
          <div className="flex flex-wrap gap-2">
            {REQUIRED_RESOURCES.map((r) => (
              <button
                type="button" key={r} onClick={() => toggleResource(r)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  form.requiredResources.includes(r)
                    ? 'border-brand-600 bg-brand-600 text-white'
                    : 'border-slate-300 bg-white text-slate-600 hover:border-brand-400'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="label mb-0">Patient Location *</label>
            <button type="button" onClick={requestLocation} className="flex items-center gap-1 text-xs font-medium text-brand-700">
              <LocateFixed size={14} /> {status === 'loading' ? 'Locating...' : 'Use my current location'}
            </button>
          </div>
          <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
            <MapPin size={12} /> {hasLocation ? 'Location set. Click the map to adjust it.' : 'Click on the map to set the patient location manually.'}
          </p>
          <div className="mt-2">
            <MapView center={location} zoom={hasLocation ? 14 : 12} height="300px">
              <LocationPicker position={location} onChange={({ lat, lng }) => setManualLocation(lat, lng)} />
            </MapView>
          </div>
        </div>

        <div>
          <label className="label">Additional Information</label>
          <textarea
            className="input" rows={3} value={form.additionalInfo}
            onChange={(e) => setForm({ ...form, additionalInfo: e.target.value })}
            placeholder="Anything hospital staff or the ambulance driver should know..."
          />
        </div>

        <button type="submit" disabled={submitting} className="btn-emergency w-full text-base py-3">
          {submitting ? 'Reporting...' : 'Report Emergency & Find Hospitals'}
        </button>
      </form>
    </div>
  );
}
