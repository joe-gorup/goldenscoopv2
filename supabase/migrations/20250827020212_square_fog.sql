/*
  # Create step progress table

  1. New Tables
    - `step_progress`
      - `id` (uuid, primary key)
      - `development_goal_id` (uuid, foreign key to development_goals)
      - `goal_step_id` (uuid, foreign key to goal_steps)
      - `employee_id` (uuid, foreign key to employees)
      - `shift_roster_id` (uuid, foreign key to shift_rosters)
      - `date` (date, default current_date)
      - `outcome` (text, not null, check constraint for correct/verbal_prompt/na)
      - `notes` (text, nullable)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on step_progress table
    - Add policies for users to manage progress

  3. Indexes
    - Create indexes for goal_id, employee_id and date filtering
*/

-- Create step_progress table
CREATE TABLE IF NOT EXISTS step_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  development_goal_id uuid REFERENCES development_goals(id) ON DELETE CASCADE,
  goal_step_id uuid REFERENCES goal_steps(id) ON DELETE CASCADE,
  employee_id uuid REFERENCES employees(id) ON DELETE CASCADE,
  shift_roster_id uuid REFERENCES shift_rosters(id) ON DELETE CASCADE,
  date date DEFAULT CURRENT_DATE,
  outcome text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT step_progress_outcome_check CHECK (outcome = ANY (ARRAY['correct'::text, 'verbal_prompt'::text, 'na'::text]))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_step_progress_goal_id ON step_progress USING btree (development_goal_id);
CREATE INDEX IF NOT EXISTS idx_step_progress_employee_date ON step_progress USING btree (employee_id, date);

-- Enable RLS
ALTER TABLE step_progress ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage progress"
  ON step_progress
  FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Users can read all progress"
  ON step_progress
  FOR SELECT
  TO authenticated
  USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_step_progress_updated_at
  BEFORE UPDATE ON step_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();