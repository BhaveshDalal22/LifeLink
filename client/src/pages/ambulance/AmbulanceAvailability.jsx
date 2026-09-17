import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { ToggleLeft, ToggleRight, LocateFixed } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { ambulanceService } from '../../services/ambulanceService';
import { useGeolocation } from '../../hooks/useGeolocation';
import LoadingSpinner from '../../components/LoadingSpinner';
import MapView, { Marker, Popup, ICONS } from '../../components/MapView';

export default function AmbulanceAvailability() {
  const { user } = useAuth();
  const { location, hasLocation, requestLocation, status: geoStatus } = useGeolocation();
  const [ambulance, setAmbulance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const load = () => {
    ambulanceService.getAll().then((res) => {
      setAmbulance(res.data.ambulances.find((a) => a.ambulance_id === user?.ambulance_id) || null);
    }).finally(() => setLoading(false));
  };

  useEffect(load, [user]);

  const toggleAvailability = async () => {
    if (!ambulance) return;
    const nextStatus = ambulance.status === 'Offline' ? 'Available' : 'Offline';
    setUpdating(true);
    try {
      await ambulanceService.updateStatus(ambulance.ambulance_id, nextStatus);
      toast.success(`Marked ${nextStatus}.`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update availability.');
    } finally {
      setUpdating(false);
    }
  };

  const syncLocation = async () => {
    requestLocation();
  };

  useEffect(() => {
    if (hasLocation && ambulance) {
      ambulanceService.updateLocation(ambulance.ambulance_id, location.lat, location.lng).then(load).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasLocation]);

  if (loading) return <LoadingSpinner label="Loading availability..." />;
  if (!ambulance) return <p className="text-slate-500">No ambulance linked to your account.</p>;

  const canGoOnline = ['Offline', 'Available'].includes(ambulance.status);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Ambulance Availability</h1>
        <p className="mt-1 text-sm text-slate-500">Toggle whether your ambulance can receive new requests.</p>
      </div>

      <div className="card flex items-center justify-between">
        <div>
          <p className="font-semibold text-slate-900">{ambulance.ambulance_number}</p>
          <p className="text-sm text-slate-500">Current status: {ambulance.status}</p>
        </div>
        <button
          onClick={toggleAvailability}
          disabled={updating || !canGoOnline}
          title={!canGoOnline ? 'You cannot toggle availability while on an active trip.' : ''}
          className="btn-primary"
        >
          {ambulance.status === 'Offline' ? <ToggleLeft size={18} /> : <ToggleRight size={18} />}
          {ambulance.status === 'Offline' ? 'Go Available' : 'Go Offline'}
        </button>
      </div>

      <div className="card">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-700">Current Location</p>
          <button onClick={syncLocation} className="btn-secondary">
            <LocateFixed size={16} /> {geoStatus === 'loading' ? 'Syncing...' : 'Sync my location'}
          </button>
        </div>
        <div className="mt-3">
          <MapView center={{ lat: Number(ambulance.latitude), lng: Number(ambulance.longitude) }} zoom={13} height="300px">
            <Marker position={[Number(ambulance.latitude), Number(ambulance.longitude)]} icon={ICONS.ambulance}>
              <Popup>{ambulance.ambulance_number}</Popup>
            </Marker>
          </MapView>
        </div>
      </div>
    </div>
  );
}
