const Emergency = require('../models/Emergency');
const Hospital = require('../models/Hospital');
const Notification = require('../models/Notification');
const { rankHospitals } = require('../utils/recommend');
const { asyncHandler } = require('../utils/asyncHandler');

const VALID_STATUSES = [
  'Reported', 'Hospital Search', 'Hospital Requested', 'Ambulance Requested',
  'Ambulance Assigned', 'On the Way', 'Patient Picked Up', 'Hospital Confirmed',
  'Arrived', 'Completed', 'Cancelled'
];
const VALID_TYPES = ['Cardiac', 'Stroke', 'Road Accident', 'Burns', 'Obstetric', 'Pediatric', 'Other'];
const VALID_SEVERITY = ['Critical', 'Serious', 'Moderate'];

// POST /api/emergencies (patient)
const createEmergency = asyncHandler(async (req, res) => {
  const { patientName, emergencyType, severity, requiredResources, latitude, longitude, additionalInfo } = req.body;

  if (!patientName || !emergencyType || !severity || !latitude || !longitude) {
    return res.status(400).json({ message: 'patientName, emergencyType, severity, latitude and longitude are required.' });
  }
  if (!VALID_TYPES.includes(emergencyType)) {
    return res.status(400).json({ message: 'Invalid emergencyType.' });
  }
  if (!VALID_SEVERITY.includes(severity)) {
    return res.status(400).json({ message: 'Invalid severity.' });
  }

  const resourcesStr = Array.isArray(requiredResources) ? requiredResources.join(', ') : (requiredResources || '');

  const emergencyId = await Emergency.create({
    userId: req.user.user_id, patientName, emergencyType, severity,
    requiredResources: resourcesStr, latitude, longitude, additionalInfo
  });

  await Emergency.updateStatus(emergencyId, 'Hospital Search');

  const hospitals = await Hospital.findAll({ verifiedOnly: true });
  const recommended = rankHospitals(hospitals, emergencyType, resourcesStr, Number(latitude), Number(longitude)).slice(0, 10);

  const emergency = await Emergency.findById(emergencyId);
  res.status(201).json({
    message: 'Emergency reported. Nearby hospitals found.',
    emergency,
    recommendedHospitals: recommended
  });
});

// GET /api/emergencies (patient: own; hospital_staff/admin: all or filtered)
const getEmergencies = asyncHandler(async (req, res) => {
  const { status } = req.query;
  let emergencies;
  if (req.user.role === 'patient') {
    emergencies = await Emergency.findByUser(req.user.user_id);
  } else {
    emergencies = await Emergency.findAll({ status });
  }
  res.json({ emergencies });
});

// GET /api/emergencies/:id
const getEmergencyById = asyncHandler(async (req, res) => {
  const emergency = await Emergency.findById(req.params.id);
  if (!emergency) return res.status(404).json({ message: 'Emergency not found.' });

  if (req.user.role === 'patient' && emergency.user_id !== req.user.user_id) {
    return res.status(403).json({ message: 'You cannot access another patient\'s emergency record.' });
  }

  res.json({ emergency });
});

// PUT /api/emergencies/:id/status
const updateEmergencyStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ message: 'Invalid status value.' });
  }

  const emergency = await Emergency.findById(req.params.id);
  if (!emergency) return res.status(404).json({ message: 'Emergency not found.' });

  if (req.user.role === 'patient') {
    if (emergency.user_id !== req.user.user_id) {
      return res.status(403).json({ message: 'You cannot modify another patient\'s emergency.' });
    }
    if (status !== 'Cancelled') {
      return res.status(403).json({ message: 'Patients may only cancel their own emergency.' });
    }
  }

  await Emergency.updateStatus(req.params.id, status);

  await Notification.create({
    userId: emergency.user_id,
    message: `Your emergency #${emergency.emergency_id} status changed to "${status}".`
  });

  const updated = await Emergency.findById(req.params.id);
  res.json({ message: 'Emergency status updated.', emergency: updated });
});

module.exports = { createEmergency, getEmergencies, getEmergencyById, updateEmergencyStatus };
