import React, { useEffect, useState } from 'react';
import { Users, Building2, ShieldCheck, Ambulance, Siren, CheckCircle2 } from 'lucide-react';
import { adminService } from '../../services/adminService';
import StatCard from '../../components/StatCard';
import BarChart from '../../components/BarChart';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getStatistics().then((res) => setData(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner label="Loading admin dashboard..." />;
  if (!data) return <p className="text-slate-500">Could not load statistics.</p>;

  const { statistics, charts } = data;

  const byType = charts.emergenciesByType.map((r) => ({ label: r.emergency_type, value: r.count }));
  const byStatus = charts.emergenciesByStatus.map((r) => ({ label: r.status, value: r.count }));
  const hospitalUtil = charts.hospitalUtilization.map((r) => ({ label: r.name, value: r.utilizationPercent || 0 }));
  const ambulanceUtil = charts.ambulanceUtilization.map((r) => ({ label: r.status, value: r.count }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Platform-wide overview of users, hospitals, ambulances, and emergencies.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Total Users" value={statistics.totalUsers} tone="brand" />
        <StatCard icon={Building2} label="Total Hospitals" value={statistics.totalHospitals} tone="teal" />
        <StatCard icon={ShieldCheck} label="Verified Hospitals" value={statistics.verifiedHospitals} tone="green" />
        <StatCard icon={Ambulance} label="Total Ambulances" value={statistics.totalAmbulances} tone="red" />
        <StatCard icon={Ambulance} label="Available Ambulances" value={statistics.availableAmbulances} tone="green" />
        <StatCard icon={Siren} label="Active Emergencies" value={statistics.activeEmergencies} tone="yellow" />
        <StatCard icon={CheckCircle2} label="Completed Emergencies" value={statistics.completedEmergencies} tone="teal" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="font-semibold text-slate-900">Emergency Cases by Type</h2>
          <div className="mt-4"><BarChart data={byType} color="#e11d2e" /></div>
        </div>
        <div className="card">
          <h2 className="font-semibold text-slate-900">Emergency Response Status</h2>
          <div className="mt-4"><BarChart data={byStatus} color="#0d8aff" /></div>
        </div>
        <div className="card">
          <h2 className="font-semibold text-slate-900">Hospital Capacity Utilization</h2>
          <p className="text-xs text-slate-400">% of beds currently occupied</p>
          <div className="mt-4"><BarChart data={hospitalUtil} color="#0f9d94" unit="%" /></div>
        </div>
        <div className="card">
          <h2 className="font-semibold text-slate-900">Ambulance Utilization</h2>
          <div className="mt-4"><BarChart data={ambulanceUtil} color="#ca8a04" /></div>
        </div>
      </div>
    </div>
  );
}
