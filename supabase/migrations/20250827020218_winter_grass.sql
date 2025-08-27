/*
  # Create shift summaries table

  1. New Tables
    - `shift_summaries`
      - `id` (uuid, primary key)
      - `employee_id` (uuid, foreign key to employees)
      - `shift_roster_id` (uuid, foreign key to shift_rosters)
      - `date` (date, default current_date)
      - `summary` (text, not null)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on shift_summaries table
    - Add policies for users to manage summaries

  3. Indexes
    - Create index for employee_id and date filtering
*/

-- Create shift_summaries table
CREATE TABLE IF NOT EXISTS shift_summaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES employees(id) ON DELETE CASCADE,
  shift_roster_id uuid REFERENCES shift_rosters(id) ON DELETE CASCADE,
  date date DEFAULT CURRENT_DATE,
  summary text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for filtering by employee and date
CREATE INDEX IF NOT EXISTS idx_shift_summaries_employee_date ON shift_summaries USING btree (employee_id, date);

-- Enable RLS
ALTER TABLE shift_summaries ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage summaries"
  ON shift_summaries
  FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Users can read all summaries"
  ON shift_summaries
  FOR SELECT
  TO authenticated
  USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_shift_summaries_updated_at
  BEFORE UPDATE ON shift_summaries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();