-- Limpiar tablas (desactiva restricciones temporales)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE ShipmentStatusHistory;
TRUNCATE TABLE Shipment;
TRUNCATE TABLE Route;
TRUNCATE TABLE Carrier;
TRUNCATE TABLE User;
SET FOREIGN_KEY_CHECKS = 1;

--Usuarios
INSERT INTO User (userName, email, password, role, createdAt) VALUES
('admin', 'admin@correo.com', '$2b$10$47d0upKP4.6OaCVPZfktkObNGLQpHd/UPAwJZWeSMQQIPPlqZYV6e', 'admin', NOW()),
('cliente1', 'cliente1@correo.com', '$2b$10$7b7j6/8KXxvQnmm7BgdVBOIZ3zomBMHJ0K2oS4N4hGpFYmM3aDw3G', 'user', NOW());

--Transportistas (Carrier)
INSERT INTO Carrier (nombre, disponible) VALUES
('Pedro Martínez', true),
('Laura Gómez', true),
('Andrés Torres', false);

-- Rutas (Route)
INSERT INTO Route (origen, destino, capacidad, carrierId) VALUES
('Bogotá', 'Medellín', 100, 1),
('Cali', 'Barranquilla', 80, 2),
('Bucaramanga', 'Cúcuta', 50, 3);

--Envíos (Shipment)
INSERT INTO Shipment (peso, dimensiones, tipoProducto, direccion, estado, userId, routeId, createdAt) VALUES
(5.5, '20x20x20', 'Electrónica', 'Calle 123 #45-67, Bogotá', 'En espera', 2, NULL, NOW()),
(2.3, '15x15x10', 'Ropa', 'Carrera 10 #50-30, Medellín', 'En tránsito', 2, 1, NOW()),
(10.0, '50x40x30', 'Muebles', 'Calle 80 #25-10, Cali', 'Entregado', 2, 2, NOW());

--Historial de estados (ShipmentStatusHistory)
INSERT INTO ShipmentStatusHistory (shipmentId, estado, timestamp) VALUES
(1, 'En espera', NOW()),
(2, 'En espera', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(2, 'En tránsito', NOW()),
(3, 'En espera', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(3, 'En tránsito', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(3, 'Entregado', NOW());
