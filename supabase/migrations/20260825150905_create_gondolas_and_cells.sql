/*
# Create gondolas and cells tables for "Ciervo" shelf-monitoring app

1. New Tables
- `gondolas`: virtual shelves grouped by category (vinos, destilados, heladeras).
  - `id` (uuid, primary key)
  - `category` (text, not null) — one of 'vinos', 'destilados', 'heladeras'
  - `name` (text, not null) — display name, e.g. "Malbec 1"
  - `size_x` (int, not null) — number of columns (bottle-width slots)
  - `size_y` (int, not null) — number of rows (shelf heights)
  - `created_at` (timestamptz, default now())
- `cells`: individual bottle positions inside a gondola grid.
  - `id` (uuid, primary key)
  - `gondola_id` (uuid, foreign key → gondolas.id, cascade delete)
  - `pos_x` (int, not null) — column index (0-based)
  - `pos_y` (int, not null) — row index (0-based)
  - `wine_name` (text, default '') — label for the bottle in this slot
  - `bottle_count` (int, default 6) — current stock count; 0-1=red, 2-4=yellow, 5+=green
  - `updated_at` (timestamptz, default now())

2. Indexes
- `cells_gondola_id_idx` on cells(gondola_id) for fast lookups
- `cells_gondola_pos_idx` unique on (gondola_id, pos_x, pos_y) to prevent duplicate slots

3. Security
- Enable RLS on both tables.
- Single-tenant app (shared password auth, no user accounts): all policies
  use `TO anon, authenticated` so the anon-key frontend can read/write shared data.
- Full CRUD allowed for anon + authenticated on both tables (data is intentionally shared).

4. Notes
- `bottle_count` drives the traffic-light color, not a separate status column.
  Derivation: 0-1 → red, 2-4 → yellow, 5+ → green.
- When a gondola is deleted, all its cells are removed automatically (ON DELETE CASCADE).
*/

CREATE TABLE IF NOT EXISTS gondolas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  name text NOT NULL,
  size_x int NOT NULL,
  size_y int NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cells (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gondola_id uuid NOT NULL REFERENCES gondolas(id) ON DELETE CASCADE,
  pos_x int NOT NULL,
  pos_y int NOT NULL,
  wine_name text NOT NULL DEFAULT '',
  bottle_count int NOT NULL DEFAULT 6,
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS cells_gondola_id_idx ON cells(gondola_id);

CREATE UNIQUE INDEX IF NOT EXISTS cells_gondola_pos_idx
  ON cells(gondola_id, pos_x, pos_y);

ALTER TABLE gondolas ENABLE ROW LEVEL SECURITY;
ALTER TABLE cells ENABLE ROW LEVEL SECURITY;

-- gondolas policies (shared data, anon + authenticated)
DROP POLICY IF EXISTS "anon_select_gondolas" ON gondolas;
CREATE POLICY "anon_select_gondolas" ON gondolas FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_gondolas" ON gondolas;
CREATE POLICY "anon_insert_gondolas" ON gondolas FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_gondolas" ON gondolas;
CREATE POLICY "anon_update_gondolas" ON gondolas FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_gondolas" ON gondolas;
CREATE POLICY "anon_delete_gondolas" ON gondolas FOR DELETE
  TO anon, authenticated USING (true);

-- cells policies (shared data, anon + authenticated)
DROP POLICY IF EXISTS "anon_select_cells" ON cells;
CREATE POLICY "anon_select_cells" ON cells FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_cells" ON cells;
CREATE POLICY "anon_insert_cells" ON cells FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_cells" ON cells;
CREATE POLICY "anon_update_cells" ON cells FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_cells" ON cells;
CREATE POLICY "anon_delete_cells" ON cells FOR DELETE
  TO anon, authenticated USING (true);