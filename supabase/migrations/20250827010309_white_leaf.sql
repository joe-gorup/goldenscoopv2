/*
  # Golden Scoop Shift Manager - Initial Database Schema

  1. New Tables
    - `users` - System users (admins and shift managers)
    - `employees` - Employee profiles with support information
    - `goal_templates` - Reusable goal templates
    - `development_goals` - Individual employee goals
    - `goal_steps` - Steps within each goal
    - `shift_rosters` - Shift records
    - `step_progress` - Progress tracking for goal steps
    - `shift_summaries` - End-of-shift summaries

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Proper foreign key relationships

  3. Features
    - UUID primary keys
    - Timestamps for audit trail
    - JSON fields for arrays (allergies, contacts, etc.)
    - Proper indexing for performance
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (system users)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'shift_manager')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Employees table
CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  role text NOT NULL DEFAULT 'Super Scooper',
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

-- Goal templates table
CREATE TABLE IF NOT EXISTS goal_templates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  goal_statement text NOT NULL,
  default_mastery_criteria text DEFAULT '3 consecutive shifts with all required steps Correct',
  default_target_date text NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Goal template steps
CREATE TABLE IF NOT EXISTS goal_template_steps (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id uuid REFERENCES goal_templates(id) ON DELETE CASCADE,
  step_order integer NOT NULL,
  step_description text NOT NULL,
  is_required boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Development goals table
CREATE TABLE IF NOT EXISTS development_goals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id uuid REFERENCES employees(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  start_date date DEFAULT CURRENT_DATE,
  target_end_date date NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'archived')),
  mastery_achieved boolean DEFAULT false,
  mastery_date date,
  consecutive_all_correct integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Goal steps table
CREATE TABLE IF NOT EXISTS goal_steps (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id uuid REFERENCES development_goals(id) ON DELETE CASCADE,
  step_order integer NOT NULL,
  step_description text NOT NULL,
  is_required boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Shift rosters table
CREATE TABLE IF NOT EXISTS shift_rosters (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- Step progress table
CREATE TABLE IF NOT EXISTS step_progress (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  development_goal_id uuid REFERENCES development_goals(id) ON DELETE CASCADE,
  goal_step_id uuid REFERENCES goal_steps(id) ON DELETE CASCADE,
  employee_id uuid REFERENCES employees(id) ON DELETE CASCADE,
  shift_roster_id uuid REFERENCES shift_rosters(id) ON DELETE CASCADE,
  date date DEFAULT CURRENT_DATE,
  outcome text NOT NULL CHECK (outcome IN ('correct', 'verbal_prompt', 'na')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Shift summaries table
CREATE TABLE IF NOT EXISTS shift_summaries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id uuid REFERENCES employees(id) ON DELETE CASCADE,
  shift_roster_id uuid REFERENCES shift_rosters(id) ON DELETE CASCADE,
  date date DEFAULT CURRENT_DATE,
  summary text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_template_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE development_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_rosters ENABLE ROW LEVEL SECURITY;
ALTER TABLE step_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_summaries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for authenticated users
CREATE POLICY "Users can read all users" ON users FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage users" ON users FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Users can read all employees" ON employees FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage employees" ON employees FOR ALL TO authenticated USING (true);

CREATE POLICY "Users can read all goal templates" ON goal_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage goal templates" ON goal_templates FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Users can read template steps" ON goal_template_steps FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage template steps" ON goal_template_steps FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Users can read all goals" ON development_goals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage goals" ON development_goals FOR ALL TO authenticated USING (true);

CREATE POLICY "Users can read goal steps" ON goal_steps FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage goal steps" ON goal_steps FOR ALL TO authenticated USING (true);

CREATE POLICY "Users can read all shifts" ON shift_rosters FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage shifts" ON shift_rosters FOR ALL TO authenticated USING (true);

CREATE POLICY "Users can read all progress" ON step_progress FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage progress" ON step_progress FOR ALL TO authenticated USING (true);

CREATE POLICY "Users can read all summaries" ON shift_summaries FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage summaries" ON shift_summaries FOR ALL TO authenticated USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_employees_is_active ON employees(is_active);
CREATE INDEX IF NOT EXISTS idx_development_goals_employee_id ON development_goals(employee_id);
CREATE INDEX IF NOT EXISTS idx_development_goals_status ON development_goals(status);
CREATE INDEX IF NOT EXISTS idx_goal_steps_goal_id ON goal_steps(goal_id);
CREATE INDEX IF NOT EXISTS idx_step_progress_goal_id ON step_progress(development_goal_id);
CREATE INDEX IF NOT EXISTS idx_step_progress_employee_date ON step_progress(employee_id, date);
CREATE INDEX IF NOT EXISTS idx_shift_rosters_is_active ON shift_rosters(is_active);
CREATE INDEX IF NOT EXISTS idx_shift_summaries_employee_date ON shift_summaries(employee_id, date);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_goal_templates_updated_at BEFORE UPDATE ON goal_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_development_goals_updated_at BEFORE UPDATE ON development_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shift_rosters_updated_at BEFORE UPDATE ON shift_rosters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_step_progress_updated_at BEFORE UPDATE ON step_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shift_summaries_updated_at BEFORE UPDATE ON shift_summaries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();