import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { LocateFixed, Search } from 'lucide-react';
import { hospitalService } from '../../services/hospitalService';
import { useGeolocation } from '../../hooks/useGeolocation';
import HospitalCard from '../../components/HospitalCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import MapView, { Marker, Popup, hospitalIcon, ICONS } from '../../components/MapView';

export default function FindHospitalPublic() {
  const { location, hasLocation, requestLocation, status } = useGeolocation();
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadHospitals = (loc) => {
    setLoading(true);
    hospitalService
      .getNearby({ lat: loc.lat, lng: loc.lng })
      .then((res) => setHospitals(res.data.hospitals))
      .catch(() => toast.error('Could not load hospitals.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadHospitals(location);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.lat, location.lng]);

  const filtered = hospitals.filter((h) =>
    h.name.toLowerCase().includes(search.toLowerCase()) || h.area.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Find a Hospital</h1>
          <p className="mt-1 text-sm text-slate-500">
            Browse verified demo hospitals in Bengaluru. <Link to="/login" className="text-brand-700 font-medium">Log in</Link> to
            request admission or an ambulance.
          </p>
        </div>
        <button onClick={requestLocation} className="btn-secondary">
          <LocateFixed size={16} /> {status === 'loading' ? 'Locating...' : hasLocation ? 'Location set' : 'Use my location'}
        </button>
      </div>

      <div className="relative mt-6 max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          className="input pl-9" placeholder="Search by hospital name or area"
          value={search} onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="mt-6">
        <MapView center={location} zoom={11}>
          <Marker position={[location.lat, location.lng]} icon={ICONS.patient}>
            <Popup>Your approximate location</Popup>
          </Marker>
          {filtered.map((h) => (
            <Marker key={h.hospital_id} position={[h.latitude, h.longitude]} icon={hospitalIcon(h.status)}>
              <Popup>
                <p className="font-semibold">{h.name}</p>
                <p className="text-xs">Beds: {h.available_beds}/{h.total_beds}</p>
                <p className="text-xs">{h.distanceKm} km away</p>
              </Popup>
            </Marker>
          ))}
        </MapView>
      </div>

      <div className="mt-8">
        {loading ? (
          <LoadingSpinner label="Finding hospitals near you..." />
        ) : filtered.length === 0 ? (
          <EmptyState title="No hospitals found" message="Try adjusting your search or resetting your location." />
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((h) => <HospitalCard key={h.hospital_id} hospital={h} />)}
          </div>
        )}
      </div>
    </div>
  );
}
