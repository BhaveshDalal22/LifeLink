const Hospital = require('../models/Hospital');
const { haversineDistance } = require('../utils/haversine');
const { rankHospitals } = require('../utils/recommend');
const { asyncHandler } = require('../utils/asyncHandler');

function deriveStatusFromCapacity(capacity) {
  if (!capacity || capacity.available_beds === 0) return 'Full';
  const ratio = capacity.available_beds / Math.max(capacity.total_beds, 1);
  if (ratio <= 0.15) return 'Limited Capacity';
  return 'Open';
}

// GET /api/hospitals  (public - only verified hospitals, unless ?all=true and caller is admin)
const getHospitals = asyncHandler(async (req, res) => {
  const showAll = req.query.all === 'true' && req.user && req.user.role === 'admin';
  const hospitals = await Hospital.findAll({ verifiedOnly: !showAll });
  res.json({ hospitals });
});

// GET /api/hospitals/nearby?lat=&lng=&type=&resources=&maxDistance=
const getNearbyHospitals = asyncHandler(async (req, res) => {
  const { lat, lng, type, resources, maxDistance } = req.query;
  if (!lat || !lng) {
    return res.status(400).json({ message: 'lat and lng query params are required.' });
  }

  const hospitals = await Hospital.findAll({ verifiedOnly: true });
  const patientLat = Number(lat);
  const patientLng = Number(lng);

  let ranked = rankHospitals(hospitals, type || 'Other', resources || '', patientLat, patientLng);

  if (maxDistance) {
    ranked = ranked.filter((h) => h.distanceKm <= Number(maxDistance));
  }

  res.json({ hospitals: ranked });
});

// GET /api/hospitals/:id
const getHospitalById = asyncHandler(async (req, res) => {
  const hospital = await Hospital.findById(req.params.id);
  if (!hospital) return res.status(404).json({ message: 'Hospital not found.' });
  res.json({ hospital });
});

// POST /api/hospitals (admin only)
const createHospital = asyncHandler(async (req, res) => {
  const {
    name, address, area, city, state, latitude, longitude, contact,
    specializations, totalBeds, availableBeds, icuTotal, icuAvailable,
    emergencyBedsTotal, emergencyBedsAvailable, ventilatorsTotal, ventilatorsAvailable,
    staffUserId
  } = req.body;

  if (!name || !address || !area || !latitude || !longitude || !contact) {
    return res.status(400).json({ message: 'name, address, area, latitude, longitude and contact are required.' });
  }
  if (Number(availableBeds || 0) > Number(totalBeds || 0)) {
    return res.status(400).json({ message: 'Available beds cannot exceed total beds.' });
  }
  if (Number(icuAvailable || 0) > Number(icuTotal || 0)) {
    return res.status(400).json({ message: 'Available ICU beds cannot exceed total ICU beds.' });
  }
  if (Number(emergencyBedsAvailable || 0) > Number(emergencyBedsTotal || 0)) {
    return res.status(400).json({ message: 'Available emergency beds cannot exceed total emergency beds.' });
  }
  if (Number(ventilatorsAvailable || 0) > Number(ventilatorsTotal || 0)) {
    return res.status(400).json({ message: 'Available ventilators cannot exceed total ventilators.' });
  }

  const hospitalId = await Hospital.create({
    name, address, area, city: city || 'Bengaluru', state: state || 'Karnataka',
    latitude, longitude, contact, staffUserId
  });

  if (Array.isArray(specializations) && specializations.length > 0) {
    await Hospital.addSpecializations(hospitalId, specializations);
  }

  await Hospital.createCapacity(hospitalId, {
    totalBeds: totalBeds || 0, availableBeds: availableBeds || 0,
    icuTotal: icuTotal || 0, icuAvailable: icuAvailable || 0,
    emergencyBedsTotal: emergencyBedsTotal || 0, emergencyBedsAvailable: emergencyBedsAvailable || 0,
    ventilatorsTotal: ventilatorsTotal || 0, ventilatorsAvailable: ventilatorsAvailable || 0
  });

  const hospital = await Hospital.findById(hospitalId);
  res.status(201).json({ message: 'Hospital created.', hospital });
});

// PUT /api/hospitals/:id (admin, or the hospital's own staff for basic fields)
const updateHospital = asyncHandler(async (req, res) => {
  const hospital = await Hospital.findById(req.params.id);
  if (!hospital) return res.status(404).json({ message: 'Hospital not found.' });

  const isAdmin = req.user.role === 'admin';
  const isOwnStaff = req.user.role === 'hospital_staff' && hospital.staff_user_id === req.user.user_id;
  if (!isAdmin && !isOwnStaff) {
    return res.status(403).json({ message: 'You can only update your own hospital.' });
  }

  const { specializations, verified, staff_user_id, ...restFields } = req.body;
  const fields = { ...restFields };
  if (isAdmin && staff_user_id !== undefined) {
    fields.staff_user_id = staff_user_id; // only admin may reassign staff
  }
  await Hospital.update(req.params.id, fields);

  if (Array.isArray(specializations)) {
    await Hospital.replaceSpecializations(req.params.id, specializations);
  }
  if (isAdmin && typeof verified === 'boolean') {
    await Hospital.setVerified(req.params.id, verified);
  }

  const updated = await Hospital.findById(req.params.id);
  res.json({ message: 'Hospital updated.', hospital: updated });
});

// DELETE /api/hospitals/:id (admin only)
const deleteHospital = asyncHandler(async (req, res) => {
  const hospital = await Hospital.findById(req.params.id);
  if (!hospital) return res.status(404).json({ message: 'Hospital not found.' });
  await Hospital.deleteById(req.params.id);
  res.json({ message: 'Hospital deleted.' });
});

// GET /api/hospitals/:id/capacity
const getCapacity = asyncHandler(async (req, res) => {
  const capacity = await Hospital.getCapacity(req.params.id);
  if (!capacity) return res.status(404).json({ message: 'Capacity record not found.' });
  res.json({ capacity });
});

// PUT /api/hospitals/:id/capacity (hospital_staff of own hospital, or admin)
const updateCapacity = asyncHandler(async (req, res) => {
  const hospital = await Hospital.findById(req.params.id);
  if (!hospital) return res.status(404).json({ message: 'Hospital not found.' });

  const isAdmin = req.user.role === 'admin';
  const isOwnStaff = req.user.role === 'hospital_staff' && hospital.staff_user_id === req.user.user_id;
  if (!isAdmin && !isOwnStaff) {
    return res.status(403).json({ message: 'You can only update your own hospital capacity.' });
  }

  const {
    totalBeds, availableBeds, icuTotal, icuAvailable,
    emergencyBedsTotal, emergencyBedsAvailable, ventilatorsTotal, ventilatorsAvailable
  } = req.body;

  const values = { totalBeds, availableBeds, icuTotal, icuAvailable, emergencyBedsTotal, emergencyBedsAvailable, ventilatorsTotal, ventilatorsAvailable };
  for (const key of Object.keys(values)) {
    if (values[key] === undefined || Number.isNaN(Number(values[key])) || Number(values[key]) < 0) {
      return res.status(400).json({ message: `${key} must be a non-negative number.` });
    }
  }
  if (Number(availableBeds) > Number(totalBeds)) {
    return res.status(400).json({ message: 'Available beds cannot exceed total beds.' });
  }
  if (Number(icuAvailable) > Number(icuTotal)) {
    return res.status(400).json({ message: 'Available ICU beds cannot exceed total ICU beds.' });
  }
  if (Number(emergencyBedsAvailable) > Number(emergencyBedsTotal)) {
    return res.status(400).json({ message: 'Available emergency beds cannot exceed total emergency beds.' });
  }
  if (Number(ventilatorsAvailable) > Number(ventilatorsTotal)) {
    return res.status(400).json({ message: 'Available ventilators cannot exceed total ventilators.' });
  }

  await Hospital.updateCapacity(req.params.id, values);

  // Auto-derive a sensible hospital status from the new bed availability
  const newStatus = deriveStatusFromCapacity({ available_beds: Number(availableBeds), total_beds: Number(totalBeds) });
  if (hospital.status !== 'Temporarily Unavailable') {
    await Hospital.update(req.params.id, { status: newStatus });
  }

  const updated = await Hospital.findById(req.params.id);
  res.json({ message: 'Capacity updated.', hospital: updated });
});

module.exports = {
  getHospitals, getNearbyHospitals, getHospitalById,
  createHospital, updateHospital, deleteHospital,
  getCapacity, updateCapacity
};
