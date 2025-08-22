import React, { useState } from 'react';
import { ArrowLeft, Edit, Plus, Target, CheckCircle, Clock, AlertTriangle, Phone, Heart, Brain, Shield, Zap, Archive, X, Save, ChevronDown, ChevronRight } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import GoalAssignment from './GoalAssignment';

interface EmployeeDetailProps {
  employeeId: string;
  onClose: () => void;
}

export default function EmployeeDetail({ employeeId, onClose }: EmployeeDetailProps) {
  const { employees, developmentGoals, stepProgress, goalTemplates, updateGoal, archiveGoal } = useData();
  const { user } = useAuth();
  const [showGoalAssignment, setShowGoalAssignment] = useState(false);
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [expandedGoals, setExpandedGoals] = useState<Record<string, boolean>>({});
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    targetEndDate: ''
  });

  const employee = employees.find(emp => emp.id === employeeId);
  const employeeGoals = developmentGoals.filter(goal => goal.employeeId === employeeId);
  
  if (!employee) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-600">Employee not found</p>
          <button onClick={onClose} className="mt-4 text-blue-600 hover:text-blue-700">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const activeGoals = employeeGoals.filter(goal => goal.status === 'active');
  const maintenanceGoals = employeeGoals.filter(goal => goal.status === 'maintenance');
  const archivedGoals = employeeGoals.filter(goal => goal.status === 'archived');

  const getRecentProgress = (goalId: string) => {
    const recent = stepProgress
      .filter(p => p.developmentGoalId === goalId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
    
    return recent;
  };

  const handleEditGoal = (goal: any) => {
    setEditingGoal(goal.id);
    setEditForm({
      title: goal.title,
      description: goal.description,
      targetEndDate: goal.targetEndDate
    });
  };

  const handleSaveGoal = () => {
    if (editingGoal) {
      updateGoal(editingGoal, editForm);
      setEditingGoal(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingGoal(null);
    setEditForm({ title: '', description: '', targetEndDate: '' });
  };

  const handleArchiveGoal = (goalId: string, goalTitle: string) => {
    if (confirm(`Are you sure you want to archive "${goalTitle}"? This will move it to archived status.`)) {
      archiveGoal(goalId);
    }
  };

  const getGoalProgress = (goal: any) => {
    const requiredSteps = goal.steps.filter((step: any) => step.isRequired);
    return {
      totalRequired: requiredSteps.length,
      consecutiveCorrect: goal.consecutiveAllCorrect,
      masteryProgress: Math.min((goal.consecutiveAllCorrect / 3) * 100, 100)
    };
  };

  if (showGoalAssignment) {
    return (
      <GoalAssignment
        employeeId={employeeId}
        onClose={() => setShowGoalAssignment(false)}
        onSuccess={() => setShowGoalAssignment(false)}
      />
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div className="flex items-center space-x-4">
            <img
              src={employee.profileImageUrl || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2'}
              alt={employee.name}
              className="h-16 w-16 rounded-full object-cover"
            />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{employee.name}</h1>
              <p className="text-gray-600">{employee.role}</p>
              <div className="flex items-center space-x-2 mt-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  employee.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {employee.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={() => setShowGoalAssignment(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Assign Goal</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - About Me Information */}
        <div className="lg:col-span-1 space-y-6">
          {/* Safety Information */}
          {(employee.allergies.length > 0 || employee.emergencyContacts.length > 0) && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="h-5 w-5 text-red-500" />
                <h2 className="text-lg font-semibold text-gray-900">Safety Information</h2>
              </div>

              {employee.allergies.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                    <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
                    Allergies
                  </h3>
                  <div className="space-y-1">
                    {employee.allergies.map((allergy, index) => (
                      <span
                        key={index}
                        className="inline-block bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm mr-2 mb-1"
                      >
                        {allergy}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {employee.emergencyContacts.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                    <Phone className="h-4 w-4 text-blue-500 mr-2" />
                    Emergency Contacts
                  </h3>
                  <div className="space-y-2">
                    {employee.emergencyContacts.map((contact, index) => (
                      <div key={index} className="text-sm">
                        <p className="font-medium text-gray-900">{contact.name}</p>
                        <p className="text-gray-600">{contact.relationship}</p>
                        <p className="text-blue-600">{contact.phone}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Support Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-4">
             <Heart className="h-5 w-5 text-pink-500" />
             <h2 className="text-lg font-semibold text-gray-900">Support Information</h2>
            </div>

            <div className="space-y-6">
              {employee.interestsMotivators.length > 0 && (
                <div>
                 <h3 className="text-base font-semibold text-gray-900 mb-3">Interests & Motivators</h3>
                  <div className="flex flex-wrap gap-2">
                    {employee.interestsMotivators.map((interest, index) => (
                      <span
                        key={index}
                       className="px-3 py-2 bg-green-100 text-green-800 rounded-full text-sm"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {employee.challenges.length > 0 && (
                <div>
                 <h3 className="text-base font-semibold text-gray-900 mb-3">Challenges</h3>
                  <div className="flex flex-wrap gap-2">
                    {employee.challenges.map((challenge, index) => (
                      <span
                        key={index}
                       className="px-3 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm"
                      >
                        {challenge}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {employee.regulationStrategies.length > 0 && (
                <div>
                 <h3 className="text-base font-semibold text-gray-900 mb-3">Support Strategies</h3>
                  <div className="flex flex-wrap gap-2">
                    {employee.regulationStrategies.map((strategy, index) => (
                      <span
                        key={index}
                       className="px-3 py-2 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {strategy}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Goals */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Goals */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-blue-500" />
                <h2 className="text-lg font-semibold text-gray-900">Active Goals</h2>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                  {activeGoals.length}/2
                </span>
              </div>
            </div>

            {activeGoals.length > 0 ? (
              <div className="space-y-6">
                {activeGoals.map(goal => {
                  const progress = getGoalProgress(goal);
                  const recentProgress = getRecentProgress(goal.id);
                  
                  return (
                    <div key={goal.id} className="border border-gray-200 rounded-lg p-4">
                      {editingGoal === goal.id ? (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Goal Title</label>
                            <input
                              type="text"
                              value={editForm.title}
                              onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                            <textarea
                              value={editForm.description}
                              onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Target End Date</label>
                            <input
                              type="date"
                              value={editForm.targetEndDate}
                              onChange={(e) => setEditForm(prev => ({ ...prev, targetEndDate: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={handleSaveGoal}
                              className="flex items-center space-x-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors"
                            >
                              <Save className="h-4 w-4" />
                              <span>Save</span>
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="flex items-center space-x-2 bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                            >
                              <X className="h-4 w-4" />
                              <span>Cancel</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 mb-1">{goal.title}</h3>
                              <p className="text-sm text-gray-600 mb-3">{goal.description}</p>
                              
                              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                                <span>Started: {new Date(goal.startDate).toLocaleDateString()}</span>
                                <span>Target: {new Date(goal.targetEndDate).toLocaleDateString()}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2 ml-4">
                              <div className="text-right">
                                <div className="text-lg font-bold text-blue-600">
                                  {goal.consecutiveAllCorrect}/3
                                </div>
                                <div className="text-xs text-gray-500">consecutive correct</div>
                              </div>
                              
                              <div className="flex flex-col space-y-1">
                                <button
                                  onClick={() => handleEditGoal(goal)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Edit goal"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleArchiveGoal(goal.id, goal.title)}
                                  className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                                  title="Archive goal"
                                >
                                  <Archive className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="mb-4">
                            <div className="flex justify-between text-sm text-gray-600 mb-1">
                              <span>Mastery Progress</span>
                              <span>{Math.round(progress.masteryProgress)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progress.masteryProgress}%` }}
                              ></div>
                            </div>
                          </div>

                          {/* Goal Steps */}
                          {/* Goal Steps - Collapsible */}
                          <div className="mb-4">
                            <button
                              onClick={() => {
                                const newExpanded = { ...expandedGoals };
                                newExpanded[goal.id] = !newExpanded[goal.id];
                                setExpandedGoals(newExpanded);
                              }}
                              className="flex items-center space-x-2 text-left w-full hover:bg-gray-50 p-2 rounded-lg transition-colors"
                            >
                              {expandedGoals[goal.id] ? (
                                <ChevronDown className="h-4 w-4 text-gray-500" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-gray-500" />
                              )}
                              <h4 className="font-medium text-gray-900">Steps ({progress.totalRequired}) - Click to expand</h4>
                            </button>
                            
                            {expandedGoals[goal.id] && (
                              <div className="mt-4 space-y-2 border-t border-gray-200 pt-4">
                                {goal.steps.map((step: any) => (
                                  <div
                                    key={step.id}
                                    className="flex items-center space-x-2 text-sm p-3 rounded-lg bg-white border border-gray-200 shadow-sm"
                                  >
                                    <span className="font-medium text-gray-700">
                                      {step.stepOrder}.
                                    </span>
                                    <span className="flex-1 text-gray-900">{step.stepDescription}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Recent Progress */}
                          {recentProgress.length > 0 && (
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">Recent Progress</h4>
                              <div className="flex space-x-1">
                                {recentProgress.slice(0, 5).reverse().map((progress, index) => (
                                  <div
                                    key={index}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                                      progress.outcome === 'correct'
                                        ? 'bg-green-100 text-green-700'
                                        : progress.outcome === 'verbal_prompt'
                                        ? 'bg-yellow-100 text-yellow-700'
                                        : 'bg-gray-100 text-gray-600'
                                    }`}
                                    title={`${new Date(progress.date).toLocaleDateString()}: ${progress.outcome}`}
                                  >
                                    {progress.outcome === 'correct' ? '✓' : 
                                     progress.outcome === 'verbal_prompt' ? '◐' : '◯'}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Mastery Status */}
                      {!editingGoal && goal.consecutiveAllCorrect >= 2 && (
                        <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <AlertTriangle className="h-5 w-5 text-orange-500" />
                            <div>
                              <p className="font-medium text-orange-800">Near Mastery!</p>
                              <p className="text-sm text-orange-700">
                                {3 - goal.consecutiveAllCorrect} more consecutive correct shift{3 - goal.consecutiveAllCorrect !== 1 ? 's' : ''} needed for mastery.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {!editingGoal && goal.masteryAchieved && (
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
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Goals</h3>
                <p className="text-gray-600 mb-4">Assign development goals to start tracking progress</p>
                <button
                  onClick={() => setShowGoalAssignment(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Assign First Goal
                </button>
              </div>
            )}
          </div>

          {/* Maintenance Goals */}
          {maintenanceGoals.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-6">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <h2 className="text-lg font-semibold text-gray-900">Maintenance Goals</h2>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                  {maintenanceGoals.length}
                </span>
              </div>

              <div className="space-y-4">
                {maintenanceGoals.map(goal => (
                  <div key={goal.id} className="border border-green-200 rounded-lg p-4 bg-green-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{goal.title}</h3>
                        <p className="text-sm text-gray-600">
                          Mastered on {goal.masteryDate ? new Date(goal.masteryDate).toLocaleDateString() : 'Unknown'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-6 w-6 text-green-500" />
                        <button
                          onClick={() => handleArchiveGoal(goal.id, goal.title)}
                          className="p-2 text-gray-600 hover:bg-white hover:bg-opacity-50 rounded-lg transition-colors"
                          title="Archive goal"
                        >
                          <Archive className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Archived Goals */}
          {archivedGoals.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Clock className="h-5 w-5 text-gray-400" />
                <h2 className="text-lg font-semibold text-gray-900">Archived Goals</h2>
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">
                  {archivedGoals.length}
                </span>
              </div>

              <div className="space-y-4">
                {archivedGoals.map(goal => (
                  <div key={goal.id} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900">{goal.title}</h3>
                    <p className="text-sm text-gray-600">
                      {goal.startDate} - {goal.targetEndDate}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}