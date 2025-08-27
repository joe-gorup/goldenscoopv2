/*
  # Create employees table

  1. New Tables
    - `employees`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `role` (text, default 'Super Scooper')
      - `profile_image_url` (text, nullable)
      - `is_active` (boolean, default true)
      - `allergies` (jsonb, default empty array)
      - `emergency_contacts` (jsonb, default empty array)
      - `interests_motivators` (jsonb, default empty array)
      - `challenges` (jsonb, default empty array)
      - `regulation_strategies` (jsonb, default empty array)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `employees` table
    - Add policy for users to manage employees
    - Add policy for users to read all employees

  3. Indexes
    - Create index on is_active for filtering
*/

-- Create employees table
CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text DEFAULT 'Super Scooper'::text NOT NULL,
  profile_image_url text,
  is_active boolean DEFAULT true,
  allergies jsonb DEFAULT '[]'::jsonb,
  emergency_contacts jsonb DEFAULT '[]'::jsonb,
  interests_motivators jsonb DEFAULT '[]'::jsonb,
  challenges jsonb DEFAULT '[]'::jsonb,
  regulation_strategies jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for filtering by active status
CREATE INDEX IF NOT EXISTS idx_employees_is_active ON employees USING btree (is_active);

-- Enable RLS
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage employees"
  ON employees
  FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Users can read all employees"
  ON employees
  FOR SELECT
  TO authenticated
  USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_employees_updated_at
  BEFORE UPDATE ON employees
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();