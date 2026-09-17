const Ambulance = require('../models/Ambulance');
const AmbulanceRequest = require('../models/AmbulanceRequest');
const Emergency = require('../models/Emergency');
const Notification = require('../models/Notification');
const { haversineDistance } = require('../utils/haversine');
const { asyncHandler } = require('../utils/asyncHandler');

const VALID_AMBULANCE_STATUSES = ['Available', 'Requested', 'Assigned', 'On the Way', 'Busy', 'Offline'];
const VALID_TRIP_STATUSES = [
  'Requested', 'Accepted', 'On the Way', 'Arrived at Patient Location',
  'Patient Picked Up', 'Arrived at Hospital', 'Completed', 'Cancelled'
];
// Average city driving speed assumption for a simple ETA estimate (demo purposes)
const AVG_SPEED_KMH = 30;

// GET /api/ambulances
const getAmbulances = asyncHandler(async (req, res) => {
  const ambulances = await Ambulance.findAll();
  res.json({ ambulances });
});

// GET /api/ambulances/available
const getAvailableAmbulances = asyncHandler(async (req, res) => {
  const ambulances = await Ambulance.findAvailable();
  res.json({ ambulances });
});

// GET /api/ambulances/nearby?lat=&lng=
const getNearbyAmbulances = asyncHandler(async (req, res) => {
  const { lat, lng } = req.query;
  if (!lat || !lng) return res.status(400).json({ message: 'lat and lng are required.' });

  const ambulances = await Ambulance.findAvailable();
  const withDistance = ambulances
    .map((a) => {
      const distance = haversineDistance(Number(lat), Number(lng), a.latitude, a.longitude);
      const etaMinutes = Math.round((distance / AVG_SPEED_KMH) * 60);
      return { ...a, distanceKm: distance, etaMinutes };
    })
    .sort((a, b) => a.distanceKm - b.distanceKm);

  res.json({ ambulances: withDistance });
});

// POST /api/ambulance-requests (patient)
const createAmbulanceRequest = asyncHandler(async (req, res) => {
  const { emergencyId, ambulanceId } = req.body;
  if (!emergencyId || !ambulanceId) {
    return res.status(400).json({ message: 'emergencyId and ambulanceId are required.' });
  }

  const emergency = await Emergency.findById(emergencyId);
  if (!emergency) return res.status(404).json({ message: 'Emergency not found.' });
  if (emergency.user_id !== req.user.user_id) {
    return res.status(403).json({ message: 'You cannot request an ambulance for another patient.' });
  }

  const ambulance = await Ambulance.findById(ambulanceId);
  if (!ambulance || ambulance.status !== 'Available') {
    return res.status(409).json({ message: 'Ambulance is not available.' });
  }

  const requestId = await AmbulanceRequest.create({ emergencyId, ambulanceId });
  await Ambulance.updateStatus(ambulanceId, 'Requested');
  await Emergency.updateStatus(emergencyId, 'Ambulance Requested');

  await Notification.create({
    userId: ambulance.driver_id,
    message: `New ambulance request for emergency #${emergencyId} (${emergency.emergency_type}, ${emergency.severity}).`
  });

  const request = await AmbulanceRequest.findById(requestId);
  res.status(201).json({ message: 'Ambulance requested.', request });
});

// GET /api/ambulance-requests?emergencyId= or driver's active request
const getAmbulanceRequests = asyncHandler(async (req, res) => {
  if (req.user.role === 'ambulance_driver') {
    const ambulance = await Ambulance.findByDriverId(req.user.user_id);
    if (!ambulance) return res.json({ requests: [] });
    const requests = await AmbulanceRequest.findByAmbulance(ambulance.ambulance_id);
    return res.json({ requests });
  }

  if (req.query.emergencyId) {
    const emergency = await Emergency.findById(req.query.emergencyId);
    if (!emergency) return res.status(404).json({ message: 'Emergency not found.' });
    if (req.user.role === 'patient' && emergency.user_id !== req.user.user_id) {
      return res.status(403).json({ message: 'Access denied.' });
    }
    const requests = await AmbulanceRequest.findByEmergency(req.query.emergencyId);
    return res.json({ requests });
  }

  return res.status(400).json({ message: 'emergencyId query parameter is required for this role.' });
});

// PUT /api/ambulance-requests/:id/status (driver updates trip status; patient may cancel)
const updateAmbulanceRequestStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!VALID_TRIP_STATUSES.includes(status)) {
    return res.status(400).json({ message: 'Invalid trip status.' });
  }

  const request = await AmbulanceRequest.findById(req.params.id);
  if (!request) return res.status(404).json({ message: 'Ambulance request not found.' });

  if (req.user.role === 'ambulance_driver') {
    const ambulance = await Ambulance.findByDriverId(req.user.user_id);
    if (!ambulance || ambulance.ambulance_id !== request.ambulance_id) {
      return res.status(403).json({ message: 'You can only update your own assigned trip.' });
    }
  } else if (req.user.role === 'patient') {
    if (request.patient_user_id !== req.user.user_id || status !== 'Cancelled') {
      return res.status(403).json({ message: 'Patients may only cancel their own ambulance request.' });
    }
  }

  await AmbulanceRequest.updateStatus(req.params.id, status);

  const emergencyStatusMap = {
    Accepted: 'Ambulance Assigned',
    'On the Way': 'On the Way',
    'Arrived at Patient Location': 'On the Way',
    'Patient Picked Up': 'Patient Picked Up',
    'Arrived at Hospital': 'Arrived',
    Completed: 'Completed',
    Cancelled: 'Hospital Search'
  };
  if (emergencyStatusMap[status]) {
    await Emergency.updateStatus(request.emergency_id, emergencyStatusMap[status]);
  }

  const ambulanceStatusMap = {
    Accepted: 'Assigned',
    'On the Way': 'On the Way',
    'Arrived at Patient Location': 'On the Way',
    'Patient Picked Up': 'On the Way',
    'Arrived at Hospital': 'Busy',
    Completed: 'Available',
    Cancelled: 'Available'
  };
  if (ambulanceStatusMap[status]) {
    await Ambulance.updateStatus(request.ambulance_id, ambulanceStatusMap[status]);
  }

  await Notification.create({
    userId: request.patient_user_id,
    message: `Your ambulance trip status changed to "${status}".`
  });

  const updated = await AmbulanceRequest.findById(req.params.id);
  res.json({ message: 'Ambulance request status updated.', request: updated });
});

// PUT /api/ambulances/:id/location (driver only, own ambulance)
const updateAmbulanceLocation = asyncHandler(async (req, res) => {
  const { latitude, longitude } = req.body;
  if (latitude === undefined || longitude === undefined) {
    return res.status(400).json({ message: 'latitude and longitude are required.' });
  }

  const ambulance = await Ambulance.findById(req.params.id);
  if (!ambulance) return res.status(404).json({ message: 'Ambulance not found.' });
  if (req.user.role === 'ambulance_driver' && ambulance.driver_id !== req.user.user_id) {
    return res.status(403).json({ message: 'You can only update your own ambulance location.' });
  }

  await Ambulance.updateLocation(req.params.id, latitude, longitude);
  const updated = await Ambulance.findById(req.params.id);
  res.json({ message: 'Location updated.', ambulance: updated });
});

// PUT /api/ambulances/:id/status (driver toggles availability)
const updateAmbulanceStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!VALID_AMBULANCE_STATUSES.includes(status)) {
    return res.status(400).json({ message: 'Invalid ambulance status.' });
  }

  const ambulance = await Ambulance.findById(req.params.id);
  if (!ambulance) return res.status(404).json({ message: 'Ambulance not found.' });
  if (req.user.role === 'ambulance_driver' && ambulance.driver_id !== req.user.user_id) {
    return res.status(403).json({ message: 'You can only update your own ambulance.' });
  }

  await Ambulance.updateStatus(req.params.id, status);
  const updated = await Ambulance.findById(req.params.id);
  res.json({ message: 'Ambulance status updated.', ambulance: updated });
});

module.exports = {
  getAmbulances, getAvailableAmbulances, getNearbyAmbulances,
  createAmbulanceRequest, getAmbulanceRequests, updateAmbulanceRequestStatus,
  updateAmbulanceLocation, updateAmbulanceStatus
};
