/*
  # Create goal templates and template steps tables

  1. New Tables
    - `goal_templates`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `goal_statement` (text, not null)
      - `default_mastery_criteria` (text, default '3 consecutive shifts with all required steps Correct')
      - `default_target_date` (text, not null)
      - `status` (text, default 'active', check constraint)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

    - `goal_template_steps`
      - `id` (uuid, primary key)
      - `template_id` (uuid, foreign key to goal_templates)
      - `step_order` (integer, not null)
      - `step_description` (text, not null)
      - `is_required` (boolean, default true)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on both tables
    - Add policies for admins to manage templates
    - Add policies for users to read templates
*/

-- Create goal_templates table
CREATE TABLE IF NOT EXISTS goal_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  goal_statement text NOT NULL,
  default_mastery_criteria text DEFAULT '3 consecutive shifts with all required steps Correct'::text,
  default_target_date text NOT NULL,
  status text DEFAULT 'active'::text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT goal_templates_status_check CHECK (status = ANY (ARRAY['active'::text, 'archived'::text]))
);

-- Create goal_template_steps table
CREATE TABLE IF NOT EXISTS goal_template_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES goal_templates(id) ON DELETE CASCADE,
  step_order integer NOT NULL,
  step_description text NOT NULL,
  is_required boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE goal_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_template_steps ENABLE ROW LEVEL SECURITY;

-- Create policies for goal_templates
CREATE POLICY "Admins can manage goal templates"
  ON goal_templates
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = uid() AND users.role = 'admin'::text
    )
  );

CREATE POLICY "Users can read all goal templates"
  ON goal_templates
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for goal_template_steps
CREATE POLICY "Admins can manage template steps"
  ON goal_template_steps
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = uid() AND users.role = 'admin'::text
    )
  );

CREATE POLICY "Users can read template steps"
  ON goal_template_steps
  FOR SELECT
  TO authenticated
  USING (true);

-- Create triggers for updated_at
CREATE TRIGGER update_goal_templates_updated_at
  BEFORE UPDATE ON goal_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();