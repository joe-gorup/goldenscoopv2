/*
  # Create shift rosters table

  1. New Tables
    - `shift_rosters`
      - `id` (uuid, primary key)
      - `manager_id` (uuid, foreign key to users)
      - `date` (date, default current_date)
      - `start_time` (text, not null)
      - `end_time` (text, nullable)
      - `location` (text, not null)
      - `employee_ids` (jsonb, default empty array)
      - `is_active` (boolean, default true)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on shift_rosters table
    - Add policies for users to manage shifts

  3. Indexes
    - Create index on is_active for filtering active shifts
*/

-- Create shift_rosters table
CREATE TABLE IF NOT EXISTS shift_rosters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  manager_id uuid REFERENCES users(id),
  date date DEFAULT CURRENT_DATE,
  start_time text NOT NULL,
  end_time text,
  location text NOT NULL,
  employee_ids jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for filtering by active status
CREATE INDEX IF NOT EXISTS idx_shift_rosters_is_active ON shift_rosters USING btree (is_active);

-- Enable RLS
ALTER TABLE shift_rosters ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage shifts"
  ON shift_rosters
  FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Users can read all shifts"
  ON shift_rosters
  FOR SELECT
  TO authenticated
  USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_shift_rosters_updated_at
  BEFORE UPDATE ON shift_rosters
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();