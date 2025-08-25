import React, { useState, useEffect } from 'react';
import { Target, CheckCircle, AlertCircle, Clock, MessageSquare, Save, ChevronDown, ChevronUp, User, Phone, Heart, Brain, Shield, Zap, AlertTriangle, ChevronRight, FileText } from 'lucide-react';
import { useData, Employee } from '../contexts/DataContext';

// Move OutcomeSelector outside the main component to prevent recreation on every render
const OutcomeSelector = ({ 
  value, 
  onChange, 
  disabled = false,
  stepId,
  saving
}: { 
  value?: 'correct' | 'verbal_prompt' | 'na'; 
  onChange: (value: 'correct' | 'verbal_prompt' | 'na') => void;
  disabled?: boolean;
  stepId: string;
  saving?: boolean;
}) => {
  const options = [
    { 
      value: 'correct' as const, 
      label: 'Correct', 
      textColor: 'text-green-700', 
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      hoverColor: 'hover:bg-green-100'
    },
    { 
      value: 'verbal_prompt' as const, 
      label: 'Verbal Prompt', 
      textColor: 'text-yellow-700', 
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      hoverColor: 'hover:bg-yellow-100'
    },
    { 
      value: 'na' as const, 
      label: 'N/A', 
      textColor: 'text-slate-700', 
      bgColor: 'bg-slate-100',
      borderColor: 'border-slate-300',
      hoverColor: 'hover:bg-slate-200'
    }
  ];

  const handleClick = (optionValue: 'correct' | 'verbal_prompt' | 'na') => {
    console.log('OutcomeSelector clicked:', optionValue, 'for step:', stepId);
    if (!disabled && !saving) {
      onChange(optionValue);
    }
  };
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          disabled={disabled || saving}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleClick(option.value);
          }}
          className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all duration-200 ${
            value === option.value
              ? `${option.bgColor} ${option.textColor} ${option.borderColor} shadow-sm`
              : `bg-white text-gray-600 border-gray-300 ${option.hoverColor}`
          } ${disabled || saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-sm'}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

interface EmployeeProgressProps {
  employee: Employee;
  shiftId: string;
  onViewProfile?: () => void;
}

export default function EmployeeProgress({ employee, shiftId, onViewProfile }: EmployeeProgressProps) {
  const { developmentGoals, stepProgress, recordStepProgress, shiftSummaries, saveShiftSummary } = useData();
  const [outcomes, setOutcomes] = useState<Record<string, { outcome: 'correct' | 'verbal_prompt' | 'na'; notes: string }>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [showNotes, setShowNotes] = useState<Record<string, boolean>>({});
  const [showSupportDetails, setShowSupportDetails] = useState(false);
  const [shiftSummary, setShiftSummary] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  
  const employeeGoals = developmentGoals.filter(goal => 
    goal.employeeId === employee.id && goal.status === 'active'
  );
  
  // On active shifts, expand goals by default
  const [expandedGoals, setExpandedGoals] = useState<Record<string, boolean>>(() => {
    const initialExpanded: Record<string, boolean> = {};
    employeeGoals.forEach(goal => {
      initialExpanded[goal.id] = true; // Expanded by default on active shifts
    });
    return initialExpanded;
  });

  const toggleGoalExpansion = (goalId: string) => {
    setExpandedGoals(prev => ({
      ...prev,
      [goalId]: !prev[goalId]
    }));
  };

  const today = new Date().toISOString().split('T')[0];
  const todayProgress = stepProgress.filter(p => 
    p.employeeId === employee.id && 
    p.date === today &&
    p.shiftRosterId === shiftId
  );

  // Get existing shift summary
  const existingSummary = shiftSummaries.find(s => 
    s.employeeId === employee.id && 
    s.shiftRosterId === shiftId && 
    s.date === today
  );

  useEffect(() => {
    // Initialize outcomes with existing progress for today
    const initialOutcomes: Record<string, { outcome: 'correct' | 'verbal_prompt' | 'na'; notes: string }> = {};
    todayProgress.forEach(progress => {
      const stepId = progress.goalStepId;
      initialOutcomes[stepId] = {
        outcome: progress.outcome,
        notes: progress.notes || ''
      };
    });
    setOutcomes(initialOutcomes);
  }, [todayProgress]);

  useEffect(() => {
    // Initialize shift summary with existing data
    if (existingSummary) {
      setShiftSummary(existingSummary.summary);
    }
  }, [existingSummary]);

  const handleOutcomeChange = async (goalId: string, stepId: string, outcome: 'correct' | 'verbal_prompt' | 'na') => {
    const key = stepId;
    
   console.log('handleOutcomeChange called:', { goalId, stepId, outcome, key });
   
    // Auto-open notes section for verbal prompts
    if (outcome === 'verbal_prompt') {
      setShowNotes(prev => ({ ...prev, [key]: true }));
   } else if (outcome === 'na') {
     // Close notes section for N/A
     setShowNotes(prev => ({ ...prev, [key]: false }));
    }
    
    // Update local state immediately for responsive UI
   const newOutcome = {
     outcome, 
     notes: outcome === 'na' ? '' : (outcomes[key]?.notes || '')
   };
   
    setOutcomes(prev => ({
     [key]: newOutcome
      }
    }));
   console.log('Updated outcomes state:', { [key]: newOutcome });

    // Save to data context
    setSaving(prev => ({ ...prev, [key]: true }));
    try {
      recordStepProgress({
        developmentGoalId: goalId,
        goalStepId: stepId,
        employeeId: employee.id,
        shiftRosterId: shiftId,
        outcome,
       notes: outcome === 'na' ? '' : (outcomes[key]?.notes || '')
      });
     console.log('Successfully recorded step progress');
    } catch (error) {
      console.error('Error recording step progress:', error);
      // Revert the change if save failed
      setOutcomes(prev => ({
        ...prev,
        [key]: { 
          outcome: todayProgress.find(p => p.goalStepId === stepId)?.outcome || 'na',
          notes: prev[key]?.notes || '' 
        }
      }));
    } finally {
      setSaving(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleNotesChange = async (goalId: string, stepId: string, notes: string) => {
    const key = stepId;
    
    // Update local state immediately
    setOutcomes(prev => ({
      ...prev,
      [key]: { 
        outcome: prev[key]?.outcome || 'na',
        notes 
      }
    }));

    // Save notes immediately without debouncing to prevent loss
    setSaving(prev => ({ ...prev, [key]: true }));
    try {
      recordStepProgress({
        developmentGoalId: goalId,
        goalStepId: stepId,
        employeeId: employee.id,
        shiftRosterId: shiftId,
        outcome: outcomes[key]?.outcome || 'na',
        notes
      });
    } catch (error) {
      console.error('Error saving notes:', error);
    } finally {
      setSaving(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleSummaryChange = async (summary: string) => {
    setShiftSummary(summary);
    
    // Save summary immediately
    setSummaryLoading(true);
    try {
      saveShiftSummary(employee.id, shiftId, summary);
    } catch (error) {
      console.error('Error saving shift summary:', error);
    } finally {
      setSummaryLoading(false);
    }
  };

  const getGoalProgress = (goal: any) => {
    const requiredSteps = goal.steps.filter((step: any) => step.isRequired);
    const todayRequiredProgress = todayProgress.filter(p => {
      const step = goal.steps.find((s: any) => s.id === p.goalStepId);
      return step?.isRequired && p.outcome === 'correct';
    });
    
    return {
      completedToday: todayRequiredProgress.length,
      totalRequired: requiredSteps.length,
      allCorrectToday: todayRequiredProgress.length === requiredSteps.length,
      consecutiveStreak: goal.consecutiveAllCorrect
    };
  };

  return (
    <div className="space-y-6">
      {/* Employee Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Avatar with initials */}
            <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-xl font-semibold text-gray-600">
                {employee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </span>
            </div>
            
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{employee.name}</h1>
              <p className="text-gray-500">{employee.role}</p>
            </div>
          </div>

          {/* Support Info Button */}
          <button
            onClick={() => setShowSupportDetails(!showSupportDetails)}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <div className="h-5 w-5 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">i</span>
            </div>
            <span className="font-medium">Support Info</span>
            {showSupportDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>

        {/* Allergies - Prominent Safety Information */}
        {employee.allergies.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-semibold text-red-800">ALLERGIES</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {employee.allergies.map((allergy, index) => (
                <span
                  key={index}
                  className="px-3 py-2 bg-red-100 text-red-800 rounded-full text-sm"
                >
                  {allergy}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Expandable Support Details */}
        {showSupportDetails && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Header */}
              <div className="lg:col-span-3 flex items-center space-x-2 mb-2">
                <Heart className="h-5 w-5 text-pink-500" />
                <h2 className="text-xl font-semibold text-gray-900">Support Information</h2>
              </div>

              {/* Interests & Motivators */}
              {employee.interestsMotivators.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Interests & Motivators</h3>
                  <div className="flex flex-wrap gap-2">
                    {employee.interestsMotivators.map((interest, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Challenges */}
              {employee.challenges.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Challenges</h3>
                  <div className="flex flex-wrap gap-2">
                    {employee.challenges.map((challenge, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium"
                      >
                        {challenge}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Support Strategies */}
              {employee.regulationStrategies.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Support Strategies</h3>
                  <div className="flex flex-wrap gap-2">
                    {employee.regulationStrategies.map((strategy, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                      >
                        {strategy}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* View Full Profile Button - spans all columns */}
              <div className="lg:col-span-3 pt-4">
                <button 
                  onClick={onViewProfile}
                  className="flex items-center space-x-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span className="font-medium">View Full Profile</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Development Goals */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-blue-500" />
            <h2 className="text-lg font-semibold text-gray-900">Development Goals</h2>
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
              {employeeGoals.length}
            </span>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-8">
            {employeeGoals.length > 0 ? (
              employeeGoals.map((goal) => {
                const progress = getGoalProgress(goal);
                
                return (
                  <div key={goal.id} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{goal.title}</h3>
                        <p className="text-sm text-gray-600 mb-4">{goal.description}</p>
                        
                        <div className="flex items-center space-x-6 text-sm text-gray-600 mb-4">
                          <span>Started: {new Date(goal.startDate).toLocaleDateString()}</span>
                          <span>Target: {new Date(goal.targetEndDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="text-right ml-6">
                        <div className="text-2xl font-bold text-blue-600 mb-1">
                          {goal.consecutiveAllCorrect}/3
                        </div>
                        <div className="text-xs text-gray-500 mb-2">consecutive correct</div>
                        
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                          progress.allCorrectToday 
                            ? 'bg-green-100 text-green-800'
                            : progress.completedToday > 0
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {progress.completedToday}/{progress.totalRequired} today
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-6">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Mastery Progress</span>
                        <span>{Math.round((goal.consecutiveAllCorrect / 3) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min((goal.consecutiveAllCorrect / 3) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Goal Steps - Collapsible */}
                    <div className="space-y-4">
                      <div>
                        <button
                          onClick={() => toggleGoalExpansion(goal.id)}
                          className="flex items-center space-x-2 text-left w-full hover:bg-white p-2 rounded-lg transition-colors"
                        >
                          {expandedGoals[goal.id] ? (
                            <ChevronDown className="h-4 w-4 text-gray-500" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-gray-500" />
                          )}
                          <h4 className="font-medium text-gray-900">Steps ({goal.steps.length}) - Click to expand</h4>
                        </button>
                        
                        {expandedGoals[goal.id] && (
                          <div className="mt-4 space-y-4 border-t border-gray-200 pt-4">
                            {goal.steps.map((step: any, stepIndex: number) => {
                              const stepKey = step.id;
                              const stepProgress = outcomes[stepKey];
                              const isSaving = saving[stepKey];
                              const hasNotes = showNotes[stepKey];
                              
                              return (
                                <div
                                  key={step.id}
                                  className="border border-gray-300 rounded-lg p-4 bg-white shadow-sm"
                                >
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                      <div className="flex items-center space-x-2 mb-2">
                                        <span className="font-medium text-gray-900">
                                          {step.stepOrder}.
                                        </span>
                                        <span className="text-gray-700">{step.stepDescription}</span>
                                        {isSaving && (
                                          <div className="flex items-center space-x-1 text-blue-600">
                                            <Save className="h-3 w-3 animate-spin" />
                                            <span className="text-xs">Saving...</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between">
                                    <OutcomeSelector
                                      value={stepProgress?.outcome}
                                      stepId={step.id}
                                      saving={isSaving}
                                      onChange={(outcome) => handleOutcomeChange(goal.id, step.id, outcome)}
                                      disabled={isSaving}
                                    />
                                    
                                    <button
                                      onClick={() => setShowNotes(prev => ({ ...prev, [stepKey]: !prev[stepKey] }))}
                                      className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 text-sm"
                                    >
                                      <MessageSquare className="h-4 w-4" />
                                      <span>Notes</span>
                                    </button>
                                  </div>

                                  {hasNotes && (
                                    <div className="mt-3">
                                      {stepProgress?.outcome === 'verbal_prompt' && (
                                        <div className="mb-2 text-sm text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
                                          <strong>Note required:</strong> Please describe what verbal prompt was given.
                                        </div>
                                      )}
                                      <textarea
                                        value={stepProgress?.notes || ''}
                                        onChange={(e) => handleNotesChange(goal.id, step.id, e.target.value)}
                                        disabled={isSaving}
                                        placeholder={
                                          stepProgress?.outcome === 'verbal_prompt' 
                                            ? "Describe the verbal prompt given (required)..." 
                                            : "Add notes about this step..."
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                        required={stepProgress?.outcome === 'verbal_prompt'}
                                        rows={2}
                                      />
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Mastery Status */}
                    {goal.consecutiveAllCorrect >= 2 && (
                      <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <AlertCircle className="h-5 w-5 text-orange-500" />
                          <div>
                            <p className="font-medium text-orange-800">Near Mastery!</p>
                            <p className="text-sm text-orange-700">
                              {3 - goal.consecutiveAllCorrect} more consecutive correct shift{3 - goal.consecutiveAllCorrect !== 1 ? 's' : ''} needed for mastery.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {goal.masteryAchieved && (
                      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <div>
                            <p className="font-medium text-green-800">Goal Mastered!</p>
                            <p className="text-sm text-green-700">
                              Achieved on {goal.masteryDate ? new Date(goal.masteryDate).toLocaleDateString() : 'today'}. 
                              This goal is now in maintenance mode.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12">
                <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Goals</h3>
                <p className="text-gray-600">This employee doesn't have any active development goals yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Shift Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-green-500" />
              <h2 className="text-lg font-semibold text-gray-900">Shift Summary</h2>
            </div>
            {summaryLoading && (
              <div className="flex items-center space-x-2 text-blue-600">
                <Save className="h-4 w-4 animate-spin" />
                <span className="text-sm">Saving...</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="shift-summary" className="block text-sm font-medium text-gray-700 mb-2">
                Overall Performance Summary
              </label>
              <p className="text-sm text-gray-600 mb-3">
                Provide an overall summary of {employee.name.split(' ')[0]}'s performance during this shift, including strengths, areas for improvement, and any notable observations.
              </p>
              <textarea
                id="shift-summary"
                value={shiftSummary}
                onChange={(e) => handleSummaryChange(e.target.value)}
                disabled={summaryLoading}
                placeholder={`Write a summary of ${employee.name.split(' ')[0]}'s performance today...

Examples:
• Great job greeting customers with enthusiasm today
• Showed improvement in remembering ice cream flavors
• Needed reminders for cleaning procedures but followed through well
• Worked well with team members during busy periods`}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                rows={8}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <div className="h-5 w-5 rounded-full bg-blue-600 flex items-center justify-center mt-0.5">
                  <span className="text-white text-xs font-bold">i</span>
                </div>
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-1">Tips for writing effective summaries:</p>
                  <ul className="list-disc list-inside space-y-1 text-blue-600">
                    <li>Focus on specific behaviors and achievements</li>
                    <li>Include both strengths and areas for growth</li>
                    <li>Note any support strategies that worked well</li>
                    <li>Mention interactions with customers and team members</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}