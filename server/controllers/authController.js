const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Hospital = require('../models/Hospital');
const Ambulance = require('../models/Ambulance');
const { asyncHandler } = require('../utils/asyncHandler');

const ALLOWED_REGISTER_ROLES = ['patient', 'hospital_staff', 'ambulance_driver'];

function signToken(user) {
  return jwt.sign(
    { user_id: user.user_id, role: user.role, name: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone, ambulanceNumber } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'name, email, password and role are required.' });
  }
  if (!ALLOWED_REGISTER_ROLES.includes(role)) {
    return res.status(400).json({ message: 'Invalid role. Admin accounts cannot be self-registered.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters.' });
  }

  const existing = await User.findByEmail(email);
  if (existing) {
    return res.status(409).json({ message: 'An account with this email already exists.' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const userId = await User.create({ name, email, passwordHash, role, phone });

  // Ambulance drivers get a placeholder ambulance record so they appear in the fleet immediately.
  if (role === 'ambulance_driver') {
    const number = ambulanceNumber && ambulanceNumber.trim() ? ambulanceNumber.trim() : `KA-01-TEMP-${userId}`;
    await Ambulance.create({ driverId: userId, ambulanceNumber: number, latitude: 12.9716, longitude: 77.5946 });
  }

  const user = { user_id: userId, name, email, role };
  const token = signToken(user);
  res.status(201).json({ message: 'Registration successful.', token, user });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const user = await User.findByEmail(email);
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const token = signToken(user);

  let extra = {};
  if (user.role === 'hospital_staff') {
    const hospital = await Hospital.findByStaffUserId(user.user_id);
    extra.hospital_id = hospital ? hospital.hospital_id : null;
  }
  if (user.role === 'ambulance_driver') {
    const ambulance = await Ambulance.findByDriverId(user.user_id);
    extra.ambulance_id = ambulance ? ambulance.ambulance_id : null;
  }

  res.json({
    message: 'Login successful.',
    token,
    user: { user_id: user.user_id, name: user.name, email: user.email, role: user.role, phone: user.phone, ...extra }
  });
});

// GET /api/auth/me
const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.user_id);
  if (!user) return res.status(404).json({ message: 'User not found.' });

  let extra = {};
  if (user.role === 'hospital_staff') {
    const hospital = await Hospital.findByStaffUserId(user.user_id);
    extra.hospital_id = hospital ? hospital.hospital_id : null;
  }
  if (user.role === 'ambulance_driver') {
    const ambulance = await Ambulance.findByDriverId(user.user_id);
    extra.ambulance_id = ambulance ? ambulance.ambulance_id : null;
  }
  res.json({ user: { ...user, ...extra } });
});

module.exports = { register, login, me };
