const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const hospitalRoutes = require('./routes/hospitalRoutes');
const emergencyRoutes = require('./routes/emergencyRoutes');
const hospitalRequestRoutes = require('./routes/hospitalRequestRoutes');
const ambulanceRoutes = require('./routes/ambulanceRoutes');
const adminRoutes = require('./routes/adminRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// ---- Core middleware ----
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---- Health check ----
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'LifeLink API', time: new Date().toISOString() });
});

// ---- Routes ----
app.use('/api/auth', authRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/emergencies', emergencyRoutes);
app.use('/api/hospital-requests', hospitalRequestRoutes);
app.use('/api', ambulanceRoutes); // exposes /api/ambulances* and /api/ambulance-requests*
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// ---- 404 + error handling ----
app.use(notFound);
app.use(errorHandler);

module.exports = app;
