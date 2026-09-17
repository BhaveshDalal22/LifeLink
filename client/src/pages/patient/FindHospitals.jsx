import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { LocateFixed, Filter } from 'lucide-react';
import { hospitalService } from '../../services/hospitalService';
import { emergencyService } from '../../services/emergencyService';
import { useGeolocation } from '../../hooks/useGeolocation';
import { EMERGENCY_TYPES, SPECIALIZATIONS, HOSPITAL_STATUSES } from '../../utils/constants';
import HospitalCard from '../../components/HospitalCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import MapView, { Marker, Popup, hospitalIcon, ICONS } from '../../components/MapView';

const DEFAULT_FILTERS = {
  emergencyType: '', specialization: '', maxDistance: '', status: '',
  icuOnly: false, emergencyBedOnly: false, ventilatorOnly: false
};

export default function FindHospitals() {
  const { location, hasLocation, requestLocation, status: geoStatus } = useGeolocation();
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [activeEmergencyId, setActiveEmergencyId] = useState(null);

  useEffect(() => {
    emergencyService.getAll().then((res) => {
      const active = res.data.emergencies.find((e) => !['Completed', 'Cancelled'].includes(e.status));
      if (active) setActiveEmergencyId(active.emergency_id);
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    hospitalService
      .getNearby({ lat: location.lat, lng: location.lng, type: filters.emergencyType || undefined, maxDistance: filters.maxDistance || undefined })
      .then((res) => setHospitals(res.data.hospitals))
      .catch(() => toast.error('Could not load hospitals.'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.lat, location.lng, filters.emergencyType, filters.maxDistance]);

  const filtered = hospitals.filter((h) => {
    if (filters.specialization && !h.specializations.includes(filters.specialization)) return false;
    if (filters.status && h.status !== filters.status) return false;
    if (filters.icuOnly && h.icu_available === 0) return false;
    if (filters.emergencyBedOnly && h.emergency_beds_available === 0) return false;
    if (filters.ventilatorOnly && h.ventilators_available === 0) return false;
    return true;
  });

  const handleRequest = async (hospital) => {
    if (!activeEmergencyId) {
      toast.error('Report an emergency first to request admission.');
      return;
    }
    try {
      await emergencyService.requestHospital({ emergencyId: activeEmergencyId, hospitalId: hospital.hospital_id });
      toast.success(`Admission requested at ${hospital.name}.`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to request admission.');
    }
  };

  const handleDirections = (hospital) => {
    window.open(`https://www.openstreetmap.org/directions?to=${hospital.latitude}%2C${hospital.longitude}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Find Nearby Hospitals</h1>
          <p className="mt-1 text-sm text-slate-500">Filter by specialization, resources, and distance.</p>
        </div>
        <button onClick={requestLocation} className="btn-secondary">
          <LocateFixed size={16} /> {geoStatus === 'loading' ? 'Locating...' : hasLocation ? 'Location set' : 'Use my location'}
        </button>
      </div>

      <div className="card">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Filter size={16} /> Filters
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="label">Emergency Type</label>
            <select className="input" value={filters.emergencyType} onChange={(e) => setFilters({ ...filters, emergencyType: e.target.value })}>
              <option value="">Any</option>
              {EMERGENCY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Specialization</label>
            <select className="input" value={filters.specialization} onChange={(e) => setFilters({ ...filters, specialization: e.target.value })}>
              <option value="">Any</option>
              {SPECIALIZATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Hospital Status</label>
            <select className="input" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
              <option value="">Any</option>
              {HOSPITAL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Max Distance (km)</label>
            <input type="number" min="1" className="input" placeholder="e.g. 15" value={filters.maxDistance}
              onChange={(e) => setFilters({ ...filters, maxDistance: e.target.value })} />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={filters.icuOnly} onChange={(e) => setFilters({ ...filters, icuOnly: e.target.checked })} />
            ICU available
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={filters.emergencyBedOnly} onChange={(e) => setFilters({ ...filters, emergencyBedOnly: e.target.checked })} />
            Emergency bed available
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={filters.ventilatorOnly} onChange={(e) => setFilters({ ...filters, ventilatorOnly: e.target.checked })} />
            Ventilator available
          </label>
          <button className="text-brand-700 font-medium" onClick={() => setFilters(DEFAULT_FILTERS)}>Reset filters</button>
        </div>
      </div>

      <MapView center={location} zoom={11}>
        <Marker position={[location.lat, location.lng]} icon={ICONS.patient}><Popup>Your location</Popup></Marker>
        {filtered.map((h) => (
          <Marker key={h.hospital_id} position={[h.latitude, h.longitude]} icon={hospitalIcon(h.status)}>
            <Popup>
              <p className="font-semibold">{h.name}</p>
              <p className="text-xs">Beds: {h.available_beds}/{h.total_beds} · {h.distanceKm} km</p>
            </Popup>
          </Marker>
        ))}
      </MapView>

      {loading ? (
        <LoadingSpinner label="Finding hospitals..." />
      ) : filtered.length === 0 ? (
        <EmptyState title="No hospitals match your filters" message="Try relaxing a filter or increasing max distance." />
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((h) => (
            <HospitalCard key={h.hospital_id} hospital={h} onRequest={handleRequest} onDirections={handleDirections} />
          ))}
        </div>
      )}
    </div>
  );
}
