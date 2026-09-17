// Rule-based hospital recommendation scoring (NOT machine learning).
// Combines specialization match, resource availability, and distance
// into a single illustrative score used to rank hospitals for an emergency.

const { haversineDistance } = require('./haversine');

// Emergency type -> required specialization mapping
const EMERGENCY_SPECIALIZATION_MAP = {
  Cardiac: 'Cardiology',
  Stroke: 'Neurology',
  'Road Accident': 'Trauma Care',
  Burns: 'Burn Unit',
  Obstetric: 'Obstetrics',
  Pediatric: 'Pediatrics',
  Other: null
};

// resource keys as sent from the client / stored as comma list
const RESOURCE_FIELD_MAP = {
  'General Bed': { total: 'total_beds', available: 'available_beds' },
  'ICU Bed': { total: 'icu_total', available: 'icu_available' },
  'Emergency Bed': { total: 'emergency_beds_total', available: 'emergency_beds_available' },
  Ventilator: { total: 'ventilators_total', available: 'ventilators_available' },
  Specialist: null // handled via specialization match only
};

function scoreHospital(hospital, emergencyType, requiredResources, patientLat, patientLng) {
  let score = 0;

  // ---- Specialization match: up to 50 points ----
  const neededSpecialization = EMERGENCY_SPECIALIZATION_MAP[emergencyType];
  const specializations = hospital.specializations || [];
  const specializationMatch = neededSpecialization
    ? specializations.includes(neededSpecialization)
    : false;
  if (specializationMatch) score += 50;
  else if (!neededSpecialization) score += 25; // "Other" - partial credit, no hard requirement

  // ---- Resource availability: up to 30 points ----
  const resources = (requiredResources || '').split(',').map((r) => r.trim()).filter(Boolean);
  let resourcePoints = 0;
  let resourceChecks = 0;
  resources.forEach((res) => {
    const fields = RESOURCE_FIELD_MAP[res];
    if (!fields) return;
    resourceChecks += 1;
    const available = Number(hospital[fields.available] || 0);
    if (available > 0) resourcePoints += 1;
  });
  const resourceScore = resourceChecks > 0 ? (resourcePoints / resourceChecks) * 30 : 15;
  score += resourceScore;

  // ---- Distance: up to 20 points (closer = more points, max considered 30km) ----
  const distance = haversineDistance(patientLat, patientLng, hospital.latitude, hospital.longitude);
  const MAX_DISTANCE = 30;
  const distanceScore = Math.max(0, (1 - Math.min(distance, MAX_DISTANCE) / MAX_DISTANCE) * 20);
  score += distanceScore;

  return {
    score: Math.round(score * 100) / 100,
    distance,
    specializationMatch
  };
}

function rankHospitals(hospitals, emergencyType, requiredResources, patientLat, patientLng) {
  return hospitals
    .map((hospital) => {
      const { score, distance, specializationMatch } = scoreHospital(
        hospital, emergencyType, requiredResources, patientLat, patientLng
      );
      return { ...hospital, matchScore: score, distanceKm: distance, specializationMatch };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
}

module.exports = { EMERGENCY_SPECIALIZATION_MAP, scoreHospital, rankHospitals };
