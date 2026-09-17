export const BENGALURU_CENTER = { lat: 12.9716, lng: 77.5946 };

export const EMERGENCY_TYPES = ['Cardiac', 'Stroke', 'Road Accident', 'Burns', 'Obstetric', 'Pediatric', 'Other'];

export const SEVERITY_LEVELS = ['Critical', 'Serious', 'Moderate'];

export const REQUIRED_RESOURCES = ['General Bed', 'ICU Bed', 'Emergency Bed', 'Ventilator', 'Specialist'];

export const SPECIALIZATIONS = [
  'Cardiology', 'Neurology', 'Trauma Care', 'Burn Unit', 'Obstetrics', 'Pediatrics', 'General Medicine'
];

export const EMERGENCY_TYPE_TO_SPECIALIZATION = {
  Cardiac: 'Cardiology',
  Stroke: 'Neurology',
  'Road Accident': 'Trauma Care',
  Burns: 'Burn Unit',
  Obstetric: 'Obstetrics',
  Pediatric: 'Pediatrics'
};

export const HOSPITAL_STATUSES = ['Open', 'Limited Capacity', 'Full', 'Temporarily Unavailable'];

export const AMBULANCE_STATUSES = ['Available', 'Requested', 'Assigned', 'On the Way', 'Busy', 'Offline'];

export const TRIP_STATUS_FLOW = [
  'Requested', 'Accepted', 'On the Way', 'Arrived at Patient Location',
  'Patient Picked Up', 'Arrived at Hospital', 'Completed'
];

export const EMERGENCY_STATUS_FLOW = [
  'Reported', 'Hospital Search', 'Hospital Requested', 'Ambulance Requested',
  'Ambulance Assigned', 'On the Way', 'Patient Picked Up', 'Hospital Confirmed',
  'Arrived', 'Completed', 'Cancelled'
];

export const ROLE_DASHBOARD_PATH = {
  patient: '/patient/dashboard',
  hospital_staff: '/hospital/dashboard',
  ambulance_driver: '/ambulance/dashboard',
  admin: '/admin/dashboard'
};
