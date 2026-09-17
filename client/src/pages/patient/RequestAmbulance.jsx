import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { LocateFixed, Ambulance as AmbulanceIcon, XCircle } from 'lucide-react';
import { ambulanceService } from '../../services/ambulanceService';
import { emergencyService } from '../../services/emergencyService';
import { useGeolocation } from '../../hooks/useGeolocation';
import AmbulanceCard from '../../components/AmbulanceCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import ConfirmModal from '../../components/ConfirmModal';
import MapView, { Marker, Popup, ICONS } from '../../components/MapView';

export default function RequestAmbulance() {
  const routerLocation = useLocation();
  const navigate = useNavigate();
  const { location, hasLocation, requestLocation, status: geoStatus } = useGeolocation();

  const [emergencyId, setEmergencyId] = useState(routerLocation.state?.emergencyId || null);
  const [ambulances, setAmbulances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestingId, setRequestingId] = useState(null);
  const [activeRequest, setActiveRequest] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);

  useEffect(() => {
    if (!emergencyId) {
      emergencyService.getAll().then((res) => {
        const active = res.data.emergencies.find((e) => !['Completed', 'Cancelled'].includes(e.status));
        if (active) setEmergencyId(active.emergency_id);
      });
    }
  }, [emergencyId]);

  const loadAmbulances = () => {
    setLoading(true);
    ambulanceService.getNearby({ lat: location.lat, lng: location.lng })
      .then((res) => setAmbulances(res.data.ambulances))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAmbulances();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.lat, location.lng]);

  useEffect(() => {
    if (!emergencyId) return;
    ambulanceService.getRequests({ emergencyId }).then((res) => {
      const active = res.data.requests.find((r) => !['Completed', 'Cancelled'].includes(r.status));
      setActiveRequest(active || null);
    });
  }, [emergencyId]);

  const handleRequest = async (ambulance) => {
    if (!emergencyId) {
      toast.error('Report an emergency first to request an ambulance.');
      navigate('/patient/report-emergency');
      return;
    }
    setRequestingId(ambulance.ambulance_id);
    try {
      const res = await ambulanceService.requestAmbulance({ emergencyId, ambulanceId: ambulance.ambulance_id });
      toast.success(`Ambulance ${ambulance.ambulance_number} requested.`);
      setActiveRequest(res.data.request);
      loadAmbulances();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to request ambulance.');
    } finally {
      setRequestingId(null);
    }
  };

  const handleCancel = async () => {
    try {
      await ambulanceService.updateRequestStatus(cancelTarget.ambulance_request_id, 'Cancelled');
      toast.success('Ambulance request cancelled.');
      setActiveRequest(null);
      loadAmbulances();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel request.');
    } finally {
      setCancelTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Request Ambulance</h1>
          <p className="mt-1 text-sm text-slate-500">Nearest available demo ambulances, sorted by distance.</p>
        </div>
        <button onClick={requestLocation} className="btn-secondary">
          <LocateFixed size={16} /> {geoStatus === 'loading' ? 'Locating...' : hasLocation ? 'Location set' : 'Use my location'}
        </button>
      </div>

      {activeRequest && (
        <div className="card flex flex-wrap items-center justify-between gap-3 border-l-4 border-yellow-500">
          <div className="flex items-center gap-3">
            <AmbulanceIcon className="text-emergency-500" size={22} />
            <div>
              <p className="font-semibold text-slate-900">Active ambulance request</p>
              <p className="text-sm text-slate-500">Status: {activeRequest.status}</p>
            </div>
          </div>
          <button onClick={() => setCancelTarget(activeRequest)} className="btn-secondary">
            <XCircle size={16} /> Cancel Request
          </button>
        </div>
      )}

      <MapView center={location} zoom={12}>
        <Marker position={[location.lat, location.lng]} icon={ICONS.patient}><Popup>Your location</Popup></Marker>
        {ambulances.map((a) => (
          <Marker key={a.ambulance_id} position={[a.latitude, a.longitude]} icon={ICONS.ambulance}>
            <Popup>
              <p className="font-semibold">{a.ambulance_number}</p>
              <p className="text-xs">{a.distanceKm} km · ETA {a.etaMinutes} min</p>
            </Popup>
          </Marker>
        ))}
      </MapView>

      {loading ? (
        <LoadingSpinner label="Finding nearby ambulances..." />
      ) : ambulances.length === 0 ? (
        <EmptyState title="No ambulances available nearby" message="All demo ambulances are currently busy or offline. Please try again shortly." />
      ) : (
        <div className="space-y-3">
          {ambulances.map((a) => (
            <AmbulanceCard key={a.ambulance_id} ambulance={a} onRequest={handleRequest} requesting={requestingId === a.ambulance_id} />
          ))}
        </div>
      )}

      <ConfirmModal
        open={!!cancelTarget}
        title="Cancel ambulance request?"
        message="This will cancel your current ambulance request. You can request another ambulance afterwards."
        confirmLabel="Cancel Request"
        danger
        onConfirm={handleCancel}
        onCancel={() => setCancelTarget(null)}
      />
    </div>
  );
}
