import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Employee {
  id: string;
  name: string;
  role: string;
  profileImageUrl?: string;
  isActive: boolean;
  allergies: string[];
  emergencyContacts: Array<{
    name: string;
    relationship: string;
    phone: string;
  }>;
  interestsMotivators: string[];
  challenges: string[];
  regulationStrategies: string[];
  createdAt: string;
  updatedAt: string;
}

export interface GoalStep {
  id: string;
  stepOrder: number;
  stepDescription: string;
  isRequired: boolean;
}

export interface DevelopmentGoal {
  id: string;
  employeeId: string;
  title: string;
  description: string;
  startDate: string;
  targetEndDate: string;
  status: 'active' | 'maintenance' | 'archived';
  masteryAchieved: boolean;
  masteryDate?: string;
  consecutiveAllCorrect: number;
  steps: GoalStep[];
}

export interface ShiftRoster {
  id: string;
  managerId: string;
  date: string;
  startTime: string;
  endTime?: string;
  employeeIds: string[];
  isActive: boolean;
}

export interface StepProgress {
  id: string;
  developmentGoalId: string;
  goalStepId: string;
  employeeId: string;
  shiftRosterId: string;
  date: string;
  outcome: 'correct' | 'verbal_prompt' | 'na';
  notes?: string;
}

export interface ShiftSummary {
  id: string;
  employeeId: string;
  shiftRosterId: string;
  date: string;
  summary: string;
  createdAt: string;
  updatedAt: string;
}

export interface GoalTemplate {
  id: string;
  name: string;
  goalStatement: string;
  defaultMasteryCriteria: string;
  defaultTargetDate: string;
  status: 'active' | 'archived';
  steps: Array<{
    id: string;
    stepOrder: number;
    stepDescription: string;
    isRequired: boolean;
  }>;
}

interface DataContextType {
  employees: Employee[];
  activeShift: ShiftRoster | null;
  developmentGoals: DevelopmentGoal[];
  goalTemplates: GoalTemplate[];
  stepProgress: StepProgress[];
  shiftSummaries: ShiftSummary[];
  addEmployee: (employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  createShift: (employeeIds: string[]) => void;
  endShift: () => void;
  recordStepProgress: (progress: Omit<StepProgress, 'id' | 'date'>) => void;
  saveShiftSummary: (employeeId: string, shiftId: string, summary: string) => void;
  createGoalFromTemplate: (templateId: string, employeeId: string) => void;
  addGoalTemplate: (template: Omit<GoalTemplate, 'id'>) => void;
  updateGoal: (goalId: string, updates: Partial<DevelopmentGoal>) => void;
  archiveGoal: (goalId: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [activeShift, setActiveShift] = useState<ShiftRoster | null>(null);
  const [developmentGoals, setDevelopmentGoals] = useState<DevelopmentGoal[]>([]);
  const [goalTemplates, setGoalTemplates] = useState<GoalTemplate[]>([]);
  const [stepProgress, setStepProgress] = useState<StepProgress[]>([]);
  const [shiftSummaries, setShiftSummaries] = useState<ShiftSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Add a timeout to prevent infinite loading
    const loadTimeout = setTimeout(() => {
      console.warn('Data loading timeout, falling back to demo data');
      loadDemoData();
      setLoading(false);
    }, 5000);

    loadData().finally(() => {
      clearTimeout(loadTimeout);
    });

    return () => clearTimeout(loadTimeout);
  }, []);

  const loadData = async () => {
    try {
      // Check if Supabase is properly configured with real values
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      // Debug logging to check environment variables
      console.log('Environment check:', {
        supabaseUrl: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'undefined',
        supabaseKey: supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'undefined',
        isPlaceholderUrl: supabaseUrl === 'https://placeholder.supabase.co',
        isPlaceholderKey: supabaseKey === 'placeholder-key',
        hasValidConfig: !!(supabaseUrl && supabaseKey && supabaseUrl !== 'https://placeholder.supabase.co' && supabaseKey !== 'placeholder-key')
      });
      
      if (!supabaseUrl || !supabaseKey || supabaseUrl === 'https://placeholder.supabase.co' || supabaseKey === 'placeholder-key') {
        console.warn('Supabase not configured properly. Using demo data.');
        loadDemoData();
        return;
      }

      await loadSupabaseData();
    } catch (error) {
      console.error('Error loading data:', error);
      console.warn('Falling back to demo data');
      loadDemoData();
    }
  };

  const loadSupabaseData = async () => {
    try {
      console.log('Attempting to load data from Supabase...');

      // Load employees
      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select('*')
        .order('name');

      if (employeesError) {
        console.error('Error loading employees:', employeesError);
        // If tables don't exist, show a helpful message
        if (employeesError.code === 'PGRST205') {
          console.warn('Database tables not found. Please run the database migrations first.');
          throw new Error('Database tables not found');
        }
        throw employeesError;
      }

      console.log('Successfully loaded employees from Supabase');

      // Transform database data to match interface
      const transformedEmployees: Employee[] = employeesData.map(emp => ({
        id: emp.id,
        name: emp.name,
        role: emp.role,
        profileImageUrl: emp.profile_image_url,
        isActive: emp.is_active,
        allergies: emp.allergies || [],
        emergencyContacts: emp.emergency_contacts || [],
        interestsMotivators: emp.interests_motivators || [],
        challenges: emp.challenges || [],
        regulationStrategies: emp.regulation_strategies || [],
        createdAt: emp.created_at,
        updatedAt: emp.updated_at
      }));

      setEmployees(transformedEmployees);

      // Load goal templates with steps
      const { data: templatesData, error: templatesError } = await supabase
        .from('goal_templates')
        .select(`
          *,
          goal_template_steps (
            id,
            step_order,
            step_description,
            is_required
          )
        `)
        .order('name');

      if (templatesError) throw templatesError;

      const transformedTemplates: GoalTemplate[] = templatesData.map(template => ({
        id: template.id,
        name: template.name,
        goalStatement: template.goal_statement,
        defaultMasteryCriteria: template.default_mastery_criteria,
        defaultTargetDate: template.default_target_date,
        status: template.status,
        steps: template.goal_template_steps.map((step: any) => ({
          id: step.id,
          stepOrder: step.step_order,
          stepDescription: step.step_description,
          isRequired: step.is_required
        }))
      }));

      setGoalTemplates(transformedTemplates);

      // Load development goals with steps
      const { data: goalsData, error: goalsError } = await supabase
        .from('development_goals')
        .select(`
          *,
          goal_steps (
            id,
            step_order,
            step_description,
            is_required
          )
        `)
        .order('created_at');

      if (goalsError) throw goalsError;

      const transformedGoals: DevelopmentGoal[] = goalsData.map(goal => ({
        id: goal.id,
        employeeId: goal.employee_id,
        title: goal.title,
        description: goal.description,
        startDate: goal.start_date,
        targetEndDate: goal.target_end_date,
        status: goal.status,
        masteryAchieved: goal.mastery_achieved,
        masteryDate: goal.mastery_date,
        consecutiveAllCorrect: goal.consecutive_all_correct,
        steps: goal.goal_steps.map((step: any) => ({
          id: step.id,
          stepOrder: step.step_order,
          stepDescription: step.step_description,
          isRequired: step.is_required
        }))
      }));

      setDevelopmentGoals(transformedGoals);

      // Load step progress
      const { data: progressData, error: progressError } = await supabase
        .from('step_progress')
        .select('*')
        .order('created_at', { ascending: false });

      if (progressError) throw progressError;

      const transformedProgress: StepProgress[] = progressData.map(progress => ({
        id: progress.id,
        developmentGoalId: progress.development_goal_id,
        goalStepId: progress.goal_step_id,
        employeeId: progress.employee_id,
        shiftRosterId: progress.shift_roster_id,
        date: progress.date,
        outcome: progress.outcome,
        notes: progress.notes
      }));

      setStepProgress(transformedProgress);

      // Load shift summaries
      const { data: summariesData, error: summariesError } = await supabase
        .from('shift_summaries')
        .select('*')
        .order('created_at', { ascending: false });

      if (summariesError) throw summariesError;

      const transformedSummaries: ShiftSummary[] = summariesData.map(summary => ({
        id: summary.id,
        employeeId: summary.employee_id,
        shiftRosterId: summary.shift_roster_id,
        date: summary.date,
        summary: summary.summary,
        createdAt: summary.created_at,
        updatedAt: summary.updated_at
      }));

      setShiftSummaries(transformedSummaries);

      // Load active shift
      const { data: activeShiftData, error: shiftError } = await supabase
        .from('shift_rosters')
        .select('*')
        .eq('is_active', true)
        .maybeSingle();

      if (shiftError) {
        throw shiftError;
      }
      
      if (activeShiftData) {
        const transformedShift: ShiftRoster = {
          id: activeShiftData.id,
          managerId: activeShiftData.manager_id,
          date: activeShiftData.date,
          startTime: activeShiftData.start_time,
          endTime: activeShiftData.end_time,
          employeeIds: activeShiftData.employee_ids || [],
          isActive: activeShiftData.is_active
        };
        setActiveShift(transformedShift);
      } else {
        setActiveShift(null);
      }

      console.log('Successfully loaded all data from Supabase');
    } catch (error) {
      console.error('Error in loadSupabaseData:', error);
      throw error; // Re-throw to be caught by loadData
    }
  };

  const loadDemoData = () => {
    console.log('Loading demo data...');
    // Load demo employees
    const demoEmployees: Employee[] = [
      {
        id: '1',
        name: 'Alex Johnson',
        role: 'Super Scooper',
        profileImageUrl: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
        isActive: true,
        allergies: ['Nuts', 'Dairy'],
        emergencyContacts: [
          { name: 'Sarah Johnson', relationship: 'Mother', phone: '555-0123' }
        ],
        interestsMotivators: ['Music', 'Art', 'Praise and recognition'],
        challenges: ['Loud noises', 'Sudden changes'],
        regulationStrategies: ['5-minute breaks', 'Visual schedules', 'Calm voice'],
        createdAt: '2024-01-15T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z'
      },
      {
        id: '2',
        name: 'Emma Davis',
        role: 'Super Scooper',
        profileImageUrl: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
        isActive: true,
        allergies: [],
        emergencyContacts: [
          { name: 'Mike Davis', relationship: 'Father', phone: '555-0456' }
        ],
        interestsMotivators: ['Animals', 'Colorful stickers', 'Team activities'],
        challenges: ['Complex instructions'],
        regulationStrategies: ['Break tasks into steps', 'Use positive reinforcement'],
        createdAt: '2024-01-20T00:00:00Z',
        updatedAt: '2024-01-20T00:00:00Z'
      }
    ];

    // Load demo goal templates
    const demoTemplates: GoalTemplate[] = [
      {
        id: '1',
        name: 'Ice Cream Flavors Knowledge',
        goalStatement: 'Employee will demonstrate knowledge of all ice cream flavors and their ingredients',
        defaultMasteryCriteria: '3 consecutive shifts with all required steps Correct',
        defaultTargetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'active',
        steps: [
          {
            id: '1',
            stepOrder: 1,
            stepDescription: 'Name all available ice cream flavors',
            isRequired: true
          },
          {
            id: '2',
            stepOrder: 2,
            stepDescription: 'Identify ingredients in each flavor',
            isRequired: true
          }
        ]
      }
    ];

    // Load demo development goals
    const demoGoals: DevelopmentGoal[] = [
      {
        id: '1',
        employeeId: '1',
        title: 'Ice Cream Flavors Knowledge',
        description: 'Learn all ice cream flavors and their ingredients',
        startDate: '2024-01-15',
        targetEndDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'active',
        masteryAchieved: false,
        consecutiveAllCorrect: 1,
        steps: [
          {
            id: '1',
            stepOrder: 1,
            stepDescription: 'Name all available ice cream flavors',
            isRequired: true
          },
          {
            id: '2',
            stepOrder: 2,
            stepDescription: 'Identify ingredients in each flavor',
            isRequired: true
          }
        ]
      }
    ];

    setEmployees(demoEmployees);
    setGoalTemplates(demoTemplates);
    setDevelopmentGoals(demoGoals);
    setStepProgress([]);
    setShiftSummaries([]);
    setActiveShift(null);
    console.log('Demo data loaded successfully');
  };

  const addEmployee = (employeeData: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>) => {
    // Check if we're in demo mode
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey || supabaseUrl === 'https://placeholder.supabase.co' || supabaseKey === 'placeholder-key') {
      // Demo mode - just add to local state
      const newEmployee: Employee = {
        ...employeeData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setEmployees(prev => [...prev, newEmployee]);
      return;
    }

    const addEmployeeAsync = async () => {
      try {
        const { data, error } = await supabase
          .from('employees')
          .insert({
            name: employeeData.name,
            role: employeeData.role,
            profile_image_url: employeeData.profileImageUrl,
            is_active: employeeData.isActive,
            allergies: employeeData.allergies,
            emergency_contacts: employeeData.emergencyContacts,
            interests_motivators: employeeData.interestsMotivators,
            challenges: employeeData.challenges,
            regulation_strategies: employeeData.regulationStrategies
          })
          .select()
          .single();

        if (error) throw error;

        const newEmployee: Employee = {
          id: data.id,
          name: data.name,
          role: data.role,
          profileImageUrl: data.profile_image_url,
          isActive: data.is_active,
          allergies: data.allergies || [],
          emergencyContacts: data.emergency_contacts || [],
          interestsMotivators: data.interests_motivators || [],
          challenges: data.challenges || [],
          regulationStrategies: data.regulation_strategies || [],
          createdAt: data.created_at,
          updatedAt: data.updated_at
        };

        setEmployees(prev => [...prev, newEmployee]);
      } catch (error) {
        console.error('Error adding employee:', error);
      }
    };

    addEmployeeAsync();
  };

  const updateEmployee = (id: string, updates: Partial<Employee>) => {
    // Check if we're in demo mode
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey || supabaseUrl === 'https://placeholder.supabase.co' || supabaseKey === 'placeholder-key') {
      // Demo mode - just update local state
      setEmployees(prev => prev.map(emp => 
        emp.id === id 
          ? { ...emp, ...updates, updatedAt: new Date().toISOString() }
          : emp
      ));
      return;
    }

    const updateEmployeeAsync = async () => {
      try {
        const { data, error } = await supabase
          .from('employees')
          .update({
            name: updates.name,
            role: updates.role,
            profile_image_url: updates.profileImageUrl,
            is_active: updates.isActive,
            allergies: updates.allergies,
            emergency_contacts: updates.emergencyContacts,
            interests_motivators: updates.interestsMotivators,
            challenges: updates.challenges,
            regulation_strategies: updates.regulationStrategies
          })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;

        setEmployees(prev => prev.map(emp => 
          emp.id === id 
            ? {
                ...emp,
                name: data.name,
                role: data.role,
                profileImageUrl: data.profile_image_url,
                isActive: data.is_active,
                allergies: data.allergies || [],
                emergencyContacts: data.emergency_contacts || [],
                interestsMotivators: data.interests_motivators || [],
                challenges: data.challenges || [],
                regulationStrategies: data.regulation_strategies || [],
                updatedAt: data.updated_at
              }
            : emp
        ));
      } catch (error) {
        console.error('Error updating employee:', error);
      }
    };

    updateEmployeeAsync();
  };

  const createShift = (employeeIds: string[]) => {
    // Check if we're in demo mode
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey || supabaseUrl === 'https://placeholder.supabase.co' || supabaseKey === 'placeholder-key') {
      // Demo mode - create shift in local state
      const newShift: ShiftRoster = {
        id: Date.now().toString(),
        managerId: 'demo-user',
        date: new Date().toISOString().split('T')[0],
        startTime: new Date().toLocaleTimeString(),
        employeeIds,
        isActive: true
      };
      setActiveShift(newShift);
      return;
    }

    const createShiftAsync = async () => {
      try {
        const { data, error } = await supabase
          .from('shift_rosters')
          .insert({
            date: new Date().toISOString().split('T')[0],
            start_time: new Date().toLocaleTimeString(),
            location: '9540 Nall Avenue', // Default location
            employee_ids: employeeIds,
            is_active: true
          })
          .select()
          .single();

        if (error) throw error;

        const newShift: ShiftRoster = {
          id: data.id,
          managerId: data.manager_id,
          date: data.date,
          startTime: data.start_time,
          endTime: data.end_time,
          employeeIds: data.employee_ids || [],
          isActive: data.is_active
        };

        setActiveShift(newShift);
      } catch (error) {
        console.error('Error creating shift:', error);
      }
    };

    createShiftAsync();
  };

  const endShift = () => {
    // Check if we're in demo mode
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey || supabaseUrl === 'https://placeholder.supabase.co' || supabaseKey === 'placeholder-key') {
      // Demo mode - just clear active shift
      setActiveShift(null);
      return;
    }

    const endShiftAsync = async () => {
      if (activeShift) {
        try {
          const { error } = await supabase
            .from('shift_rosters')
            .update({
              end_time: new Date().toLocaleTimeString(),
              is_active: false
            })
            .eq('id', activeShift.id);

          if (error) throw error;

          setActiveShift(null);
        } catch (error) {
          console.error('Error ending shift:', error);
        }
      }
    };

    endShiftAsync();
  };

  const recordStepProgress = (progress: Omit<StepProgress, 'id' | 'date'>) => {
    // Check if we're in demo mode
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey || supabaseUrl === 'https://placeholder.supabase.co' || supabaseKey === 'placeholder-key') {
      // Demo mode - add to local state
      const today = new Date().toISOString().split('T')[0];
      const newProgress: StepProgress = {
        ...progress,
        id: Date.now().toString(),
        date: today
      };
      
      setStepProgress(prev => {
        const filtered = prev.filter(p => 
          !(p.developmentGoalId === progress.developmentGoalId &&
            p.goalStepId === progress.goalStepId &&
            p.employeeId === progress.employeeId &&
            p.date === today)
        );
        return [...filtered, newProgress];
      });
      
      // Update goal progress in demo mode
      updateGoalProgressDemo(progress.developmentGoalId, progress.employeeId);
      return;
    }

    const recordProgressAsync = async () => {
      try {
        // First, check if progress already exists for this step today
        const today = new Date().toISOString().split('T')[0];
        const { data: existingProgress, error: checkError } = await supabase
          .from('step_progress')
          .select('id')
          .eq('development_goal_id', progress.developmentGoalId)
          .eq('goal_step_id', progress.goalStepId)
          .eq('employee_id', progress.employeeId)
          .eq('shift_roster_id', progress.shiftRosterId)
          .eq('date', today)
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
          throw checkError;
        }

        let data;
        if (existingProgress) {
          // Update existing progress
          const { data: updateData, error: updateError } = await supabase
            .from('step_progress')
            .update({
              outcome: progress.outcome,
              notes: progress.notes
            })
            .eq('id', existingProgress.id)
            .select()
            .single();

          if (updateError) throw updateError;
          data = updateData;
        } else {
          // Insert new progress
          const { data: insertData, error: insertError } = await supabase
            .from('step_progress')
            .insert({
              development_goal_id: progress.developmentGoalId,
              goal_step_id: progress.goalStepId,
              employee_id: progress.employeeId,
              shift_roster_id: progress.shiftRosterId,
              date: today,
              outcome: progress.outcome,
              notes: progress.notes
            })
            .select()
            .single();

          if (insertError) throw insertError;
          data = insertData;
        }

        const newProgress: StepProgress = {
          id: data.id,
          developmentGoalId: data.development_goal_id,
          goalStepId: data.goal_step_id,
          employeeId: data.employee_id,
          shiftRosterId: data.shift_roster_id,
          date: data.date,
          outcome: data.outcome,
          notes: data.notes
        };

        // Update local state
        setStepProgress(prev => {
          const filtered = prev.filter(p => 
            !(p.developmentGoalId === progress.developmentGoalId &&
              p.goalStepId === progress.goalStepId &&
              p.employeeId === progress.employeeId &&
              p.date === today)
          );
          return [...filtered, newProgress];
        });

        // Update consecutive correct count
        updateGoalProgress(progress.developmentGoalId, progress.employeeId);
      } catch (error) {
        console.error('Error recording step progress:', error);
      }
    };

    recordProgressAsync();
  };

  const updateGoalProgressDemo = (goalId: string, employeeId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const todayProgress = stepProgress.filter(p => 
      p.developmentGoalId === goalId && 
      p.employeeId === employeeId && 
      p.date === today
    );

    const goal = developmentGoals.find(g => g.id === goalId);
    if (!goal) return;

    const requiredSteps = goal.steps.filter(s => s.isRequired);
    const completedCorrectly = todayProgress.filter(p => p.outcome === 'correct').length;
    const allCorrectToday = completedCorrectly === requiredSteps.length;

    const newConsecutive = allCorrectToday ? goal.consecutiveAllCorrect + 1 : 0;
    const masteryAchieved = newConsecutive >= 3;
    
    setDevelopmentGoals(prev => prev.map(g => {
      if (g.id === goalId) {
        return {
          ...g,
          consecutiveAllCorrect: newConsecutive,
          masteryAchieved,
          masteryDate: masteryAchieved && !g.masteryAchieved ? today : g.masteryDate,
          status: masteryAchieved ? 'maintenance' : g.status
        };
      }
      return g;
    }));
  };

  const saveShiftSummary = (employeeId: string, shiftId: string, summary: string) => {
    // Check if we're in demo mode
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey || supabaseUrl === 'https://placeholder.supabase.co' || supabaseKey === 'placeholder-key') {
      // Demo mode - add to local state
      const today = new Date().toISOString().split('T')[0];
      const newSummary: ShiftSummary = {
        id: Date.now().toString(),
        employeeId,
        shiftRosterId: shiftId,
        date: today,
        summary,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setShiftSummaries(prev => {
        const filtered = prev.filter(s => 
          !(s.employeeId === employeeId && 
            s.shiftRosterId === shiftId && 
            s.date === today)
        );
        return [...filtered, newSummary];
      });
      return;
    }

    const saveSummaryAsync = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        
        // Check if summary already exists
        const { data: existingSummary, error: checkError } = await supabase
          .from('shift_summaries')
          .select('id')
          .eq('employee_id', employeeId)
          .eq('shift_roster_id', shiftId)
          .eq('date', today)
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
          throw checkError;
        }

        let data;
        if (existingSummary) {
          // Update existing summary
          const { data: updateData, error: updateError } = await supabase
            .from('shift_summaries')
            .update({ summary })
            .eq('id', existingSummary.id)
            .select()
            .single();

          if (updateError) throw updateError;
          data = updateData;
        } else {
          // Create new summary
          const { data: insertData, error: insertError } = await supabase
            .from('shift_summaries')
            .insert({
              employee_id: employeeId,
              shift_roster_id: shiftId,
              date: today,
              summary
            })
            .select()
            .single();

          if (insertError) throw insertError;
          data = insertData;
        }

        const transformedSummary: ShiftSummary = {
          id: data.id,
          employeeId: data.employee_id,
          shiftRosterId: data.shift_roster_id,
          date: data.date,
          summary: data.summary,
          createdAt: data.created_at,
          updatedAt: data.updated_at
        };

        // Update local state
        setShiftSummaries(prev => {
          const filtered = prev.filter(s => 
            !(s.employeeId === employeeId && 
              s.shiftRosterId === shiftId && 
              s.date === today)
          );
          return [...filtered, transformedSummary];
        });
      } catch (error) {
        console.error('Error saving shift summary:', error);
      }
    };

    saveSummaryAsync();
  };

  const updateGoalProgress = (goalId: string, employeeId: string) => {
    const updateProgressAsync = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const todayProgress = stepProgress.filter(p => 
          p.developmentGoalId === goalId && 
          p.employeeId === employeeId && 
          p.date === today
        );

        const goal = developmentGoals.find(g => g.id === goalId);
        if (!goal) return;

        const requiredSteps = goal.steps.filter(s => s.isRequired);
        const completedCorrectly = todayProgress.filter(p => p.outcome === 'correct').length;
        const allCorrectToday = completedCorrectly === requiredSteps.length;

        const newConsecutive = allCorrectToday ? goal.consecutiveAllCorrect + 1 : 0;
        const masteryAchieved = newConsecutive >= 3;
        
        const updates: any = {
          consecutive_all_correct: newConsecutive,
          mastery_achieved: masteryAchieved
        };

        if (masteryAchieved && !goal.masteryAchieved) {
          updates.mastery_date = today;
          updates.status = 'maintenance';
        }

        const { error } = await supabase
          .from('development_goals')
          .update(updates)
          .eq('id', goalId);

        if (error) throw error;

        // Update local state
        setDevelopmentGoals(prev => prev.map(g => {
          if (g.id === goalId) {
            return {
              ...g,
              consecutiveAllCorrect: newConsecutive,
              masteryAchieved,
              masteryDate: masteryAchieved && !g.masteryAchieved ? today : g.masteryDate,
              status: masteryAchieved ? 'maintenance' : g.status
            };
          }
          return g;
        }));
      } catch (error) {
        console.error('Error updating goal progress:', error);
      }
    };

    updateProgressAsync();
  };

  const createGoalFromTemplate = (templateId: string, employeeId: string) => {
    // Check if we're in demo mode
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey || supabaseUrl === 'https://placeholder.supabase.co' || supabaseKey === 'placeholder-key') {
      // Demo mode - add to local state
      const template = goalTemplates.find(t => t.id === templateId);
      if (!template) return;

      const newGoal: DevelopmentGoal = {
        id: Date.now().toString(),
        employeeId,
        title: template.name,
        description: template.goalStatement,
        startDate: new Date().toISOString().split('T')[0],
        targetEndDate: template.defaultTargetDate,
        status: 'active',
        masteryAchieved: false,
        consecutiveAllCorrect: 0,
        steps: template.steps.map(step => ({
          id: `${Date.now()}-${step.stepOrder}`,
          stepOrder: step.stepOrder,
          stepDescription: step.stepDescription,
          isRequired: step.isRequired
        }))
      };

      setDevelopmentGoals(prev => [...prev, newGoal]);
      return;
    }

    const createGoalAsync = async () => {
      try {
        const template = goalTemplates.find(t => t.id === templateId);
        if (!template) return;

        // Create the goal
        const { data: goalData, error: goalError } = await supabase
          .from('development_goals')
          .insert({
            employee_id: employeeId,
            title: template.name,
            description: template.goalStatement,
            start_date: new Date().toISOString().split('T')[0],
            target_end_date: template.defaultTargetDate,
            status: 'active',
            mastery_achieved: false,
            consecutive_all_correct: 0
          })
          .select()
          .single();

        if (goalError) throw goalError;

        // Create the goal steps
        const stepInserts = template.steps.map(step => ({
          goal_id: goalData.id,
          step_order: step.stepOrder,
          step_description: step.stepDescription,
          is_required: step.isRequired
        }));

        const { data: stepsData, error: stepsError } = await supabase
          .from('goal_steps')
          .insert(stepInserts)
          .select();

        if (stepsError) throw stepsError;

        const newGoal: DevelopmentGoal = {
          id: goalData.id,
          employeeId: goalData.employee_id,
          title: goalData.title,
          description: goalData.description,
          startDate: goalData.start_date,
          targetEndDate: goalData.target_end_date,
          status: goalData.status,
          masteryAchieved: goalData.mastery_achieved,
          consecutiveAllCorrect: goalData.consecutive_all_correct,
          steps: stepsData.map(step => ({
            id: step.id,
            stepOrder: step.step_order,
            stepDescription: step.step_description,
            isRequired: step.is_required
          }))
        };

        setDevelopmentGoals(prev => [...prev, newGoal]);
      } catch (error) {
        console.error('Error creating goal from template:', error);
      }
    };

    createGoalAsync();
  };

  const addGoalTemplate = (templateData: Omit<GoalTemplate, 'id'>) => {
    // Check if we're in demo mode
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey || supabaseUrl === 'https://placeholder.supabase.co' || supabaseKey === 'placeholder-key') {
      // Demo mode - add to local state
      const newTemplate: GoalTemplate = {
        ...templateData,
        id: Date.now().toString(),
        steps: templateData.steps.map((step, index) => ({
          ...step,
          id: `${Date.now()}-${index}`
        }))
      };
      setGoalTemplates(prev => [...prev, newTemplate]);
      return;
    }

    const addTemplateAsync = async () => {
      try {
        // Create the template
        const { data: templateData_db, error: templateError } = await supabase
          .from('goal_templates')
          .insert({
            name: templateData.name,
            goal_statement: templateData.goalStatement,
            default_mastery_criteria: templateData.defaultMasteryCriteria,
            default_target_date: templateData.defaultTargetDate,
            status: templateData.status
          })
          .select()
          .single();

        if (templateError) throw templateError;

        // Create the template steps
        const stepInserts = templateData.steps.map(step => ({
          template_id: templateData_db.id,
          step_order: step.stepOrder,
          step_description: step.stepDescription,
          is_required: step.isRequired
        }));

        const { data: stepsData, error: stepsError } = await supabase
          .from('goal_template_steps')
          .insert(stepInserts)
          .select();

        if (stepsError) throw stepsError;

        const newTemplate: GoalTemplate = {
          id: templateData_db.id,
          name: templateData_db.name,
          goalStatement: templateData_db.goal_statement,
          defaultMasteryCriteria: templateData_db.default_mastery_criteria,
          defaultTargetDate: templateData_db.default_target_date,
          status: templateData_db.status,
          steps: stepsData.map(step => ({
            id: step.id,
            stepOrder: step.step_order,
            stepDescription: step.step_description,
            isRequired: step.is_required
          }))
        };

        setGoalTemplates(prev => [...prev, newTemplate]);
      } catch (error) {
        console.error('Error adding goal template:', error);
      }
    };

    addTemplateAsync();
  };

  const updateGoal = (goalId: string, updates: Partial<DevelopmentGoal>) => {
    // Check if we're in demo mode
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey || supabaseUrl === 'https://placeholder.supabase.co' || supabaseKey === 'placeholder-key') {
      // Demo mode - update local state
      setDevelopmentGoals(prev => prev.map(goal => 
        goal.id === goalId 
          ? { ...goal, ...updates }
          : goal
      ));
      return;
    }

    const updateGoalAsync = async () => {
      try {
        const { error } = await supabase
          .from('development_goals')
          .update({
            title: updates.title,
            description: updates.description,
            target_end_date: updates.targetEndDate,
            status: updates.status
          })
          .eq('id', goalId);

        if (error) throw error;

        setDevelopmentGoals(prev => prev.map(goal => 
          goal.id === goalId 
            ? { ...goal, ...updates }
            : goal
        ));
      } catch (error) {
        console.error('Error updating goal:', error);
      }
    };

    updateGoalAsync();
  };

  const archiveGoal = (goalId: string) => {
    // Check if we're in demo mode
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey || supabaseUrl === 'https://placeholder.supabase.co' || supabaseKey === 'placeholder-key') {
      // Demo mode - update local state
      setDevelopmentGoals(prev => prev.map(goal => 
        goal.id === goalId 
          ? { ...goal, status: 'archived' as const }
          : goal
      ));
      return;
    }

    const archiveGoalAsync = async () => {
      try {
        const { error } = await supabase
          .from('development_goals')
          .update({ status: 'archived' })
          .eq('id', goalId);

        if (error) throw error;

        setDevelopmentGoals(prev => prev.map(goal => 
          goal.id === goalId 
            ? { ...goal, status: 'archived' as const }
            : goal
        ));
      } catch (error) {
        console.error('Error archiving goal:', error);
      }
    };

    archiveGoalAsync();
  };

  // Set loading to false after data is loaded
  useEffect(() => {
    if (employees.length > 0 || goalTemplates.length > 0) {
      setLoading(false);
    }
  }, [employees, goalTemplates]);

  // Show loading screen only for the first few seconds
  const [showLoading, setShowLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false);
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (loading && showLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Golden Scoop...</p>
          <p className="text-sm text-gray-500 mt-2">Setting up demo data</p>
        </div>
      </div>
    );
  }

  return (
    <DataContext.Provider value={{
      employees,
      activeShift,
      developmentGoals,
      goalTemplates,
      stepProgress,
      shiftSummaries,
      addEmployee,
      updateEmployee,
      createShift,
      endShift,
      recordStepProgress,
      saveShiftSummary,
      createGoalFromTemplate,
      addGoalTemplate,
      updateGoal,
      archiveGoal
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}