/*
  # Insert demo data for Golden Scoop application

  1. Demo Data
    - Sample employees with support information
    - Sample goal templates
    - Sample development goals
    - Sample goal steps

  2. Notes
    - This data matches the demo data structure from the application
    - Provides realistic examples for testing and demonstration
*/

-- Insert demo employees
INSERT INTO employees (id, name, role, profile_image_url, is_active, allergies, emergency_contacts, interests_motivators, challenges, regulation_strategies) VALUES
(
  '550e8400-e29b-41d4-a716-446655440001',
  'Alex Johnson',
  'Super Scooper',
  'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
  true,
  '["Nuts", "Dairy"]'::jsonb,
  '[{"name": "Sarah Johnson", "relationship": "Mother", "phone": "555-0123"}]'::jsonb,
  '["Music", "Art", "Praise and recognition"]'::jsonb,
  '["Loud noises", "Sudden changes"]'::jsonb,
  '["5-minute breaks", "Visual schedules", "Calm voice"]'::jsonb
),
(
  '550e8400-e29b-41d4-a716-446655440002',
  'Emma Davis',
  'Super Scooper',
  'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
  true,
  '[]'::jsonb,
  '[{"name": "Mike Davis", "relationship": "Father", "phone": "555-0456"}]'::jsonb,
  '["Animals", "Colorful stickers", "Team activities"]'::jsonb,
  '["Complex instructions"]'::jsonb,
  '["Break tasks into steps", "Use positive reinforcement"]'::jsonb
),
(
  '550e8400-e29b-41d4-a716-446655440003',
  'Jordan Smith',
  'Super Scooper',
  'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
  true,
  '["Shellfish"]'::jsonb,
  '[{"name": "Lisa Smith", "relationship": "Guardian", "phone": "555-0789"}]'::jsonb,
  '["Video games", "Technology", "Problem solving"]'::jsonb,
  '["Social interactions", "Eye contact"]'::jsonb,
  '["Written instructions", "Quiet workspace", "Regular check-ins"]'::jsonb
);

-- Insert demo goal templates
INSERT INTO goal_templates (id, name, goal_statement, default_mastery_criteria, default_target_date, status) VALUES
(
  '660e8400-e29b-41d4-a716-446655440001',
  'Ice Cream Flavors Knowledge',
  'Employee will demonstrate comprehensive knowledge of all ice cream flavors, their ingredients, and allergen information to provide excellent customer service',
  '3 consecutive shifts with all required steps Correct',
  '2024-04-15',
  'active'
),
(
  '660e8400-e29b-41d4-a716-446655440002',
  'Customer Service Excellence',
  'Employee will consistently provide friendly, helpful customer service including greeting customers, taking orders accurately, and handling special requests',
  '3 consecutive shifts with all required steps Correct',
  '2024-05-01',
  'active'
),
(
  '660e8400-e29b-41d4-a716-446655440003',
  'Cash Register Operations',
  'Employee will demonstrate proficiency in operating the cash register, processing payments, and handling transactions accurately',
  '3 consecutive shifts with all required steps Correct',
  '2024-04-30',
  'active'
);

-- Insert goal template steps
INSERT INTO goal_template_steps (template_id, step_order, step_description, is_required) VALUES
-- Ice Cream Flavors Knowledge steps
('660e8400-e29b-41d4-a716-446655440001', 1, 'Name all available ice cream flavors without prompting', true),
('660e8400-e29b-41d4-a716-446655440001', 2, 'Identify key ingredients in each flavor when asked', true),
('660e8400-e29b-41d4-a716-446655440001', 3, 'Correctly identify allergens in flavors (nuts, dairy, etc.)', true),
('660e8400-e29b-41d4-a716-446655440001', 4, 'Recommend flavors based on customer preferences', false),

-- Customer Service Excellence steps
('660e8400-e29b-41d4-a716-446655440002', 1, 'Greet every customer with a smile and friendly welcome', true),
('660e8400-e29b-41d4-a716-446655440002', 2, 'Listen actively to customer orders and repeat back for confirmation', true),
('660e8400-e29b-41d4-a716-446655440002', 3, 'Handle special requests and dietary restrictions appropriately', true),
('660e8400-e29b-41d4-a716-446655440002', 4, 'Thank customers and invite them to return', true),

-- Cash Register Operations steps
('660e8400-e29b-41d4-a716-446655440003', 1, 'Enter orders accurately into the cash register system', true),
('660e8400-e29b-41d4-a716-446655440003', 2, 'Calculate correct change for cash transactions', true),
('660e8400-e29b-41d4-a716-446655440003', 3, 'Process credit card payments correctly', true),
('660e8400-e29b-41d4-a716-446655440003', 4, 'Handle refunds and exchanges following store policy', false);

-- Insert development goals for Alex Johnson
INSERT INTO development_goals (id, employee_id, title, description, start_date, target_end_date, status, mastery_achieved, consecutive_all_correct) VALUES
(
  '770e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440001',
  'Ice Cream Flavors Knowledge',
  'Learn all ice cream flavors, their ingredients, and allergen information to provide excellent customer service',
  '2024-01-15',
  '2024-04-15',
  'active',
  false,
  1
),
(
  '770e8400-e29b-41d4-a716-446655440002',
  '550e8400-e29b-41d4-a716-446655440001',
  'Customer Service Excellence',
  'Develop consistent friendly customer service skills including greeting, order taking, and handling special requests',
  '2024-02-01',
  '2024-05-01',
  'active',
  false,
  0
);

-- Insert goal steps for Alex Johnson's goals
INSERT INTO goal_steps (goal_id, step_order, step_description, is_required) VALUES
-- Ice Cream Flavors Knowledge steps for Alex
('770e8400-e29b-41d4-a716-446655440001', 1, 'Name all available ice cream flavors without prompting', true),
('770e8400-e29b-41d4-a716-446655440001', 2, 'Identify key ingredients in each flavor when asked', true),
('770e8400-e29b-41d4-a716-446655440001', 3, 'Correctly identify allergens in flavors (nuts, dairy, etc.)', true),
('770e8400-e29b-41d4-a716-446655440001', 4, 'Recommend flavors based on customer preferences', false),

-- Customer Service Excellence steps for Alex
('770e8400-e29b-41d4-a716-446655440002', 1, 'Greet every customer with a smile and friendly welcome', true),
('770e8400-e29b-41d4-a716-446655440002', 2, 'Listen actively to customer orders and repeat back for confirmation', true),
('770e8400-e29b-41d4-a716-446655440002', 3, 'Handle special requests and dietary restrictions appropriately', true),
('770e8400-e29b-41d4-a716-446655440002', 4, 'Thank customers and invite them to return', true);

-- Insert development goal for Emma Davis
INSERT INTO development_goals (id, employee_id, title, description, start_date, target_end_date, status, mastery_achieved, consecutive_all_correct) VALUES
(
  '770e8400-e29b-41d4-a716-446655440003',
  '550e8400-e29b-41d4-a716-446655440002',
  'Cash Register Operations',
  'Master cash register operations including accurate order entry, payment processing, and handling transactions',
  '2024-01-20',
  '2024-04-30',
  'active',
  false,
  2
);

-- Insert goal steps for Emma Davis's goal
INSERT INTO goal_steps (goal_id, step_order, step_description, is_required) VALUES
-- Cash Register Operations steps for Emma
('770e8400-e29b-41d4-a716-446655440003', 1, 'Enter orders accurately into the cash register system', true),
('770e8400-e29b-41d4-a716-446655440003', 2, 'Calculate correct change for cash transactions', true),
('770e8400-e29b-41d4-a716-446655440003', 3, 'Process credit card payments correctly', true),
('770e8400-e29b-41d4-a716-446655440003', 4, 'Handle refunds and exchanges following store policy', false);