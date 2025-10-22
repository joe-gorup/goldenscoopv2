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

export interface GoalAssessment {
  id: string;
  employeeId: string;
  shiftRosterId: string;
  goalId: string;
  isIncluded: boolean;
  date: string;
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
  goalAssessments: GoalAssessment[];
  addEmployee: (employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  createShift: (employeeIds: string[]) => void;
  endShift: () => void;
  recordStepProgress: (progress: Omit<StepProgress, 'id' | 'date'>) => void;
  saveShiftSummary: (employeeId: string, shiftId: string, summary: string) => void;
  setGoalAssessment: (employeeId: string, shiftId: string, goalId: string, isIncluded: boolean) => void;
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
  const [goalAssessments, setGoalAssessments] = useState<GoalAssessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Add a timeout to prevent infinite loading
    const loadTimeout = setTimeout(() => {
      console.warn('Data loading timeout, falling back to demo data');
      loadDemoData();
      setLoading(false);
    }, 5000);

    // Always use demo data for now
    loadDemoData();
    setLoading(false);
    clearTimeout(loadTimeout);

    return () => clearTimeout(loadTimeout);
  }, []);

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
      },
      {
        id: '2',
        name: 'Customer Greeting',
        goalStatement: 'Employee will greet customers warmly and engage in friendly conversation',
        defaultMasteryCriteria: '3 consecutive shifts with all required steps Correct',
        defaultTargetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'active',
        steps: [
          {
            id: '1',
            stepOrder: 1,
            stepDescription: 'Make eye contact and smile at customer',
            isRequired: true
          },
          {
            id: '2',
            stepOrder: 2,
            stepDescription: 'Use greeting phrase',
            isRequired: true
          },
          {
            id: '3',
            stepOrder: 3,
            stepDescription: 'Ask how they can help',
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
            id: 'goal1-step1',
            stepOrder: 1,
            stepDescription: 'Name all available ice cream flavors',
            isRequired: true
          },
          {
            id: 'goal1-step2',
            stepOrder: 2,
            stepDescription: 'Identify ingredients in each flavor',
            isRequired: true
          }
        ]
      },
      {
        id: '2',
        employeeId: '1',
        title: 'Customer Greeting',
        description: 'Greet customers warmly and engage in friendly conversation',
        startDate: '2024-01-15',
        targetEndDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'active',
        masteryAchieved: false,
        consecutiveAllCorrect: 0,
        steps: [
          {
            id: 'goal2-step1',
            stepOrder: 1,
            stepDescription: 'Make eye contact and smile at customer',
            isRequired: true
          },
          {
            id: 'goal2-step2',
            stepOrder: 2,
            stepDescription: 'Use greeting phrase',
            isRequired: true
          },
          {
            id: 'goal2-step3',
            stepOrder: 3,
            stepDescription: 'Ask how they can help',
            isRequired: true
          }
        ]
      },
      {
        id: '3',
        employeeId: '2',
        title: 'Ice Cream Flavors Knowledge',
        description: 'Learn all ice cream flavors and their ingredients',
        startDate: '2024-01-20',
        targetEndDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'active',
        masteryAchieved: false,
        consecutiveAllCorrect: 2,
        steps: [
          {
            id: 'goal3-step1',
            stepOrder: 1,
            stepDescription: 'Name all available ice cream flavors',
            isRequired: true
          },
          {
            id: 'goal3-step2',
            stepOrder: 2,
            stepDescription: 'Identify ingredients in each flavor',
            isRequired: true
          }
        ]
      },
      {
        id: '4',
        employeeId: '2',
        title: 'Customer Greeting',
        description: 'Greet customers warmly and engage in friendly conversation',
        startDate: '2024-01-20',
        targetEndDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'active',
        masteryAchieved: false,
        consecutiveAllCorrect: 1,
        steps: [
          {
            id: 'goal4-step1',
            stepOrder: 1,
            stepDescription: 'Make eye contact and smile at customer',
            isRequired: true
          },
          {
            id: 'goal4-step2',
            stepOrder: 2,
            stepDescription: 'Use greeting phrase',
            isRequired: true
          },
          {
            id: 'goal4-step3',
            stepOrder: 3,
            stepDescription: 'Ask how they can help',
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
    // Demo mode - just add to local state
    const newEmployee: Employee = {
      ...employeeData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setEmployees(prev => [...prev, newEmployee]);
  };

  const updateEmployee = (id: string, updates: Partial<Employee>) => {
    // Demo mode - just update local state
    setEmployees(prev => prev.map(emp => 
      emp.id === id 
        ? { ...emp, ...updates, updatedAt: new Date().toISOString() }
        : emp
    ));
  };

  const createShift = (employeeIds: string[]) => {
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
  };

  const endShift = () => {
    // Demo mode - just clear active shift
    setActiveShift(null);
  };

  const recordStepProgress = (progress: Omit<StepProgress, 'id' | 'date'>) => {
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
  };

  const updateGoalProgressDemo = (goalId: string, employeeId: string) => {
    const today = new Date().toISOString().split('T')[0];

    if (!activeShift) return;

    const goalAssessment = goalAssessments.find(a =>
      a.goalId === goalId &&
      a.employeeId === employeeId &&
      a.shiftRosterId === activeShift.id &&
      a.date === today
    );

    if (goalAssessment && !goalAssessment.isIncluded) {
      return;
    }

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
  };

  const updateGoal = (goalId: string, updates: Partial<DevelopmentGoal>) => {
    // Demo mode - update local state
    setDevelopmentGoals(prev => prev.map(goal => 
      goal.id === goalId 
        ? { ...goal, ...updates }
        : goal
    ));
  };

  const archiveGoal = (goalId: string) => {
    // Demo mode - update local state
    setDevelopmentGoals(prev => prev.map(goal =>
      goal.id === goalId
        ? { ...goal, status: 'archived' as const }
        : goal
    ));
  };

  const setGoalAssessment = (employeeId: string, shiftId: string, goalId: string, isIncluded: boolean) => {
    const today = new Date().toISOString().split('T')[0];
    const newAssessment: GoalAssessment = {
      id: `${employeeId}-${shiftId}-${goalId}`,
      employeeId,
      shiftRosterId: shiftId,
      goalId,
      isIncluded,
      date: today
    };

    setGoalAssessments(prev => {
      const filtered = prev.filter(a =>
        !(a.employeeId === employeeId &&
          a.shiftRosterId === shiftId &&
          a.goalId === goalId)
      );
      return [...filtered, newAssessment];
    });
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
      goalAssessments,
      addEmployee,
      updateEmployee,
      createShift,
      endShift,
      recordStepProgress,
      saveShiftSummary,
      setGoalAssessment,
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