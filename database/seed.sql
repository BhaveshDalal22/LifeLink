-- ============================================================
-- LifeLink - Demo / Seed Data
-- All demo accounts use password: Demo@123
-- (bcrypt hash below corresponds to this password)
-- NOTE: Hospitals and users below are FICTIONAL DEMO DATA for
-- development/college-project demonstration purposes only.
-- They are not real, verified healthcare providers.
-- ============================================================

USE lifelink_db;

SET @pw := '$2b$10$P/unMic0YkzVCwPm9z4dleE/MVmt9ZxXUt/srqjxRGbiVoDdH9aPi';

-- ------------------------------------------------------------
-- USERS
-- ------------------------------------------------------------
INSERT INTO users (name, email, password_hash, role, phone) VALUES
('Admin User', 'admin@lifelink.com', @pw, 'admin', '9900000000'),
('Arjun Rao', 'patient1@lifelink.com', @pw, 'patient', '9900000001'),
('Divya Shetty', 'patient2@lifelink.com', @pw, 'patient', '9900000002'),
('Dr. Kavita Nair', 'staff.yelahanka@lifelink.com', @pw, 'hospital_staff', '9900000010'),
('Dr. Rohan Mehta', 'staff.hebbal@lifelink.com', @pw, 'hospital_staff', '9900000011'),
('Dr. Sneha Iyer', 'staff.indiranagar@lifelink.com', @pw, 'hospital_staff', '9900000012'),
('Dr. Vikram Sen', 'staff.whitefield@lifelink.com', @pw, 'hospital_staff', '9900000013'),
('Dr. Anitha Reddy', 'staff.electroniccity@lifelink.com', @pw, 'hospital_staff', '9900000014'),
('Suresh Kumar', 'driver1@lifelink.com', @pw, 'ambulance_driver', '9900000020'),
('Manjunath G', 'driver2@lifelink.com', @pw, 'ambulance_driver', '9900000021'),
('Ravi Prasad', 'driver3@lifelink.com', @pw, 'ambulance_driver', '9900000022'),
('Lokesh N', 'driver4@lifelink.com', @pw, 'ambulance_driver', '9900000023'),
('Prakash M', 'driver5@lifelink.com', @pw, 'ambulance_driver', '9900000024');

-- ------------------------------------------------------------
-- HOSPITALS (demo data, Bengaluru)
-- ------------------------------------------------------------
INSERT INTO hospitals (name, address, area, city, state, latitude, longitude, contact, status, verified, staff_user_id) VALUES
('Bengaluru Emergency Care Hospital', '12 Airport Road', 'Yelahanka', 'Bengaluru', 'Karnataka', 13.1007, 77.5963, '080-41234501', 'Open', TRUE, 4),
('CityCare Trauma Hospital', '45 Ring Road', 'Hebbal', 'Bengaluru', 'Karnataka', 13.0355, 77.5910, '080-41234502', 'Open', TRUE, 5),
('Metro Life Hospital', '78 100 Feet Road', 'Indiranagar', 'Bengaluru', 'Karnataka', 12.9719, 77.6412, '080-41234503', 'Limited Capacity', TRUE, 6),
('Whitefield Emergency Centre', '23 ITPL Main Road', 'Whitefield', 'Bengaluru', 'Karnataka', 12.9698, 77.7500, '080-41234504', 'Open', TRUE, 7),
('South Bengaluru Medical Centre', '56 Hosur Road', 'Electronic City', 'Bengaluru', 'Karnataka', 12.8452, 77.6602, '080-41234505', 'Open', TRUE, 8);

-- ------------------------------------------------------------
-- HOSPITAL SPECIALIZATIONS
-- ------------------------------------------------------------
INSERT INTO hospital_specializations (hospital_id, specialization) VALUES
(1, 'Cardiology'), (1, 'Trauma Care'), (1, 'Pediatrics'),
(2, 'Trauma Care'), (2, 'Neurology'), (2, 'Burn Unit'),
(3, 'Cardiology'), (3, 'Obstetrics'), (3, 'Neurology'),
(4, 'Trauma Care'), (4, 'Burn Unit'), (4, 'Pediatrics'),
(5, 'Obstetrics'), (5, 'Cardiology'), (5, 'Trauma Care');

-- ------------------------------------------------------------
-- HOSPITAL CAPACITY
-- ------------------------------------------------------------
INSERT INTO hospital_capacity
(hospital_id, total_beds, available_beds, icu_total, icu_available, emergency_beds_total, emergency_beds_available, ventilators_total, ventilators_available) VALUES
(1, 120, 34, 20, 6, 15, 5, 10, 4),
(2, 90, 12, 15, 2, 12, 3, 8, 1),
(3, 150, 8, 25, 1, 18, 2, 12, 0),
(4, 100, 46, 18, 9, 14, 8, 9, 6),
(5, 80, 29, 12, 4, 10, 4, 6, 3);

-- ------------------------------------------------------------
-- AMBULANCES
-- ------------------------------------------------------------
INSERT INTO ambulances (driver_id, ambulance_number, latitude, longitude, status) VALUES
(9, 'KA-01-AB-1234', 13.0500, 77.5900, 'Available'),
(10, 'KA-01-AC-5678', 12.9800, 77.6100, 'Available'),
(11, 'KA-01-AD-9012', 12.9600, 77.7300, 'Available'),
(12, 'KA-01-AE-3456', 12.8600, 77.6500, 'Offline'),
(13, 'KA-01-AF-7890', 13.0100, 77.5700, 'Available');
