import React from 'react';
import { Routes, Route } from 'react-router-dom';

import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Public pages
import Home from './pages/public/Home';
import About from './pages/public/About';
import FindHospitalPublic from './pages/public/FindHospitalPublic';
import ReportEmergencyPublic from './pages/public/ReportEmergencyPublic';
import AmbulanceInfo from './pages/public/AmbulanceInfo';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import NotFound from './pages/NotFound';

// Patient pages
import PatientDashboard from './pages/patient/Dashboard';
import ReportEmergency from './pages/patient/ReportEmergency';
import FindHospitals from './pages/patient/FindHospitals';
import HospitalDetails from './pages/patient/HospitalDetails';
import RequestAmbulance from './pages/patient/RequestAmbulance';
import EmergencyTracking from './pages/patient/EmergencyTracking';
import EmergencyHistory from './pages/patient/EmergencyHistory';
import PatientProfile from './pages/patient/Profile';

// Hospital staff pages
import HospitalDashboard from './pages/hospital/Dashboard';
import UpdateCapacity from './pages/hospital/UpdateCapacity';
import IncomingRequests from './pages/hospital/IncomingRequests';
import RequestDetails from './pages/hospital/RequestDetails';
import HospitalProfile from './pages/hospital/HospitalProfile';

// Ambulance driver pages
import AmbulanceDashboard from './pages/ambulance/Dashboard';
import DriverProfile from './pages/ambulance/DriverProfile';
import AmbulanceAvailability from './pages/ambulance/AmbulanceAvailability';
import AssignedEmergency from './pages/ambulance/AssignedEmergency';
import TripStatus from './pages/ambulance/TripStatus';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageHospitals from './pages/admin/ManageHospitals';
import AddHospital from './pages/admin/AddHospital';
import ManageAmbulances from './pages/admin/ManageAmbulances';
import ManageEmergencies from './pages/admin/ManageEmergencies';
import Reports from './pages/admin/Reports';

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/find-hospital" element={<FindHospitalPublic />} />
        <Route path="/report-emergency" element={<ReportEmergencyPublic />} />
        <Route path="/ambulance-info" element={<AmbulanceInfo />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Patient routes */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['patient']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/patient/dashboard" element={<PatientDashboard />} />
        <Route path="/patient/report-emergency" element={<ReportEmergency />} />
        <Route path="/patient/find-hospitals" element={<FindHospitals />} />
        <Route path="/patient/hospitals/:id" element={<HospitalDetails />} />
        <Route path="/patient/request-ambulance" element={<RequestAmbulance />} />
        <Route path="/patient/tracking/:id" element={<EmergencyTracking />} />
        <Route path="/patient/emergency-history" element={<EmergencyHistory />} />
        <Route path="/patient/profile" element={<PatientProfile />} />
      </Route>

      {/* Hospital staff routes */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['hospital_staff']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/hospital/dashboard" element={<HospitalDashboard />} />
        <Route path="/hospital/capacity" element={<UpdateCapacity />} />
        <Route path="/hospital/requests" element={<IncomingRequests />} />
        <Route path="/hospital/requests/:id" element={<RequestDetails />} />
        <Route path="/hospital/profile" element={<HospitalProfile />} />
      </Route>

      {/* Ambulance driver routes */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['ambulance_driver']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/ambulance/dashboard" element={<AmbulanceDashboard />} />
        <Route path="/ambulance/profile" element={<DriverProfile />} />
        <Route path="/ambulance/availability" element={<AmbulanceAvailability />} />
        <Route path="/ambulance/assigned" element={<AssignedEmergency />} />
        <Route path="/ambulance/trip-status" element={<TripStatus />} />
      </Route>

      {/* Admin routes */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<ManageUsers />} />
        <Route path="/admin/hospitals" element={<ManageHospitals />} />
        <Route path="/admin/hospitals/add" element={<AddHospital />} />
        <Route path="/admin/ambulances" element={<ManageAmbulances />} />
        <Route path="/admin/emergencies" element={<ManageEmergencies />} />
        <Route path="/admin/reports" element={<Reports />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
