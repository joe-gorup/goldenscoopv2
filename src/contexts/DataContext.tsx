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
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Check if Supabase is properly configured
      if (!supabase.supabaseUrl || !supabase.supabaseKey) {
        console.warn('Supabase not configured. Please connect to Supabase first.');
        setLoading(false);
        return;
      }

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
          setLoading(false);
          return;
        }
        throw employeesError;
      }

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
        .single();

      if (shiftError && shiftError.code !== 'PGRST116') {
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
      }

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addEmployee = (employeeData: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>) => {
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

  const saveShiftSummary = (employeeId: string, shiftId: string, summary: string) => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading data...</p>
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