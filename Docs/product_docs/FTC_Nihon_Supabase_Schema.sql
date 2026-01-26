-- ============================================
-- FTC: Nihon - Supabase Database Schema
-- ============================================
-- Run this in your Supabase SQL Editor to set up the database
-- 
-- Project: FTC: Nihon (Finer Things Club Japan Trip)
-- Created: January 25, 2026
-- ============================================

-- ============================================
-- TABLES
-- ============================================

-- Activities (main itinerary)
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_number INT NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  duration_minutes INT,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('food', 'temple', 'shopping', 'transit', 'activity', 'hotel')),
  location_name TEXT,
  location_address TEXT,
  location_address_jp TEXT,
  location_lat DECIMAL(10, 7),
  location_lng DECIMAL(10, 7),
  google_maps_url TEXT,
  website_url TEXT,
  description TEXT,
  tips TEXT,
  what_to_order TEXT,
  backup_alternative TEXT,
  is_hard_deadline BOOLEAN DEFAULT FALSE,
  is_kid_friendly BOOLEAN DEFAULT TRUE,
  sort_order INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE activities IS 'Main itinerary - all scheduled activities for the 15-day trip';

-- Transit segments (pre-calculated directions)
CREATE TABLE transit_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
  leave_by TIME NOT NULL,
  walk_to_station_minutes INT,
  station_name TEXT,
  train_line TEXT,
  suggested_departure TIME,
  travel_minutes INT,
  transfers TEXT,
  arrival_station TEXT,
  walk_to_destination_minutes INT,
  buffer_minutes INT DEFAULT 10,
  steps JSONB, -- Detailed step-by-step instructions
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE transit_segments IS 'Pre-calculated transit directions with "leave by" times';
COMMENT ON COLUMN transit_segments.steps IS 'JSON array of {type, instruction, duration, departure?}';

-- Accommodations
CREATE TABLE accommodations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  address_jp TEXT,
  check_in_time TIME,
  check_out_time TIME,
  confirmation_number TEXT,
  pin_code TEXT,
  phone TEXT,
  google_maps_url TEXT,
  instructions TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  sort_order INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE accommodations IS 'Hotel and lodging details with confirmation info';

-- Restaurants (recommendations beyond itinerary)
CREATE TABLE restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  google_maps_url TEXT,
  website_url TEXT,
  what_to_order TEXT,
  backup_alternative TEXT,
  is_kid_friendly BOOLEAN DEFAULT TRUE,
  day_number INT,
  meal TEXT CHECK (meal IN ('breakfast', 'lunch', 'dinner', 'snack')),
  city TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE restaurants IS 'Restaurant recommendations with ordering tips';

-- Admin alerts (Rich can post announcements)
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'urgent')),
  active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMPTZ,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE alerts IS 'Admin announcements visible to all users';

-- Location sharing (optional group coordination)
CREATE TABLE location_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name TEXT NOT NULL,
  lat DECIMAL(10, 7) NOT NULL,
  lng DECIMAL(10, 7) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE location_shares IS 'Real-time location sharing for group coordination';

-- Pre-cached AI responses (for offline)
CREATE TABLE ai_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_pattern TEXT NOT NULL,
  context_type TEXT, -- 'location', 'etiquette', 'schedule', 'phrase', etc.
  context_key TEXT,  -- e.g., 'sensoji', 'ryokan', 'day-05'
  response TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE ai_cache IS 'Pre-generated AI responses for offline use';

-- Checklist items (pre-trip and during trip)
CREATE TABLE checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  due_time TIME,
  is_completed BOOLEAN DEFAULT FALSE,
  is_pre_trip BOOLEAN DEFAULT TRUE,
  sort_order INT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE checklist_items IS 'Pre-trip and during-trip checklist items';

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_activities_day ON activities(day_number);
CREATE INDEX idx_activities_date ON activities(date);
CREATE INDEX idx_activities_sort ON activities(day_number, sort_order);
CREATE INDEX idx_transit_activity ON transit_segments(activity_id);
CREATE INDEX idx_restaurants_day ON restaurants(day_number);
CREATE INDEX idx_restaurants_city ON restaurants(city);
CREATE INDEX idx_alerts_active ON alerts(active) WHERE active = TRUE;
CREATE INDEX idx_checklist_due ON checklist_items(due_date);
CREATE INDEX idx_checklist_pretrip ON checklist_items(is_pre_trip);
CREATE INDEX idx_location_shares_user ON location_shares(user_name);

-- ============================================
-- REAL-TIME SUBSCRIPTIONS
-- ============================================
-- Enable real-time for tables that need live updates
ALTER PUBLICATION supabase_realtime ADD TABLE activities;
ALTER PUBLICATION supabase_realtime ADD TABLE alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE location_shares;
ALTER PUBLICATION supabase_realtime ADD TABLE checklist_items;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
-- Enable RLS on all tables
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE transit_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE accommodations ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;

-- Read access for all (app uses anon key for reads)
CREATE POLICY "Allow public read" ON activities FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON transit_segments FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON accommodations FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON restaurants FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON alerts FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON location_shares FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON ai_cache FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON checklist_items FOR SELECT USING (true);

-- Write access for authenticated users (admin)
CREATE POLICY "Allow authenticated insert" ON activities FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update" ON activities FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete" ON activities FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated insert" ON transit_segments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update" ON transit_segments FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete" ON transit_segments FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated insert" ON accommodations FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update" ON accommodations FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete" ON accommodations FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated insert" ON restaurants FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update" ON restaurants FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete" ON restaurants FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated insert" ON alerts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update" ON alerts FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete" ON alerts FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated insert" ON checklist_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update" ON checklist_items FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete" ON checklist_items FOR DELETE USING (auth.role() = 'authenticated');

-- Location shares - anyone can insert/update their own
CREATE POLICY "Allow public insert" ON location_shares FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON location_shares FOR UPDATE USING (true);

-- AI cache - only admin can modify
CREATE POLICY "Allow authenticated insert" ON ai_cache FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update" ON ai_cache FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete" ON ai_cache FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON activities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON transit_segments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON accommodations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON restaurants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON checklist_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON location_shares
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- VIEWS (Optional - for convenience)
-- ============================================

-- Today's activities (requires passing date)
CREATE OR REPLACE VIEW v_activities_with_transit AS
SELECT 
  a.*,
  t.leave_by,
  t.walk_to_station_minutes,
  t.station_name,
  t.train_line,
  t.suggested_departure,
  t.travel_minutes,
  t.transfers,
  t.arrival_station,
  t.walk_to_destination_minutes,
  t.buffer_minutes,
  t.steps as transit_steps
FROM activities a
LEFT JOIN transit_segments t ON t.activity_id = a.id
ORDER BY a.day_number, a.sort_order;

-- Active alerts only
CREATE OR REPLACE VIEW v_active_alerts AS
SELECT * FROM alerts 
WHERE active = TRUE 
  AND (expires_at IS NULL OR expires_at > NOW())
ORDER BY 
  CASE type 
    WHEN 'urgent' THEN 1 
    WHEN 'warning' THEN 2 
    ELSE 3 
  END,
  created_at DESC;

-- ============================================
-- SAMPLE DATA STRUCTURE (for reference)
-- ============================================
-- 
-- Activities example:
-- INSERT INTO activities (day_number, date, start_time, name, category, location_name, ...) 
-- VALUES (1, '2026-03-07', '15:20', 'Arrive Haneda Airport', 'transit', 'Haneda Airport', ...);
--
-- Transit segment example:
-- INSERT INTO transit_segments (activity_id, leave_by, walk_to_station_minutes, station_name, ...)
-- VALUES ('uuid-here', '08:35', 14, 'Shinjuku Station', ...);
--
-- ============================================

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'FTC: Nihon database schema created successfully!';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Create admin user in Supabase Auth (Rich)';
  RAISE NOTICE '2. Import itinerary data';
  RAISE NOTICE '3. Configure environment variables in Next.js app';
END $$;
