import React, { createContext, useContext, useState, useEffect } from 'react';

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

  useEffect(() => {
    // Initialize with mock data
    const mockEmployees: Employee[] = [
      {
        id: '1',
        name: 'Sally Martinez',
        role: 'Super Scooper',
        profileImageUrl: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
        isActive: true,
        allergies: ['Tree nuts', 'Shellfish'],
        emergencyContacts: [
          { name: 'Maria Martinez', relationship: 'Mother', phone: '(555) 123-4567' },
          { name: 'Carlos Martinez', relationship: 'Father', phone: '(555) 234-5678' }
        ],
        interestsMotivators: ['Pop music', 'High-fives', 'Colorful stickers', 'Compliments on work'],
        challenges: ['Loud noises from blender', 'Rush periods with long lines', 'Remembering multiple orders'],
        regulationStrategies: ['Offer 5-minute breaks during busy periods', 'Use visual order cards', 'Speak in calm, quiet voice', 'Give one task at a time'],
        createdAt: '2024-01-15',
        updatedAt: '2024-01-15'
      },
      {
        id: '2',
        name: 'Alex Thompson',
        role: 'Super Scooper',
        profileImageUrl: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
        isActive: true,
        allergies: [],
        emergencyContacts: [
          { name: 'Jennifer Thompson', relationship: 'Mother', phone: '(555) 345-6789' }
        ],
        interestsMotivators: ['Video games', 'Basketball', 'Earning money', 'Team competitions'],
        challenges: ['Processing multiple instructions at once', 'Remembering ice cream flavor ingredients'],
        regulationStrategies: ['Give one instruction at a time', 'Use positive reinforcement', 'Allow extra processing time', 'Practice flavor knowledge during slow periods'],
        createdAt: '2024-01-10',
        updatedAt: '2024-01-10'
      },
      {
        id: '3',
        name: 'Emma Rodriguez',
        role: 'Super Scooper',
        profileImageUrl: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
        isActive: true,
        allergies: ['Latex'],
        emergencyContacts: [
          { name: 'Rosa Rodriguez', relationship: 'Grandmother', phone: '(555) 456-7890' },
          { name: 'Miguel Rodriguez', relationship: 'Uncle', phone: '(555) 567-8901' }
        ],
        interestsMotivators: ['Art and drawing', 'Helping customers', 'Learning new skills', 'Praise from managers'],
        challenges: ['Anxiety with new customers', 'Counting change quickly', 'Working during busy periods'],
        regulationStrategies: ['Start with familiar customers', 'Use calculator for change', 'Pair with experienced scooper during rush', 'Provide reassurance and encouragement'],
        createdAt: '2024-02-01',
        updatedAt: '2024-02-01'
      },
      {
        id: '4',
        name: 'Jordan Kim',
        role: 'Super Scooper',
        profileImageUrl: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
        isActive: true,
        allergies: ['Dairy', 'Eggs'],
        emergencyContacts: [
          { name: 'Susan Kim', relationship: 'Mother', phone: '(555) 678-9012' }
        ],
        interestsMotivators: ['K-pop music', 'Social media', 'Making friends', 'Earning independence'],
        challenges: ['Social anxiety', 'Speaking loudly enough', 'Initiating conversations with customers'],
        regulationStrategies: ['Practice greetings during training', 'Use scripts for common interactions', 'Start shifts with supportive team members', 'Celebrate small social wins'],
        createdAt: '2024-01-20',
        updatedAt: '2024-01-20'
      },
      {
        id: '5',
        name: 'Marcus Johnson',
        role: 'Super Scooper',
        profileImageUrl: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
        isActive: true,
        allergies: [],
        emergencyContacts: [
          { name: 'Denise Johnson', relationship: 'Mother', phone: '(555) 789-0123' },
          { name: 'Robert Johnson', relationship: 'Father', phone: '(555) 890-1234' }
        ],
        interestsMotivators: ['Football', 'Working out', 'Helping others', 'Being recognized as reliable'],
        challenges: ['Fine motor skills with scooping', 'Patience during slow periods', 'Following detailed cleaning procedures'],
        regulationStrategies: ['Use larger scoop handles', 'Provide movement breaks', 'Break cleaning tasks into smaller steps', 'Assign physical tasks when possible'],
        createdAt: '2024-01-05',
        updatedAt: '2024-01-05'
      },
      {
        id: '6',
        name: 'Aisha Patel',
        role: 'Super Scooper',
        profileImageUrl: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
        isActive: false,
        allergies: ['Peanuts'],
        emergencyContacts: [
          { name: 'Priya Patel', relationship: 'Sister', phone: '(555) 901-2345' }
        ],
        interestsMotivators: ['Reading', 'Animals', 'Quiet environments', 'One-on-one interactions'],
        challenges: ['Loud environments', 'Multi-tasking', 'Time pressure'],
        regulationStrategies: ['Assign quieter work stations', 'Focus on one task at a time', 'Provide noise-canceling headphones during breaks'],
        createdAt: '2024-01-12',
        updatedAt: '2024-03-01'
      }
    ];

    const mockGoalTemplates: GoalTemplate[] = [
      {
        id: '1',
        name: 'Ice Cream Flavors Knowledge',
        goalStatement: 'Employee will independently state all current ice cream flavors and their mix-in ingredients with 100% accuracy in 3 consecutive shifts to increase customer service skills.',
        defaultMasteryCriteria: '3 consecutive shifts with all required steps Correct',
        defaultTargetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 days from now
        status: 'active',
        steps: [
          { id: '1', stepOrder: 1, stepDescription: 'Vanilla — Vanilla ice cream', isRequired: true },
          { id: '2', stepOrder: 2, stepDescription: 'Charlie\'s Chocolate — Chocolate ice cream (regular)', isRequired: true },
          { id: '3', stepOrder: 3, stepDescription: 'Chocolate Gold Rush — Chocolate ice cream with golden Oreos', isRequired: true },
          { id: '4', stepOrder: 4, stepDescription: 'Chocolate No Cow — Dairy-free chocolate; oat and coconut milk; vegan', isRequired: true },
          { id: '5', stepOrder: 5, stepDescription: 'Cookies and Cream — Vanilla ice cream with Oreos', isRequired: true },
          { id: '6', stepOrder: 6, stepDescription: 'Cookie Dough — Vanilla ice cream with cookie dough pieces', isRequired: true },
          { id: '7', stepOrder: 7, stepDescription: 'Coffee — Coffee ice cream', isRequired: true },
          { id: '8', stepOrder: 8, stepDescription: 'Mint Chocolate Chip — Mint ice cream with chocolate chips', isRequired: true }
        ]
      },
      {
        id: '2',
        name: 'Phone Answering Protocol',
        goalStatement: 'Employee will independently answer the shop phone and answer all common questions asked by customers with 100% accuracy to increase independence in the workplace.',
        defaultMasteryCriteria: '3 consecutive shifts with all required steps Correct',
        defaultTargetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'active',
        steps: [
          { id: '1', stepOrder: 1, stepDescription: 'Picks up the phone', isRequired: true },
          { id: '2', stepOrder: 2, stepDescription: 'Selects "talk"', isRequired: true },
          { id: '3', stepOrder: 3, stepDescription: 'Brings the phone to ear', isRequired: true },
          { id: '4', stepOrder: 4, stepDescription: 'Says greeting: "Thank you for calling The Golden Scoop, this is [name], how can I help you?"', isRequired: true },
          { id: '5', stepOrder: 5, stepDescription: 'Answers the question or states "Let me grab my manager for you"', isRequired: true },
          { id: '6', stepOrder: 6, stepDescription: 'Hands the phone to a manager (if applicable)', isRequired: false },
          { id: '7', stepOrder: 7, stepDescription: 'Says "Thank you, have a nice day, bye"', isRequired: true },
          { id: '8', stepOrder: 8, stepDescription: 'Selects "end" on the phone', isRequired: true },
          { id: '9', stepOrder: 9, stepDescription: 'Puts the phone on the charger', isRequired: true }
        ]
      }
    ];

    const mockDevelopmentGoals: DevelopmentGoal[] = [
      {
        id: '1',
        employeeId: '1',
        title: 'Ice Cream Flavors Knowledge',
        description: 'Sally will independently state all current ice cream flavors and their mix-in ingredients with 100% accuracy in 3 consecutive shifts to increase customer service skills.',
        startDate: '2024-12-01',
        targetEndDate: '2025-03-01',
        status: 'active',
        masteryAchieved: false,
        consecutiveAllCorrect: 1,
        steps: [
          { id: '1', stepOrder: 1, stepDescription: 'Vanilla — Vanilla ice cream', isRequired: true },
          { id: '2', stepOrder: 2, stepDescription: 'Charlie\'s Chocolate — Chocolate ice cream (regular)', isRequired: true },
          { id: '3', stepOrder: 3, stepDescription: 'Cookies and Cream — Vanilla ice cream with Oreos', isRequired: true },
          { id: '4', stepOrder: 4, stepDescription: 'Cookie Dough — Vanilla ice cream with cookie dough pieces', isRequired: true }
        ]
      },
      {
        id: '2',
        employeeId: '1',
        title: 'Customer Greeting Skills',
        description: 'Sally will greet every customer within 30 seconds of entry with appropriate eye contact and friendly demeanor.',
        startDate: '2024-11-15',
        targetEndDate: '2025-02-15',
        status: 'active',
        masteryAchieved: false,
        consecutiveAllCorrect: 0,
        steps: [
          { id: '5', stepOrder: 1, stepDescription: 'Makes eye contact with customer', isRequired: true },
          { id: '6', stepOrder: 2, stepDescription: 'Smiles and says "Welcome to The Golden Scoop"', isRequired: true },
          { id: '7', stepOrder: 3, stepDescription: 'Asks "How can I help you today?"', isRequired: true }
        ]
      },
      {
        id: '3',
        employeeId: '2',
        title: 'Phone Answering Protocol',
        description: 'Alex will independently answer the shop phone and handle common customer questions with 100% accuracy to increase workplace independence.',
        startDate: '2024-12-10',
        targetEndDate: '2025-03-10',
        status: 'active',
        masteryAchieved: false,
        consecutiveAllCorrect: 2,
        steps: [
          { id: '8', stepOrder: 1, stepDescription: 'Picks up the phone within 3 rings', isRequired: true },
          { id: '9', stepOrder: 2, stepDescription: 'Says greeting: "Thank you for calling The Golden Scoop, this is Alex, how can I help you?"', isRequired: true },
          { id: '10', stepOrder: 3, stepDescription: 'Answers hours question: "We\'re open 11am to 9pm daily"', isRequired: true },
          { id: '11', stepOrder: 4, stepDescription: 'Answers location question or transfers to manager', isRequired: true },
          { id: '12', stepOrder: 5, stepDescription: 'Says "Thank you, have a great day" before hanging up', isRequired: true }
        ]
      },
      {
        id: '4',
        employeeId: '3',
        title: 'Cash Register Operation',
        description: 'Emma will independently operate the cash register for simple transactions with 100% accuracy to build confidence and independence.',
        startDate: '2024-12-05',
        targetEndDate: '2025-03-05',
        status: 'active',
        masteryAchieved: false,
        consecutiveAllCorrect: 0,
        steps: [
          { id: '13', stepOrder: 1, stepDescription: 'Greets customer and asks for their order', isRequired: true },
          { id: '14', stepOrder: 2, stepDescription: 'Enters items correctly on register', isRequired: true },
          { id: '15', stepOrder: 3, stepDescription: 'States total clearly to customer', isRequired: true },
          { id: '16', stepOrder: 4, stepDescription: 'Processes payment (cash or card)', isRequired: true },
          { id: '17', stepOrder: 5, stepDescription: 'Gives correct change and receipt', isRequired: true }
        ]
      },
      {
        id: '5',
        employeeId: '4',
        title: 'Customer Interaction Confidence',
        description: 'Jordan will initiate friendly conversations with customers and speak at appropriate volume to improve social skills and customer service.',
        startDate: '2024-11-20',
        targetEndDate: '2025-02-20',
        status: 'active',
        masteryAchieved: false,
        consecutiveAllCorrect: 1,
        steps: [
          { id: '18', stepOrder: 1, stepDescription: 'Makes eye contact when greeting customers', isRequired: true },
          { id: '19', stepOrder: 2, stepDescription: 'Speaks loud enough to be heard clearly', isRequired: true },
          { id: '20', stepOrder: 3, stepDescription: 'Asks at least one friendly question (weather, day, etc.)', isRequired: false },
          { id: '21', stepOrder: 4, stepDescription: 'Thanks customer and wishes them well', isRequired: true }
        ]
      },
      {
        id: '6',
        employeeId: '5',
        title: 'Cleaning and Sanitization',
        description: 'Marcus will complete end-of-shift cleaning checklist independently with 100% accuracy to maintain health standards.',
        startDate: '2024-12-01',
        targetEndDate: '2025-03-01',
        status: 'maintenance',
        masteryAchieved: true,
        masteryDate: '2024-12-15',
        consecutiveAllCorrect: 5,
        steps: [
          { id: '22', stepOrder: 1, stepDescription: 'Wipes down all counters with sanitizer', isRequired: true },
          { id: '23', stepOrder: 2, stepDescription: 'Cleans ice cream scoops and utensils', isRequired: true },
          { id: '24', stepOrder: 3, stepDescription: 'Sweeps and mops floor areas', isRequired: true },
          { id: '25', stepOrder: 4, stepDescription: 'Empties trash and replaces liners', isRequired: true },
          { id: '26', stepOrder: 5, stepDescription: 'Checks and refills napkin/spoon dispensers', isRequired: false }
        ]
      }
    ];

    setEmployees(mockEmployees);
    setGoalTemplates(mockGoalTemplates);
    setDevelopmentGoals(mockDevelopmentGoals);
  }, []);

  const addEmployee = (employeeData: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newEmployee: Employee = {
      ...employeeData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setEmployees(prev => [...prev, newEmployee]);
  };

  const updateEmployee = (id: string, updates: Partial<Employee>) => {
    setEmployees(prev => prev.map(emp => 
      emp.id === id 
        ? { ...emp, ...updates, updatedAt: new Date().toISOString() }
        : emp
    ));
  };

  const createShift = (employeeIds: string[]) => {
    const newShift: ShiftRoster = {
      id: Date.now().toString(),
      managerId: '1', // Would be current user ID
      date: new Date().toISOString().split('T')[0],
      startTime: new Date().toLocaleTimeString(),
      employeeIds,
      isActive: true
    };
    setActiveShift(newShift);
  };

  const endShift = () => {
    if (activeShift) {
      setActiveShift({
        ...activeShift,
        endTime: new Date().toLocaleTimeString(),
        isActive: false
      });
      setActiveShift(null);
    }
  };

  const recordStepProgress = (progress: Omit<StepProgress, 'id' | 'date'>) => {
    const newProgress: StepProgress = {
      ...progress,
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0]
    };
    setStepProgress(prev => [...prev, newProgress]);

    // Update consecutive correct count
    updateGoalProgress(progress.developmentGoalId, progress.employeeId);
  };

  const saveShiftSummary = (employeeId: string, shiftId: string, summary: string) => {
    const today = new Date().toISOString().split('T')[0];
    const existingSummary = shiftSummaries.find(s => 
      s.employeeId === employeeId && 
      s.shiftRosterId === shiftId && 
      s.date === today
    );

    if (existingSummary) {
      // Update existing summary
      setShiftSummaries(prev => prev.map(s => 
        s.id === existingSummary.id 
          ? { ...s, summary, updatedAt: new Date().toISOString() }
          : s
      ));
    } else {
      // Create new summary
      const newSummary: ShiftSummary = {
        id: Date.now().toString(),
        employeeId,
        shiftRosterId: shiftId,
        date: today,
        summary,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setShiftSummaries(prev => [...prev, newSummary]);
    }
  };

  const updateGoalProgress = (goalId: string, employeeId: string) => {
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

    setDevelopmentGoals(prev => prev.map(g => {
      if (g.id === goalId) {
        const newConsecutive = allCorrectToday ? g.consecutiveAllCorrect + 1 : 0;
        const masteryAchieved = newConsecutive >= 3;
        
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

  const createGoalFromTemplate = (templateId: string, employeeId: string) => {
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
        id: Date.now().toString() + step.id,
        stepOrder: step.stepOrder,
        stepDescription: step.stepDescription,
        isRequired: step.isRequired
      }))
    };

    setDevelopmentGoals(prev => [...prev, newGoal]);
  };

  const addGoalTemplate = (templateData: Omit<GoalTemplate, 'id'>) => {
    const newTemplate: GoalTemplate = {
      ...templateData,
      id: Date.now().toString()
    };
    setGoalTemplates(prev => [...prev, newTemplate]);
  };

  const updateGoal = (goalId: string, updates: Partial<DevelopmentGoal>) => {
    setDevelopmentGoals(prev => prev.map(goal => 
      goal.id === goalId 
        ? { ...goal, ...updates }
        : goal
    ));
  };

  const archiveGoal = (goalId: string) => {
    setDevelopmentGoals(prev => prev.map(goal => 
      goal.id === goalId 
        ? { ...goal, status: 'archived' as const }
        : goal
    ));
  };

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