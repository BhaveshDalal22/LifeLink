import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { MapPin, Phone, Clock, BedDouble, Activity, Wind, Navigation, Ambulance } from 'lucide-react';
import { hospitalService } from '../../services/hospitalService';
import { emergencyService } from '../../services/emergencyService';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import { hospitalStatusBadge, availabilityColor } from '../../utils/statusColors';

export default function HospitalDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeEmergencyId, setActiveEmergencyId] = useState(null);

  useEffect(() => {
    hospitalService.getById(id).then((res) => setHospital(res.data.hospital)).finally(() => setLoading(false));
    emergencyService.getAll().then((res) => {
      const active = res.data.emergencies.find((e) => !['Completed', 'Cancelled'].includes(e.status));
      if (active) setActiveEmergencyId(active.emergency_id);
    });
  }, [id]);

  const handleRequestAdmission = async () => {
    if (!activeEmergencyId) {
      toast.error('Report an emergency first to request admission.');
      navigate('/patient/report-emergency');
      return;
    }
    try {
      await emergencyService.requestHospital({ emergencyId: activeEmergencyId, hospitalId: hospital.hospital_id });
      toast.success('Admission requested.');
      navigate(`/patient/tracking/${activeEmergencyId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to request admission.');
    }
  };

  const handleRequestAmbulance = () => {
    navigate('/patient/request-ambulance');
  };

  if (loading) return <LoadingSpinner label="Loading hospital details..." />;
  if (!hospital) return <p className="text-slate-500">Hospital not found.</p>;

  const {
    name, address, area, city, state, contact, status, specializations = [],
    total_beds, available_beds, icu_total, icu_available,
    emergency_beds_total, emergency_beds_available, ventilators_total, ventilators_available,
    last_updated, latitude, longitude
  } = hospital;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{name}</h1>
            <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
              <MapPin size={14} /> {address}, {area}, {city}, {state}
            </p>
            <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
              <Phone size={14} /> {contact}
            </p>
          </div>
          <StatusBadge label={status} colorClass={hospitalStatusBadge(status)} />
        </div>

        {specializations.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {specializations.map((s) => (
              <span key={s} className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">{s}</span>
            ))}
          </div>
        )}

        <p className="mt-3 flex items-center gap-1 text-xs text-slate-400">
          <Clock size={12} /> Last updated {last_updated ? new Date(last_updated).toLocaleString() : '—'}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <button onClick={handleRequestAdmission} className="btn-primary">Request Admission</button>
          <button onClick={handleRequestAmbulance} className="btn-secondary"><Ambulance size={16} /> Request Ambulance</button>
          <a
            href={`https://www.openstreetmap.org/directions?to=${latitude}%2C${longitude}`}
            target="_blank" rel="noreferrer" className="btn-outline"
          >
            <Navigation size={16} /> Get Directions
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card text-center">
          <BedDouble className={`mx-auto ${availabilityColor(available_beds, total_beds)}`} size={22} />
          <p className="mt-2 text-xl font-bold text-slate-900">{available_beds}/{total_beds}</p>
          <p className="text-xs text-slate-500">Total Beds</p>
        </div>
        <div className="card text-center">
          <Activity className={`mx-auto ${availabilityColor(icu_available, icu_total)}`} size={22} />
          <p className="mt-2 text-xl font-bold text-slate-900">{icu_available}/{icu_total}</p>
          <p className="text-xs text-slate-500">ICU Beds</p>
        </div>
        <div className="card text-center">
          <BedDouble className={`mx-auto ${availabilityColor(emergency_beds_available, emergency_beds_total)}`} size={22} />
          <p className="mt-2 text-xl font-bold text-slate-900">{emergency_beds_available}/{emergency_beds_total}</p>
          <p className="text-xs text-slate-500">Emergency Beds</p>
        </div>
        <div className="card text-center">
          <Wind className={`mx-auto ${availabilityColor(ventilators_available, ventilators_total)}`} size={22} />
          <p className="mt-2 text-xl font-bold text-slate-900">{ventilators_available}/{ventilators_total}</p>
          <p className="text-xs text-slate-500">Ventilators</p>
        </div>
      </div>
    </div>
  );
}
