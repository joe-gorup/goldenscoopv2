import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please set up your Supabase project.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: 'admin' | 'shift_manager';
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          role: 'admin' | 'shift_manager';
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          role?: 'admin' | 'shift_manager';
          is_active?: boolean;
          updated_at?: string;
        };
      };
      employees: {
        Row: {
          id: string;
          name: string;
          role: string;
          profile_image_url: string | null;
          is_active: boolean;
          allergies: any[];
          emergency_contacts: any[];
          interests_motivators: any[];
          challenges: any[];
          regulation_strategies: any[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          role?: string;
          profile_image_url?: string | null;
          is_active?: boolean;
          allergies?: any[];
          emergency_contacts?: any[];
          interests_motivators?: any[];
          challenges?: any[];
          regulation_strategies?: any[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          role?: string;
          profile_image_url?: string | null;
          is_active?: boolean;
          allergies?: any[];
          emergency_contacts?: any[];
          interests_motivators?: any[];
          challenges?: any[];
          regulation_strategies?: any[];
          updated_at?: string;
        };
      };
      goal_templates: {
        Row: {
          id: string;
          name: string;
          goal_statement: string;
          default_mastery_criteria: string;
          default_target_date: string;
          status: 'active' | 'archived';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          goal_statement: string;
          default_mastery_criteria?: string;
          default_target_date: string;
          status?: 'active' | 'archived';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          goal_statement?: string;
          default_mastery_criteria?: string;
          default_target_date?: string;
          status?: 'active' | 'archived';
          updated_at?: string;
        };
      };
      development_goals: {
        Row: {
          id: string;
          employee_id: string;
          title: string;
          description: string;
          start_date: string;
          target_end_date: string;
          status: 'active' | 'maintenance' | 'archived';
          mastery_achieved: boolean;
          mastery_date: string | null;
          consecutive_all_correct: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          employee_id: string;
          title: string;
          description: string;
          start_date?: string;
          target_end_date: string;
          status?: 'active' | 'maintenance' | 'archived';
          mastery_achieved?: boolean;
          mastery_date?: string | null;
          consecutive_all_correct?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          employee_id?: string;
          title?: string;
          description?: string;
          start_date?: string;
          target_end_date?: string;
          status?: 'active' | 'maintenance' | 'archived';
          mastery_achieved?: boolean;
          mastery_date?: string | null;
          consecutive_all_correct?: number;
          updated_at?: string;
        };
      };
      step_progress: {
        Row: {
          id: string;
          development_goal_id: string;
          goal_step_id: string;
          employee_id: string;
          shift_roster_id: string;
          date: string;
          outcome: 'correct' | 'verbal_prompt' | 'na';
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          development_goal_id: string;
          goal_step_id: string;
          employee_id: string;
          shift_roster_id: string;
          date?: string;
          outcome: 'correct' | 'verbal_prompt' | 'na';
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          development_goal_id?: string;
          goal_step_id?: string;
          employee_id?: string;
          shift_roster_id?: string;
          date?: string;
          outcome?: 'correct' | 'verbal_prompt' | 'na';
          notes?: string | null;
          updated_at?: string;
        };
      };
    };
  };
}