-- EarthPaper: Sample imagery catalog data for development
-- Seoul / Busan / Jeju area satellite imagery

INSERT INTO imagery_catalog (satellite, resolution, supersolution, acquired_at, bbox, cloud_cover, cog_url, thumbnail_url, price_per_km2, min_area_km2, metadata) VALUES
-- Seoul area - Observer
('observer', '1.5m', '1m', '2026-06-15T02:30:00Z',
 ST_GeomFromText('POLYGON((126.8 37.45, 127.15 37.45, 127.15 37.65, 126.8 37.65, 126.8 37.45))', 4326),
 12.5, 's3://earthpaper-cog/observer/seoul-20260615.tif',
 '/thumbnails/seoul-observer-20260615.jpg', 7, 1,
 '{"scene_id": "OBS-2026-0615-SEL", "sun_elevation": 62.3}'),

-- Seoul area - SpaceEye-T
('spaceeye-t', '25cm', '8.3cm', '2026-06-10T03:15:00Z',
 ST_GeomFromText('POLYGON((126.9 37.5, 127.05 37.5, 127.05 37.58, 126.9 37.58, 126.9 37.5))', 4326),
 8.2, 's3://earthpaper-cog/spaceeye-t/seoul-20260610.tif',
 '/thumbnails/seoul-spaceeye-20260610.jpg', 15, 25,
 '{"scene_id": "SET-2026-0610-SEL", "sun_elevation": 58.1}'),

-- Busan area - Observer
('observer', '1.5m', '1m', '2026-06-12T02:45:00Z',
 ST_GeomFromText('POLYGON((128.9 35.05, 129.2 35.05, 129.2 35.25, 128.9 35.25, 128.9 35.05))', 4326),
 5.0, 's3://earthpaper-cog/observer/busan-20260612.tif',
 '/thumbnails/busan-observer-20260612.jpg', 7, 1,
 '{"scene_id": "OBS-2026-0612-BUS", "sun_elevation": 64.7}'),

-- Jeju area - Observer
('observer', '1.5m', '1m', '2026-06-18T02:20:00Z',
 ST_GeomFromText('POLYGON((126.3 33.2, 126.95 33.2, 126.95 33.55, 126.3 33.55, 126.3 33.2))', 4326),
 22.0, 's3://earthpaper-cog/observer/jeju-20260618.tif',
 '/thumbnails/jeju-observer-20260618.jpg', 7, 1,
 '{"scene_id": "OBS-2026-0618-JEJ", "sun_elevation": 66.1}'),

-- Jeju area - SpaceEye-T
('spaceeye-t', '25cm', '8.3cm', '2026-06-05T03:30:00Z',
 ST_GeomFromText('POLYGON((126.5 33.3, 126.7 33.3, 126.7 33.45, 126.5 33.45, 126.5 33.3))', 4326),
 3.1, 's3://earthpaper-cog/spaceeye-t/jeju-20260605.tif',
 '/thumbnails/jeju-spaceeye-20260605.jpg', 15, 25,
 '{"scene_id": "SET-2026-0605-JEJ", "sun_elevation": 61.5}'),

-- Incheon area - Observer
('observer', '1.5m', '1m', '2026-06-20T02:35:00Z',
 ST_GeomFromText('POLYGON((126.55 37.35, 126.75 37.35, 126.75 37.5, 126.55 37.5, 126.55 37.35))', 4326),
 15.8, 's3://earthpaper-cog/observer/incheon-20260620.tif',
 '/thumbnails/incheon-observer-20260620.jpg', 7, 1,
 '{"scene_id": "OBS-2026-0620-ICN", "sun_elevation": 63.0}'),

-- Daejeon area - Observer
('observer', '1.5m', '1m', '2026-06-14T02:40:00Z',
 ST_GeomFromText('POLYGON((127.3 36.25, 127.5 36.25, 127.5 36.4, 127.3 36.4, 127.3 36.25))', 4326),
 0.0, 's3://earthpaper-cog/observer/daejeon-20260614.tif',
 '/thumbnails/daejeon-observer-20260614.jpg', 7, 1,
 '{"scene_id": "OBS-2026-0614-DJN", "sun_elevation": 65.2}');
