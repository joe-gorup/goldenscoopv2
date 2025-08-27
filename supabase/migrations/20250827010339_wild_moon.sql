/*
  # Seed Initial Data for Golden Scoop App

  1. Demo Users
    - Admin user
    - Shift manager user

  2. Sample Employees
    - Complete employee profiles with support information

  3. Goal Templates
    - Ice cream flavors knowledge
    - Phone answering protocol

  4. Sample Development Goals
    - Assigned to employees with progress tracking
*/

-- Insert demo users
INSERT INTO users (id, email, name, role, is_active) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'admin@goldenscoop.com', 'Sarah Johnson', 'admin', true),
  ('550e8400-e29b-41d4-a716-446655440002', 'manager@goldenscoop.com', 'Mike Chen', 'shift_manager', true)
ON CONFLICT (email) DO NOTHING;

-- Insert sample employees
INSERT INTO employees (id, name, role, profile_image_url, is_active, allergies, emergency_contacts, interests_motivators, challenges, regulation_strategies) VALUES
  (
    '550e8400-e29b-41d4-a716-446655440010',
    'Sally Martinez',
    'Super Scooper',
    'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    true,
    '["Tree nuts", "Shellfish"]'::jsonb,
    '[{"name": "Maria Martinez", "relationship": "Mother", "phone": "(555) 123-4567"}, {"name": "Carlos Martinez", "relationship": "Father", "phone": "(555) 234-5678"}]'::jsonb,
    '["Pop music", "High-fives", "Colorful stickers", "Compliments on work"]'::jsonb,
    '["Loud noises from blender", "Rush periods with long lines", "Remembering multiple orders"]'::jsonb,
    '["Offer 5-minute breaks during busy periods", "Use visual order cards", "Speak in calm, quiet voice", "Give one task at a time"]'::jsonb
  ),
  (
    '550e8400-e29b-41d4-a716-446655440011',
    'Alex Thompson',
    'Super Scooper',
    'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    true,
    '[]'::jsonb,
    '[{"name": "Jennifer Thompson", "relationship": "Mother", "phone": "(555) 345-6789"}]'::jsonb,
    '["Video games", "Basketball", "Earning money", "Team competitions"]'::jsonb,
    '["Processing multiple instructions at once", "Remembering ice cream flavor ingredients"]'::jsonb,
    '["Give one instruction at a time", "Use positive reinforcement", "Allow extra processing time", "Practice flavor knowledge during slow periods"]'::jsonb
  ),
  (
    '550e8400-e29b-41d4-a716-446655440012',
    'Emma Rodriguez',
    'Super Scooper',
    'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    true,
    '["Latex"]'::jsonb,
    '[{"name": "Rosa Rodriguez", "relationship": "Grandmother", "phone": "(555) 456-7890"}, {"name": "Miguel Rodriguez", "relationship": "Uncle", "phone": "(555) 567-8901"}]'::jsonb,
    '["Art and drawing", "Helping customers", "Learning new skills", "Praise from managers"]'::jsonb,
    '["Anxiety with new customers", "Counting change quickly", "Working during busy periods"]'::jsonb,
    '["Start with familiar customers", "Use calculator for change", "Pair with experienced scooper during rush", "Provide reassurance and encouragement"]'::jsonb
  ),
  (
    '550e8400-e29b-41d4-a716-446655440013',
    'Jordan Kim',
    'Super Scooper',
    'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    true,
    '["Dairy", "Eggs"]'::jsonb,
    '[{"name": "Susan Kim", "relationship": "Mother", "phone": "(555) 678-9012"}]'::jsonb,
    '["K-pop music", "Social media", "Making friends", "Earning independence"]'::jsonb,
    '["Social anxiety", "Speaking loudly enough", "Initiating conversations with customers"]'::jsonb,
    '["Practice greetings during training", "Use scripts for common interactions", "Start shifts with supportive team members", "Celebrate small social wins"]'::jsonb
  ),
  (
    '550e8400-e29b-41d4-a716-446655440014',
    'Marcus Johnson',
    'Super Scooper',
    'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    true,
    '[]'::jsonb,
    '[{"name": "Denise Johnson", "relationship": "Mother", "phone": "(555) 789-0123"}, {"name": "Robert Johnson", "relationship": "Father", "phone": "(555) 890-1234"}]'::jsonb,
    '["Football", "Working out", "Helping others", "Being recognized as reliable"]'::jsonb,
    '["Fine motor skills with scooping", "Patience during slow periods", "Following detailed cleaning procedures"]'::jsonb,
    '["Use larger scoop handles", "Provide movement breaks", "Break cleaning tasks into smaller steps", "Assign physical tasks when possible"]'::jsonb
  ),
  (
    '550e8400-e29b-41d4-a716-446655440015',
    'Aisha Patel',
    'Super Scooper',
    'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    false,
    '["Peanuts"]'::jsonb,
    '[{"name": "Priya Patel", "relationship": "Sister", "phone": "(555) 901-2345"}]'::jsonb,
    '["Reading", "Animals", "Quiet environments", "One-on-one interactions"]'::jsonb,
    '["Loud environments", "Multi-tasking", "Time pressure"]'::jsonb,
    '["Assign quieter work stations", "Focus on one task at a time", "Provide noise-canceling headphones during breaks"]'::jsonb
  )
ON CONFLICT (id) DO NOTHING;

-- Insert goal templates
INSERT INTO goal_templates (id, name, goal_statement, default_target_date, status) VALUES
  (
    '550e8400-e29b-41d4-a716-446655440020',
    'Ice Cream Flavors Knowledge',
    'Employee will independently state all current ice cream flavors and their mix-in ingredients with 100% accuracy in 3 consecutive shifts to increase customer service skills.',
    '2025-03-01',
    'active'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440021',
    'Phone Answering Protocol',
    'Employee will independently answer the shop phone and answer all common questions asked by customers with 100% accuracy to increase independence in the workplace.',
    '2025-03-01',
    'active'
  )
ON CONFLICT (id) DO NOTHING;

-- Insert goal template steps for Ice Cream Flavors Knowledge
INSERT INTO goal_template_steps (template_id, step_order, step_description, is_required) VALUES
  ('550e8400-e29b-41d4-a716-446655440020', 1, 'Vanilla — Vanilla ice cream', true),
  ('550e8400-e29b-41d4-a716-446655440020', 2, 'Charlie''s Chocolate — Chocolate ice cream (regular)', true),
  ('550e8400-e29b-41d4-a716-446655440020', 3, 'Chocolate Gold Rush — Chocolate ice cream with golden Oreos', true),
  ('550e8400-e29b-41d4-a716-446655440020', 4, 'Chocolate No Cow — Dairy-free chocolate; oat and coconut milk; vegan', true),
  ('550e8400-e29b-41d4-a716-446655440020', 5, 'Cookies and Cream — Vanilla ice cream with Oreos', true),
  ('550e8400-e29b-41d4-a716-446655440020', 6, 'Cookie Dough — Vanilla ice cream with cookie dough pieces', true),
  ('550e8400-e29b-41d4-a716-446655440020', 7, 'Coffee — Coffee ice cream', true),
  ('550e8400-e29b-41d4-a716-446655440020', 8, 'Mint Chocolate Chip — Mint ice cream with chocolate chips', true);

-- Insert goal template steps for Phone Answering Protocol
INSERT INTO goal_template_steps (template_id, step_order, step_description, is_required) VALUES
  ('550e8400-e29b-41d4-a716-446655440021', 1, 'Picks up the phone', true),
  ('550e8400-e29b-41d4-a716-446655440021', 2, 'Selects "talk"', true),
  ('550e8400-e29b-41d4-a716-446655440021', 3, 'Brings the phone to ear', true),
  ('550e8400-e29b-41d4-a716-446655440021', 4, 'Says greeting: "Thank you for calling The Golden Scoop, this is [name], how can I help you?"', true),
  ('550e8400-e29b-41d4-a716-446655440021', 5, 'Answers the question or states "Let me grab my manager for you"', true),
  ('550e8400-e29b-41d4-a716-446655440021', 6, 'Hands the phone to a manager (if applicable)', false),
  ('550e8400-e29b-41d4-a716-446655440021', 7, 'Says "Thank you, have a nice day, bye"', true),
  ('550e8400-e29b-41d4-a716-446655440021', 8, 'Selects "end" on the phone', true),
  ('550e8400-e29b-41d4-a716-446655440021', 9, 'Puts the phone on the charger', true);

-- Insert sample development goals
INSERT INTO development_goals (id, employee_id, title, description, start_date, target_end_date, status, consecutive_all_correct) VALUES
  (
    '550e8400-e29b-41d4-a716-446655440030',
    '550e8400-e29b-41d4-a716-446655440010',
    'Ice Cream Flavors Knowledge',
    'Sally will independently state all current ice cream flavors and their mix-in ingredients with 100% accuracy in 3 consecutive shifts to increase customer service skills.',
    '2024-12-01',
    '2025-03-01',
    'active',
    1
  ),
  (
    '550e8400-e29b-41d4-a716-446655440031',
    '550e8400-e29b-41d4-a716-446655440010',
    'Customer Greeting Skills',
    'Sally will greet every customer within 30 seconds of entry with appropriate eye contact and friendly demeanor.',
    '2024-11-15',
    '2025-02-15',
    'active',
    0
  ),
  (
    '550e8400-e29b-41d4-a716-446655440032',
    '550e8400-e29b-41d4-a716-446655440011',
    'Phone Answering Protocol',
    'Alex will independently answer the shop phone and handle common customer questions with 100% accuracy to increase workplace independence.',
    '2024-12-10',
    '2025-03-10',
    'active',
    2
  ),
  (
    '550e8400-e29b-41d4-a716-446655440033',
    '550e8400-e29b-41d4-a716-446655440014',
    'Cleaning and Sanitization',
    'Marcus will complete end-of-shift cleaning checklist independently with 100% accuracy to maintain health standards.',
    '2024-12-01',
    '2025-03-01',
    'maintenance',
    5
  );

-- Insert goal steps for development goals
INSERT INTO goal_steps (goal_id, step_order, step_description, is_required) VALUES
  -- Sally's Ice Cream Flavors Knowledge
  ('550e8400-e29b-41d4-a716-446655440030', 1, 'Vanilla — Vanilla ice cream', true),
  ('550e8400-e29b-41d4-a716-446655440030', 2, 'Charlie''s Chocolate — Chocolate ice cream (regular)', true),
  ('550e8400-e29b-41d4-a716-446655440030', 3, 'Cookies and Cream — Vanilla ice cream with Oreos', true),
  ('550e8400-e29b-41d4-a716-446655440030', 4, 'Cookie Dough — Vanilla ice cream with cookie dough pieces', true),
  
  -- Sally's Customer Greeting Skills
  ('550e8400-e29b-41d4-a716-446655440031', 1, 'Makes eye contact with customer', true),
  ('550e8400-e29b-41d4-a716-446655440031', 2, 'Smiles and says "Welcome to The Golden Scoop"', true),
  ('550e8400-e29b-41d4-a716-446655440031', 3, 'Asks "How can I help you today?"', true),
  
  -- Alex's Phone Answering Protocol
  ('550e8400-e29b-41d4-a716-446655440032', 1, 'Picks up the phone within 3 rings', true),
  ('550e8400-e29b-41d4-a716-446655440032', 2, 'Says greeting: "Thank you for calling The Golden Scoop, this is Alex, how can I help you?"', true),
  ('550e8400-e29b-41d4-a716-446655440032', 3, 'Answers hours question: "We''re open 11am to 9pm daily"', true),
  ('550e8400-e29b-41d4-a716-446655440032', 4, 'Answers location question or transfers to manager', true),
  ('550e8400-e29b-41d4-a716-446655440032', 5, 'Says "Thank you, have a great day" before hanging up', true),
  
  -- Marcus's Cleaning and Sanitization (mastered goal)
  ('550e8400-e29b-41d4-a716-446655440033', 1, 'Wipes down all counters with sanitizer', true),
  ('550e8400-e29b-41d4-a716-446655440033', 2, 'Cleans ice cream scoops and utensils', true),
  ('550e8400-e29b-41d4-a716-446655440033', 3, 'Sweeps and mops floor areas', true),
  ('550e8400-e29b-41d4-a716-446655440033', 4, 'Empties trash and replaces liners', true),
  ('550e8400-e29b-41d4-a716-446655440033', 5, 'Checks and refills napkin/spoon dispensers', false);

-- Update mastered goal
UPDATE development_goals 
SET mastery_achieved = true, mastery_date = '2024-12-15', status = 'maintenance'
WHERE id = '550e8400-e29b-41d4-a716-446655440033';