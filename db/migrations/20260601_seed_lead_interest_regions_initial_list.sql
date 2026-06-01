INSERT INTO lead_interest_regions
  (name, is_active, sort_order, created_at, updated_at)
SELECT
  official_region.name,
  1,
  official_region.sort_order,
  NOW(),
  NOW()
FROM (
  SELECT 'Itaquera' AS name, 10 AS sort_order
  UNION ALL SELECT 'Guaianases', 20
  UNION ALL SELECT 'Itaim Paulista', 30
  UNION ALL SELECT 'São Miguel Paulista', 40
  UNION ALL SELECT 'Artur Alvim', 50
  UNION ALL SELECT 'Cidade Tiradentes', 60
  UNION ALL SELECT 'José Bonifácio', 70
  UNION ALL SELECT 'São Mateus', 80
  UNION ALL SELECT 'São Rafael', 90
  UNION ALL SELECT 'Iguatemi', 100
  UNION ALL SELECT 'Ermelino Matarazzo', 110
  UNION ALL SELECT 'Ponte Rasa', 120
  UNION ALL SELECT 'Cangaíba', 130
  UNION ALL SELECT 'Penha', 140
  UNION ALL SELECT 'Vila Matilde', 150
  UNION ALL SELECT 'Tatuapé', 160
  UNION ALL SELECT 'Carrão', 170
  UNION ALL SELECT 'Vila Formosa', 180
  UNION ALL SELECT 'Aricanduva', 190
  UNION ALL SELECT 'Sapopemba', 200
  UNION ALL SELECT 'Mooca', 210
  UNION ALL SELECT 'Belém', 220
  UNION ALL SELECT 'Brás', 230
  UNION ALL SELECT 'Guarulhos', 240
  UNION ALL SELECT 'Ferraz de Vasconcelos', 250
  UNION ALL SELECT 'Poá', 260
  UNION ALL SELECT 'Itaquaquecetuba', 270
  UNION ALL SELECT 'Suzano', 280
  UNION ALL SELECT 'Mogi das Cruzes', 290
  UNION ALL SELECT 'ABC', 300
  UNION ALL SELECT 'Centro', 310
  UNION ALL SELECT 'Zona Norte', 320
  UNION ALL SELECT 'Zona Sul', 330
  UNION ALL SELECT 'Zona Oeste', 340
  UNION ALL SELECT 'Outros', 350
) AS official_region
WHERE NOT EXISTS (
  SELECT 1
  FROM lead_interest_regions AS existing_region
  WHERE existing_region.name = official_region.name
);
