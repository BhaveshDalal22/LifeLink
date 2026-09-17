import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { PlusCircle, Trash2, ShieldCheck, ShieldOff } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { hospitalService } from '../../services/hospitalService';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import ConfirmModal from '../../components/ConfirmModal';
import StatusBadge from '../../components/StatusBadge';
import { hospitalStatusBadge } from '../../utils/statusColors';

export default function ManageHospitals() {
  const [hospitals, setHospitals] = useState([]);
  const [staffUsers, setStaffUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = () => {
    setLoading(true);
    Promise.all([adminService.getHospitals(), adminService.getUsers()])
      .then(([hRes, uRes]) => {
        setHospitals(hRes.data.hospitals);
        setStaffUsers(uRes.data.users.filter((u) => u.role === 'hospital_staff'));
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const assignStaff = async (hospital, staffUserId) => {
    try {
      await hospitalService.update(hospital.hospital_id, { staff_user_id: staffUserId ? Number(staffUserId) : null });
      toast.success('Hospital staff assignment updated.');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update staff assignment.');
    }
  };

  const toggleVerified = async (hospital) => {
    try {
      await hospitalService.update(hospital.hospital_id, { verified: !hospital.verified });
      toast.success(hospital.verified ? 'Hospital unverified.' : 'Hospital verified.');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update hospital.');
    }
  };

  const handleDelete = async () => {
    try {
      await hospitalService.remove(deleteTarget.hospital_id);
      toast.success('Hospital deleted.');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete hospital.');
    } finally {
      setDeleteTarget(null);
    }
  };

  if (loading) return <LoadingSpinner label="Loading hospitals..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manage Hospitals</h1>
          <p className="mt-1 text-sm text-slate-500">{hospitals.length} hospitals registered.</p>
        </div>
        <Link to="/admin/hospitals/add" className="btn-primary"><PlusCircle size={16} /> Add Hospital</Link>
      </div>

      {hospitals.length === 0 ? (
        <EmptyState title="No hospitals yet" message="Add your first hospital to get started." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Area</th>
                <th className="px-4 py-3">Beds</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Verified</th>
                <th className="px-4 py-3">Assigned Staff</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {hospitals.map((h) => (
                <tr key={h.hospital_id}>
                  <td className="px-4 py-3 font-medium text-slate-800">{h.name}</td>
                  <td className="px-4 py-3 text-slate-500">{h.area}</td>
                  <td className="px-4 py-3 text-slate-500">{h.available_beds}/{h.total_beds}</td>
                  <td className="px-4 py-3"><StatusBadge label={h.status} colorClass={hospitalStatusBadge(h.status)} /></td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleVerified(h)} className={`flex items-center gap-1 text-xs font-semibold ${h.verified ? 'text-green-600' : 'text-slate-400'}`}>
                      {h.verified ? <ShieldCheck size={14} /> : <ShieldOff size={14} />} {h.verified ? 'Verified' : 'Unverified'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      className="input py-1.5 text-xs"
                      value={h.staff_user_id || ''}
                      onChange={(e) => assignStaff(h, e.target.value)}
                    >
                      <option value="">Unassigned</option>
                      {staffUsers.map((u) => (
                        <option key={u.user_id} value={u.user_id}>{u.name} ({u.email})</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => setDeleteTarget(h)} className="text-red-600 hover:text-red-700">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete this hospital?"
        message={`This will permanently remove ${deleteTarget?.name} and its capacity records. This action cannot be undone.`}
        confirmLabel="Delete Hospital"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
