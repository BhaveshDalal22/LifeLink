-- ============================================================
-- LifeLink - Smart Emergency Healthcare Coordination Platform
-- MySQL Database Schema
-- ============================================================

DROP DATABASE IF EXISTS lifelink_db;
CREATE DATABASE lifelink_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE lifelink_db;

-- ------------------------------------------------------------
-- users
-- ------------------------------------------------------------
CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('patient','hospital_staff','ambulance_driver','admin') NOT NULL,
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_users_role (role)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- hospitals
-- ------------------------------------------------------------
CREATE TABLE hospitals (
  hospital_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  address VARCHAR(255) NOT NULL,
  area VARCHAR(120) NOT NULL,
  city VARCHAR(100) NOT NULL DEFAULT 'Bengaluru',
  state VARCHAR(100) NOT NULL DEFAULT 'Karnataka',
  latitude DECIMAL(10,7) NOT NULL,
  longitude DECIMAL(10,7) NOT NULL,
  contact VARCHAR(20) NOT NULL,
  status ENUM('Open','Limited Capacity','Full','Temporarily Unavailable') NOT NULL DEFAULT 'Open',
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  staff_user_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_hospital_staff FOREIGN KEY (staff_user_id) REFERENCES users(user_id) ON DELETE SET NULL,
  INDEX idx_hospitals_location (latitude, longitude),
  INDEX idx_hospitals_verified (verified)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- hospital_specializations
-- ------------------------------------------------------------
CREATE TABLE hospital_specializations (
  specialization_id INT AUTO_INCREMENT PRIMARY KEY,
  hospital_id INT NOT NULL,
  specialization VARCHAR(100) NOT NULL,
  CONSTRAINT fk_spec_hospital FOREIGN KEY (hospital_id) REFERENCES hospitals(hospital_id) ON DELETE CASCADE,
  INDEX idx_spec_hospital (hospital_id),
  INDEX idx_spec_name (specialization)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- hospital_capacity
-- ------------------------------------------------------------
CREATE TABLE hospital_capacity (
  capacity_id INT AUTO_INCREMENT PRIMARY KEY,
  hospital_id INT NOT NULL UNIQUE,
  total_beds INT NOT NULL DEFAULT 0,
  available_beds INT NOT NULL DEFAULT 0,
  icu_total INT NOT NULL DEFAULT 0,
  icu_available INT NOT NULL DEFAULT 0,
  emergency_beds_total INT NOT NULL DEFAULT 0,
  emergency_beds_available INT NOT NULL DEFAULT 0,
  ventilators_total INT NOT NULL DEFAULT 0,
  ventilators_available INT NOT NULL DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_capacity_hospital FOREIGN KEY (hospital_id) REFERENCES hospitals(hospital_id) ON DELETE CASCADE,
  CONSTRAINT chk_available_beds CHECK (available_beds <= total_beds),
  CONSTRAINT chk_icu CHECK (icu_available <= icu_total),
  CONSTRAINT chk_emergency_beds CHECK (emergency_beds_available <= emergency_beds_total),
  CONSTRAINT chk_ventilators CHECK (ventilators_available <= ventilators_total)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- ambulances
-- ------------------------------------------------------------
CREATE TABLE ambulances (
  ambulance_id INT AUTO_INCREMENT PRIMARY KEY,
  driver_id INT NOT NULL UNIQUE,
  ambulance_number VARCHAR(50) NOT NULL UNIQUE,
  latitude DECIMAL(10,7) NOT NULL DEFAULT 12.9716,
  longitude DECIMAL(10,7) NOT NULL DEFAULT 77.5946,
  status ENUM('Available','Requested','Assigned','On the Way','Busy','Offline') NOT NULL DEFAULT 'Offline',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_ambulance_driver FOREIGN KEY (driver_id) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_ambulance_status (status),
  INDEX idx_ambulance_location (latitude, longitude)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- emergencies
-- ------------------------------------------------------------
CREATE TABLE emergencies (
  emergency_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  patient_name VARCHAR(150) NOT NULL,
  emergency_type ENUM('Cardiac','Stroke','Road Accident','Burns','Obstetric','Pediatric','Other') NOT NULL,
  severity ENUM('Critical','Serious','Moderate') NOT NULL,
  required_resources VARCHAR(255) NOT NULL,
  latitude DECIMAL(10,7) NOT NULL,
  longitude DECIMAL(10,7) NOT NULL,
  additional_info TEXT,
  status ENUM(
    'Reported','Hospital Search','Hospital Requested','Ambulance Requested',
    'Ambulance Assigned','On the Way','Patient Picked Up','Hospital Confirmed',
    'Arrived','Completed','Cancelled'
  ) NOT NULL DEFAULT 'Reported',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_emergency_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_emergency_user (user_id),
  INDEX idx_emergency_status (status)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- hospital_requests
-- ------------------------------------------------------------
CREATE TABLE hospital_requests (
  request_id INT AUTO_INCREMENT PRIMARY KEY,
  emergency_id INT NOT NULL,
  hospital_id INT NOT NULL,
  status ENUM('Pending','Accepted','Rejected','Arrived','Cancelled') NOT NULL DEFAULT 'Pending',
  requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_hreq_emergency FOREIGN KEY (emergency_id) REFERENCES emergencies(emergency_id) ON DELETE CASCADE,
  CONSTRAINT fk_hreq_hospital FOREIGN KEY (hospital_id) REFERENCES hospitals(hospital_id) ON DELETE CASCADE,
  INDEX idx_hreq_emergency (emergency_id),
  INDEX idx_hreq_hospital (hospital_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- ambulance_requests
-- ------------------------------------------------------------
CREATE TABLE ambulance_requests (
  ambulance_request_id INT AUTO_INCREMENT PRIMARY KEY,
  emergency_id INT NOT NULL,
  ambulance_id INT NOT NULL,
  status ENUM(
    'Requested','Accepted','On the Way','Arrived at Patient Location',
    'Patient Picked Up','Arrived at Hospital','Completed','Cancelled'
  ) NOT NULL DEFAULT 'Requested',
  requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_areq_emergency FOREIGN KEY (emergency_id) REFERENCES emergencies(emergency_id) ON DELETE CASCADE,
  CONSTRAINT fk_areq_ambulance FOREIGN KEY (ambulance_id) REFERENCES ambulances(ambulance_id) ON DELETE CASCADE,
  INDEX idx_areq_emergency (emergency_id),
  INDEX idx_areq_ambulance (ambulance_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- notifications
-- ------------------------------------------------------------
CREATE TABLE notifications (
  notification_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  message VARCHAR(500) NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_notif_user (user_id, is_read)
) ENGINE=InnoDB;
