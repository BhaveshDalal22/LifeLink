import React, { useEffect, useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { adminService } from '../../services/adminService';
import BarChart from '../../components/BarChart';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function Reports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getStatistics().then((res) => setData(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner label="Loading reports..." />;
  if (!data) return <p className="text-slate-500">Could not load reports.</p>;

  const { statistics, charts } = data;
  const usersByRole = charts.usersByRole.map((r) => ({ label: r.role.replace('_', ' '), value: r.count }));
  const byType = charts.emergenciesByType.map((r) => ({ label: r.emergency_type, value: r.count }));
  const byStatus = charts.emergenciesByStatus.map((r) => ({ label: r.status, value: r.count }));
  const hospitalUtil = charts.hospitalUtilization.map((r) => ({ label: r.name, value: r.utilizationPercent || 0 }));

  const completionRate = statistics.activeEmergencies + statistics.completedEmergencies > 0
    ? Math.round((statistics.completedEmergencies / (statistics.activeEmergencies + statistics.completedEmergencies)) * 100)
    : 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white">
          <BarChart3 size={22} />
        </span>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Reports & Statistics</h1>
          <p className="text-sm text-slate-500">Platform-wide performance summary.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card text-center">
          <p className="text-3xl font-bold text-slate-900">{completionRate}%</p>
          <p className="mt-1 text-sm text-slate-500">Emergency completion rate</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-slate-900">{statistics.verifiedHospitals}/{statistics.totalHospitals}</p>
          <p className="mt-1 text-sm text-slate-500">Verified hospitals</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-slate-900">{statistics.availableAmbulances}/{statistics.totalAmbulances}</p>
          <p className="mt-1 text-sm text-slate-500">Available ambulances</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="font-semibold text-slate-900">Users by Role</h2>
          <div className="mt-4"><BarChart data={usersByRole} color="#0d8aff" /></div>
        </div>
        <div className="card">
          <h2 className="font-semibold text-slate-900">Emergencies by Type</h2>
          <div className="mt-4"><BarChart data={byType} color="#e11d2e" /></div>
        </div>
        <div className="card">
          <h2 className="font-semibold text-slate-900">Emergencies by Status</h2>
          <div className="mt-4"><BarChart data={byStatus} color="#0f9d94" /></div>
        </div>
        <div className="card">
          <h2 className="font-semibold text-slate-900">Hospital Capacity Utilization (%)</h2>
          <div className="mt-4"><BarChart data={hospitalUtil} color="#ca8a04" unit="%" /></div>
        </div>
      </div>

      <p className="text-xs text-slate-400">
        Future scope: AI-based demand forecasting could extend these reports with predictive capacity planning.
        Not implemented in this version.
      </p>
    </div>
  );
}
