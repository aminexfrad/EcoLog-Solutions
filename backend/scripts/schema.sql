-- ============================================================
-- EcoLog Solutions — Database Schema v1.0
-- Engine: MySQL (WAMP)
-- ============================================================

CREATE DATABASE IF NOT EXISTS ecolog_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE ecolog_db;

-- ============================================================
-- 1. USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(120)  NOT NULL,
  email         VARCHAR(180)  NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  role          ENUM('admin','shipper','carrier','client') NOT NULL DEFAULT 'client',
  company       VARCHAR(150),
  phone         VARCHAR(30),
  is_active     TINYINT(1)    NOT NULL DEFAULT 1,
  green_score   TINYINT UNSIGNED DEFAULT 0,
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- 2. VEHICLES  (fleet managed per carrier)
-- ============================================================
CREATE TABLE IF NOT EXISTS vehicles (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  carrier_id    INT UNSIGNED  NOT NULL,
  name          VARCHAR(120)  NOT NULL,
  energy_type   ENUM('diesel','electric','biogas','rail','hybrid') NOT NULL,
  capacity_tons DECIMAL(8,2)  NOT NULL,
  emission_factor DECIMAL(8,4) NOT NULL COMMENT 'g CO2 / t.km',
  is_active     TINYINT(1)    NOT NULL DEFAULT 1,
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (carrier_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- 3. SHIPMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS shipments (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  reference     VARCHAR(20)   NOT NULL UNIQUE,
  shipper_id    INT UNSIGNED  NOT NULL,
  client_id     INT UNSIGNED,
  carrier_id    INT UNSIGNED,
  origin        VARCHAR(200)  NOT NULL,
  destination   VARCHAR(200)  NOT NULL,
  weight_kg     DECIMAL(10,2) NOT NULL,
  volume_m3     DECIMAL(10,2),
  status        ENUM('PENDING','ASSIGNED','IN_PROGRESS','DELIVERED','CANCELLED') NOT NULL DEFAULT 'PENDING',
  deadline      DATETIME,
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  delivered_at  DATETIME,
  FOREIGN KEY (shipper_id) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (carrier_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================
-- 4. ROUTES
-- ============================================================
CREATE TABLE IF NOT EXISTS routes (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  shipment_id     INT UNSIGNED NOT NULL UNIQUE,
  distance_km     DECIMAL(10,2) NOT NULL,
  transport_mode  ENUM('road','rail','multimodal') NOT NULL DEFAULT 'road',
  vehicle_type    ENUM('diesel','electric','biogas','rail','hybrid') NOT NULL DEFAULT 'diesel',
  duration_min    INT UNSIGNED,
  origin_lat      DECIMAL(10,7),
  origin_lng      DECIMAL(10,7),
  dest_lat        DECIMAL(10,7),
  dest_lng        DECIMAL(10,7),
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (shipment_id) REFERENCES shipments(id) ON DELETE CASCADE
);

-- ============================================================
-- 5. CARBON FOOTPRINTS
-- ============================================================
CREATE TABLE IF NOT EXISTS carbon_footprints (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  shipment_id     INT UNSIGNED NOT NULL UNIQUE,
  co2_kg          DECIMAL(10,4) NOT NULL,
  emission_factor DECIMAL(8,4) NOT NULL COMMENT 'g CO2 / t.km used',
  distance_km     DECIMAL(10,2) NOT NULL,
  weight_tons     DECIMAL(10,4) NOT NULL,
  methodology     VARCHAR(80)   NOT NULL DEFAULT 'ADEME/GHG-Protocol',
  calculated_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (shipment_id) REFERENCES shipments(id) ON DELETE CASCADE
);

-- ============================================================
-- 6. COMPENSATIONS (Carbon Credit Purchases)
-- ============================================================
CREATE TABLE IF NOT EXISTS compensations (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  shipment_id      INT UNSIGNED,
  user_id          INT UNSIGNED NOT NULL,
  tons_compensated DECIMAL(10,4) NOT NULL,
  price_eur        DECIMAL(10,2) NOT NULL,
  project_name     VARCHAR(200) NOT NULL DEFAULT 'Reforestation Amazonie',
  certification    VARCHAR(80)  NOT NULL DEFAULT 'Gold Standard',
  certificate_url  VARCHAR(500),
  created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (shipment_id) REFERENCES shipments(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
);

-- ============================================================
-- 7. NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NOT NULL,
  type        VARCHAR(60)  NOT NULL DEFAULT 'info',
  message     TEXT         NOT NULL,
  is_read     TINYINT(1)   NOT NULL DEFAULT 0,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- 8. GPS UPDATES
-- ============================================================
CREATE TABLE IF NOT EXISTS gps_updates (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  shipment_id  INT UNSIGNED NOT NULL,
  latitude     DECIMAL(10,7) NOT NULL,
  longitude    DECIMAL(10,7) NOT NULL,
  location_label VARCHAR(200),
  progress_pct TINYINT UNSIGNED DEFAULT 0,
  recorded_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (shipment_id) REFERENCES shipments(id) ON DELETE CASCADE
);

-- ============================================================
-- 9. DOCUMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS documents (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  shipment_id  INT UNSIGNED NOT NULL,
  type         ENUM('CMR','BON_LIVRAISON','FACTURE','CERTIFICAT_CO2','PREUVE') NOT NULL,
  file_url     VARCHAR(500),
  uploaded_by  INT UNSIGNED NOT NULL,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (shipment_id) REFERENCES shipments(id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE RESTRICT
);

-- ============================================================
-- 10. AUDIT LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED,
  action      VARCHAR(100) NOT NULL,
  entity_type VARCHAR(60),
  entity_id   INT UNSIGNED,
  ip_address  VARCHAR(45),
  details     TEXT,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX idx_shipments_shipper   ON shipments(shipper_id);
CREATE INDEX idx_shipments_client   ON shipments(client_id);
CREATE INDEX idx_shipments_carrier   ON shipments(carrier_id);
CREATE INDEX idx_shipments_status    ON shipments(status);
CREATE INDEX idx_notifications_user  ON notifications(user_id, is_read);
CREATE INDEX idx_gps_shipment        ON gps_updates(shipment_id, recorded_at);
CREATE INDEX idx_carbon_shipment     ON carbon_footprints(shipment_id);
CREATE INDEX idx_compensations_user  ON compensations(user_id);
CREATE INDEX idx_audit_user          ON audit_logs(user_id, created_at);
CREATE INDEX idx_documents_shipment  ON documents(shipment_id);
CREATE INDEX idx_vehicles_carrier    ON vehicles(carrier_id);
