const HospitalRequest = require('../models/HospitalRequest');
const Hospital = require('../models/Hospital');
const Emergency = require('../models/Emergency');
const Notification = require('../models/Notification');
const { asyncHandler } = require('../utils/asyncHandler');

const VALID_STATUSES = ['Pending', 'Accepted', 'Rejected', 'Arrived', 'Cancelled'];

// POST /api/hospital-requests (patient requests admission at a hospital)
const createRequest = asyncHandler(async (req, res) => {
  const { emergencyId, hospitalId } = req.body;
  if (!emergencyId || !hospitalId) {
    return res.status(400).json({ message: 'emergencyId and hospitalId are required.' });
  }

  const emergency = await Emergency.findById(emergencyId);
  if (!emergency) return res.status(404).json({ message: 'Emergency not found.' });
  if (emergency.user_id !== req.user.user_id) {
    return res.status(403).json({ message: 'You cannot request admission for another patient.' });
  }

  const hospital = await Hospital.findById(hospitalId);
  if (!hospital || !hospital.verified) {
    return res.status(404).json({ message: 'Hospital not found or not verified.' });
  }

  const requestId = await HospitalRequest.create({ emergencyId, hospitalId });
  await Emergency.updateStatus(emergencyId, 'Hospital Requested');

  const request = await HospitalRequest.findById(requestId);
  res.status(201).json({ message: 'Admission request sent to hospital.', request });
});

// GET /api/hospital-requests
// hospital_staff -> requests for their hospital; patient -> requests for their emergencies; admin -> all handled via emergency filters
const getRequests = asyncHandler(async (req, res) => {
  if (req.user.role === 'hospital_staff') {
    const hospital = await Hospital.findByStaffUserId(req.user.user_id);
    if (!hospital) return res.json({ requests: [] });
    const requests = await HospitalRequest.findByHospital(hospital.hospital_id);
    return res.json({ requests });
  }

  if (req.query.emergencyId) {
    const emergency = await Emergency.findById(req.query.emergencyId);
    if (!emergency) return res.status(404).json({ message: 'Emergency not found.' });
    if (req.user.role === 'patient' && emergency.user_id !== req.user.user_id) {
      return res.status(403).json({ message: 'Access denied.' });
    }
    const requests = await HospitalRequest.findByEmergency(req.query.emergencyId);
    return res.json({ requests });
  }

  return res.status(400).json({ message: 'emergencyId query parameter is required for this role.' });
});

// PUT /api/hospital-requests/:id/status (hospital_staff accept/reject/mark arrived)
const updateRequestStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ message: 'Invalid status value.' });
  }

  const request = await HospitalRequest.findById(req.params.id);
  if (!request) return res.status(404).json({ message: 'Request not found.' });

  const hospital = await Hospital.findByStaffUserId(req.user.user_id);
  if (req.user.role !== 'admin' && (!hospital || hospital.hospital_id !== request.hospital_id)) {
    return res.status(403).json({ message: 'You can only manage requests for your own hospital.' });
  }

  await HospitalRequest.updateStatus(req.params.id, status);

  const statusMessages = {
    Accepted: 'Hospital Confirmed',
    Rejected: 'Hospital Search',
    Arrived: 'Arrived'
  };
  if (statusMessages[status]) {
    await Emergency.updateStatus(request.emergency_id, statusMessages[status]);
  }

  await Notification.create({
    userId: request.patient_user_id,
    message: `Your hospital admission request was "${status}".`
  });

  const updated = await HospitalRequest.findById(req.params.id);
  res.json({ message: 'Request status updated.', request: updated });
});

module.exports = { createRequest, getRequests, updateRequestStatus };
