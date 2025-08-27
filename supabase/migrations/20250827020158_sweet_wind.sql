/*
  # Create development goals and goal steps tables

  1. New Tables
    - `development_goals`
      - `id` (uuid, primary key)
      - `employee_id` (uuid, foreign key to employees)
      - `title` (text, not null)
      - `description` (text, not null)
      - `start_date` (date, default current_date)
      - `target_end_date` (date, not null)
      - `status` (text, default 'active', check constraint)
      - `mastery_achieved` (boolean, default false)
      - `mastery_date` (date, nullable)
      - `consecutive_all_correct` (integer, default 0)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

    - `goal_steps`
      - `id` (uuid, primary key)
      - `goal_id` (uuid, foreign key to development_goals)
      - `step_order` (integer, not null)
      - `step_description` (text, not null)
      - `is_required` (boolean, default true)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on both tables
    - Add policies for users to manage goals and steps

  3. Indexes
    - Create indexes for employee_id and status filtering
*/

-- Create development_goals table
CREATE TABLE IF NOT EXISTS development_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES employees(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  start_date date DEFAULT CURRENT_DATE,
  target_end_date date NOT NULL,
  status text DEFAULT 'active'::text,
  mastery_achieved boolean DEFAULT false,
  mastery_date date,
  consecutive_all_correct integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT development_goals_status_check CHECK (status = ANY (ARRAY['active'::text, 'maintenance'::text, 'archived'::text]))
);

-- Create goal_steps table
CREATE TABLE IF NOT EXISTS goal_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id uuid REFERENCES development_goals(id) ON DELETE CASCADE,
  step_order integer NOT NULL,
  step_description text NOT NULL,
  is_required boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_development_goals_employee_id ON development_goals USING btree (employee_id);
CREATE INDEX IF NOT EXISTS idx_development_goals_status ON development_goals USING btree (status);
CREATE INDEX IF NOT EXISTS idx_goal_steps_goal_id ON goal_steps USING btree (goal_id);

-- Enable RLS
ALTER TABLE development_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_steps ENABLE ROW LEVEL SECURITY;

-- Create policies for development_goals
CREATE POLICY "Users can manage goals"
  ON development_goals
  FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Users can read all goals"
  ON development_goals
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for goal_steps
CREATE POLICY "Users can manage goal steps"
  ON goal_steps
  FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Users can read goal steps"
  ON goal_steps
  FOR SELECT
  TO authenticated
  USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_development_goals_updated_at
  BEFORE UPDATE ON development_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();