-- ============================================================
-- EcoLog Solutions — Seed Data v1.0
-- Run AFTER schema.sql
-- ============================================================

USE ecolog_db;

-- ============================================================
-- USERS (passwords are bcrypt of "password123")
-- ============================================================
INSERT INTO users (name, email, password_hash, role, company, phone, is_active, green_score) VALUES
('Sarah Admin',    'admin@ecolog.fr',        '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin',   'EcoLog Solutions', '+33600000001', 1, 99),
('Marie Leblanc',  'shipper@ecolog.fr',      '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'shipper', 'DistriVert',       '+33600000002', 1, 82),
('Jean Dupont',    'carrier@ecolog.fr',      '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'carrier', 'EcoTrans SAS',     '+33600000003', 1, 94),
('Claire Bonnet',  'client@ecolog.fr',       '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'client',  'Retail Plus',      '+33600000004', 1, 76),
('Paul Carrier2',  'carrier2@ecolog.fr',     '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'carrier', 'RailGreen Express','+33600000005', 1, 87);

-- ============================================================
-- VEHICLES (carrier_id = 3 = Jean Dupont, id=5 = Paul)
-- ============================================================
INSERT INTO vehicles (carrier_id, name, energy_type, capacity_tons, emission_factor) VALUES
(3, 'Mercedes eActros',    'electric', 18.0,  7.0),
(3, 'Volvo FH Electric',   'electric', 26.0,  7.0),
(3, 'Iveco Daily GNV',     'biogas',    3.5, 40.0),
(5, 'Alstom Coradia Rail', 'rail',     80.0, 18.0),
(5, 'Renault Trucks E-Tech','electric', 16.0,  7.0);

-- ============================================================
-- SHIPMENTS
-- ============================================================
INSERT INTO shipments (reference, shipper_id, client_id, carrier_id, origin, destination, weight_kg, volume_m3, status, deadline) VALUES
('EXP-0247', 2, 4, 3, 'Paris 75001',      'Lyon 69001',      5000.00, 12.50, 'IN_PROGRESS', '2026-05-01 18:00:00'),
('EXP-0246', 2, 4, 5, 'Marseille 13001',  'Bordeaux 33000',  3200.00,  8.00, 'ASSIGNED',    '2026-05-02 12:00:00'),
('EXP-0245', 2, 4, 3, 'Lille 59000',      'Strasbourg 67000',7000.00, 20.00, 'DELIVERED',   '2026-04-27 18:00:00');

UPDATE shipments SET delivered_at = '2026-04-27 17:30:00' WHERE reference = 'EXP-0245';

-- ============================================================
-- ROUTES  (distance approximations in km)
-- ============================================================
INSERT INTO routes (shipment_id, distance_km, transport_mode, vehicle_type, duration_min, origin_lat, origin_lng, dest_lat, dest_lng) VALUES
(1, 465.0, 'road',  'electric', 270, 48.8566,  2.3522, 45.7640,  4.8357),
(2, 642.0, 'road',  'diesel',   380, 43.2965,  5.3698, 44.8378, -0.5792),
(3, 525.0, 'rail',  'rail',     210, 50.6292,  3.0573, 48.5734,  7.7521);

-- ============================================================
-- CARBON FOOTPRINTS
-- CO2 = distance_km × weight_tons × emission_factor / 1000
-- EXP-0247: 465 * 5 * 7 / 1000 = 16.275 kg
-- EXP-0246: 642 * 3.2 * 62 / 1000 = 127.334 kg  (diesel)
-- EXP-0245: 525 * 7 * 18 / 1000 = 66.15 kg
-- ============================================================
INSERT INTO carbon_footprints (shipment_id, co2_kg, emission_factor, distance_km, weight_tons) VALUES
(1, 16.2750, 7.0,  465.0, 5.0000),
(2, 127.3344, 62.0, 642.0, 3.2000),
(3, 66.1500, 18.0, 525.0, 7.0000);

-- ============================================================
-- GPS UPDATES (for EXP-0247 in transit)
-- ============================================================
INSERT INTO gps_updates (shipment_id, latitude, longitude, location_label, progress_pct) VALUES
(1, 48.8566, 2.3522, 'Paris - Départ',      0),
(1, 48.2833, 2.9667, 'Fontainebleau A6',   15),
(1, 47.8000, 3.5833, 'Auxerre A6',         35),
(1, 46.9000, 4.2000, 'Chalon-sur-Saône',   60),
(1, 46.2000, 4.5000, 'Mâcon',              72);

-- ============================================================
-- COMPENSATIONS
-- ============================================================
INSERT INTO compensations (shipment_id, user_id, tons_compensated, price_eur, project_name, certification, certificate_url) VALUES
(3, 2, 0.0662, 1.19, 'Reforestation Amazonie', 'Gold Standard',   '/certificates/CERT-EXP0245.pdf'),
(NULL, 2, 2.0000, 36.00,'Parc Solaire Sahel',    'VCS Verra',       '/certificates/CERT-BULK-001.pdf');

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
INSERT INTO notifications (user_id, type, message, is_read) VALUES
(2, 'shipment_created',   'Expédition EXP-0247 créée avec succès. CO2 estimé: 16.28 kg', 1),
(3, 'mission_assigned',   'Nouvelle mission disponible: EXP-0247 Paris → Lyon',           0),
(4, 'status_update',      'Votre commande EXP-0247 est en cours de livraison',             0),
(2, 'shipment_created',   'Expédition EXP-0246 créée avec succès. CO2 estimé: 127.33 kg', 1),
(5, 'mission_assigned',   'Nouvelle mission disponible: EXP-0246 Marseille → Bordeaux',   0),
(2, 'delivery_completed', 'Expédition EXP-0245 livrée. Documents disponibles.',            1),
(1, 'system',             'Nouveau transporteur en attente de validation',                  0);

-- ============================================================
-- DOCUMENTS
-- ============================================================
INSERT INTO documents (shipment_id, type, file_url, uploaded_by) VALUES
(1, 'CMR',          '/docs/CMR-EXP-0247.pdf',         2),
(3, 'BON_LIVRAISON','/docs/BL-EXP-0245.pdf',          3),
(3, 'FACTURE',      '/docs/FACT-EXP-0245.pdf',         2),
(3, 'CERTIFICAT_CO2','/certificates/CERT-EXP0245.pdf', 2);

-- ============================================================
-- AUDIT LOGS
-- ============================================================
INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES
(2, 'CREATE_SHIPMENT',    'shipment', 1, 'Expédition EXP-0247 créée'),
(3, 'ACCEPT_MISSION',     'shipment', 1, 'Mission acceptée par Jean Dupont'),
(2, 'BUY_CREDITS',        'compensation', 1, 'Achat 2t CO2 crédits carbone'),
(1, 'USER_LOGIN',         'user', 1, 'Connexion administrateur'),
(3, 'UPDATE_STATUS',      'shipment', 1, 'Statut → IN_PROGRESS'),
(2, 'CREATE_SHIPMENT',    'shipment', 2, 'Expédition EXP-0246 créée'),
(5, 'ACCEPT_MISSION',     'shipment', 2, 'Mission acceptée par Paul Carrier2');
