-- 006: distritos de Lima como regiones de organización + campaña municipal
-- Idempotente. parent_code 'LIM' ya existe en organization.regions (seed_data.py).

INSERT INTO organization.regions (code, name, parent_code) VALUES
('150101','Cercado de Lima','LIM'),('150102','Ancón','LIM'),('150103','Ate','LIM'),('150104','Barranco','LIM'),
('150105','Breña','LIM'),('150106','Carabayllo','LIM'),('150107','Chaclacayo','LIM'),('150108','Chorrillos','LIM'),
('150109','Cieneguilla','LIM'),('150110','Comas','LIM'),('150111','El Agustino','LIM'),('150112','Independencia','LIM'),
('150113','Jesús María','LIM'),('150114','La Molina','LIM'),('150115','La Victoria','LIM'),('150116','Lince','LIM'),
('150117','Los Olivos','LIM'),('150118','Lurigancho-Chosica','LIM'),('150119','Lurín','LIM'),('150120','Magdalena del Mar','LIM'),
('150121','Pueblo Libre','LIM'),('150122','Miraflores','LIM'),('150123','Pachacámac','LIM'),('150124','Pucusana','LIM'),
('150125','Puente Piedra','LIM'),('150126','Punta Hermosa','LIM'),('150127','Punta Negra','LIM'),('150128','Rímac','LIM'),
('150129','San Bartolo','LIM'),('150130','San Borja','LIM'),('150131','San Isidro','LIM'),('150132','San Juan de Lurigancho','LIM'),
('150133','San Juan de Miraflores','LIM'),('150134','San Luis','LIM'),('150135','San Martín de Porres','LIM'),('150136','San Miguel','LIM'),
('150137','Santa Anita','LIM'),('150138','Santa María del Mar','LIM'),('150139','Santa Rosa','LIM'),('150140','Santiago de Surco','LIM'),
('150141','Surquillo','LIM'),('150142','Villa El Salvador','LIM'),('150143','Villa María del Triunfo','LIM')
ON CONFLICT (code) DO NOTHING;

-- Campaña municipal. party_id: el partido de OWN_CANDIDATE si existe en organization.parties; si no, el primero (placeholder).
INSERT INTO organization.campaigns (tenant_id, party_id, name, description, election, start_date, end_date, status, region_code, objective, budget)
SELECT t.id,
       COALESCE((SELECT id FROM organization.parties WHERE slug = %(own_party_slug)s LIMIT 1), (SELECT id FROM organization.parties LIMIT 1)),
       'Lima Metropolitana 2026',
       'Campaña municipal de Lima Metropolitana — ERM 2026 (4 de octubre de 2026)',
       'municipal', DATE '2026-08-21', DATE '2026-10-04', 'active', '1501', 'mobilization', 0
FROM identity.tenants t
WHERE t.slug IN ('politica-pe', 'politicape')
  AND NOT EXISTS (SELECT 1 FROM organization.campaigns WHERE name = 'Lima Metropolitana 2026')
LIMIT 1;

-- NOTA para el runner: este archivo usa el parametro %(own_party_slug)s (formato pyformat de psycopg2).
-- scripts/apply_migrations.py lo pasa con conn.exec_driver_sql(sql, {"own_party_slug": os.getenv("OWN_PARTY_SLUG", "")}).
