import React, { useState } from 'react';
import { ArrowLeft, Target, Plus, X } from 'lucide-react';
import { useData } from '../contexts/DataContext';

interface GoalAssignmentProps {
  employeeId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function GoalAssignment({ employeeId, onClose, onSuccess }: GoalAssignmentProps) {
  const { employees, goalTemplates, createGoalFromTemplate, developmentGoals } = useData();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [customGoal, setCustomGoal] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetEndDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 days from now
    steps: [{ stepOrder: 1, stepDescription: '', isRequired: true }]
  });

  const employee = employees.find(emp => emp.id === employeeId);
  const activeGoals = developmentGoals.filter(goal => 
    goal.employeeId === employeeId && goal.status === 'active'
  ).length;

  const availableTemplates = goalTemplates.filter(template => template.status === 'active');

  const canAddGoal = activeGoals < 2;

  const handleTemplateSelect = (templateId: string) => {
    const template = goalTemplates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setFormData({
        title: template.name,
        description: template.goalStatement,
        targetEndDate: template.defaultTargetDate,
        steps: template.steps.map((step, index) => ({
          stepOrder: step.stepOrder,
          stepDescription: step.stepDescription,
          isRequired: step.isRequired
        }))
      });
    }
  };

  const handleCustomGoal = () => {
    setCustomGoal(true);
    setSelectedTemplate(null);
    setFormData({
      title: '',
      description: '',
      targetEndDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      steps: [{ stepOrder: 1, stepDescription: '', isRequired: true }]
    });
  };

  const addStep = () => {
    setFormData(prev => ({
      ...prev,
      steps: [...prev.steps, { 
        stepOrder: prev.steps.length + 1, 
        stepDescription: '', 
        isRequired: true 
      }]
    }));
  };

  const removeStep = (index: number) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index).map((step, i) => ({
        ...step,
        stepOrder: i + 1
      }))
    }));
  };

  const updateStep = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.map((step, i) => 
        i === index ? { ...step, [field]: value } : step
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canAddGoal) return;

    setLoading(true);
    try {
      if (selectedTemplate) {
        createGoalFromTemplate(selectedTemplate, employeeId);
      } else {
        // Handle custom goal creation
        // This would need to be implemented in the DataContext
      }
      onSuccess();
    } catch (error) {
      console.error('Error assigning goal:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!employee) return null;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Assign Goal</h1>
            <p className="text-gray-600">
              Create a new development goal for {employee.name}
            </p>
          </div>
        </div>
      </div>

      {!canAddGoal && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-amber-600" />
            <div>
              <p className="font-medium text-amber-800">Goal Limit Reached</p>
              <p className="text-sm text-amber-700">
                {employee.name} already has 2 active goals. Archive or complete existing goals before adding new ones.
              </p>
            </div>
          </div>
        </div>
      )}

      {!selectedTemplate && !customGoal && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Choose Goal Type</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <button
              onClick={handleCustomGoal}
              disabled={!canAddGoal}
              className={`p-6 border-2 rounded-xl text-left transition-colors ${
                canAddGoal
                  ? 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  : 'border-gray-100 bg-gray-50 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center space-x-3 mb-3">
                <Plus className={`h-6 w-6 ${canAddGoal ? 'text-blue-600' : 'text-gray-400'}`} />
                <h3 className={`text-lg font-semibold ${canAddGoal ? 'text-gray-900' : 'text-gray-500'}`}>
                  Create Custom Goal
                </h3>
              </div>
              <p className={`text-sm ${canAddGoal ? 'text-gray-600' : 'text-gray-400'}`}>
                Build a completely custom goal with your own steps and criteria
              </p>
            </button>

            <div className={`p-6 border-2 rounded-xl ${
              canAddGoal ? 'border-gray-200' : 'border-gray-100 bg-gray-50'
            }`}>
              <div className="flex items-center space-x-3 mb-3">
                <Target className={`h-6 w-6 ${canAddGoal ? 'text-teal-600' : 'text-gray-400'}`} />
                <h3 className={`text-lg font-semibold ${canAddGoal ? 'text-gray-900' : 'text-gray-500'}`}>
                  Use Template
                </h3>
              </div>
              <p className={`text-sm mb-4 ${canAddGoal ? 'text-gray-600' : 'text-gray-400'}`}>
                Start with a pre-built goal template that you can customize
              </p>
              
              {canAddGoal && availableTemplates.length > 0 && (
                <div className="space-y-2">
                  {availableTemplates.slice(0, 3).map(template => (
                    <button
                      key={template.id}
                      onClick={() => handleTemplateSelect(template.id)}
                      className="w-full text-left p-3 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors"
                    >
                      <p className="font-medium text-teal-900">{template.name}</p>
                      <p className="text-xs text-teal-700 mt-1">
                        {template.steps.length} steps
                      </p>
                    </button>
                  ))}
                  {availableTemplates.length > 3 && (
                    <p className="text-xs text-gray-500 mt-2">
                      +{availableTemplates.length - 3} more templates available
                    </p>
                  )}
                </div>
              )}
              
              {availableTemplates.length === 0 && canAddGoal && (
                <p className="text-sm text-gray-500">No templates available</p>
              )}
            </div>
          </div>
        </div>
      )}

      {(selectedTemplate || customGoal) && canAddGoal && (
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Goal Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Goal Details</h2>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Goal Title *
                </label>
                <input
                  type="text"
                  id="title"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter goal title"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Goal Description *
                </label>
                <textarea
                  id="description"
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe what the employee will achieve and how it will be measured"
                />
              </div>

              <div>
                <label htmlFor="targetEndDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Target Completion Date *
                </label>
                <input
                  type="date"
                  id="targetEndDate"
                  required
                  value={formData.targetEndDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetEndDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Goal Steps */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Goal Steps</h2>
              <button
                type="button"
                onClick={addStep}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
              >
                <Plus className="h-4 w-4" />
                <span>Add Step</span>
              </button>
            </div>

            <div className="space-y-4">
              {formData.steps.map((step, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900">Step {step.stepOrder}</h3>
                    {formData.steps.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeStep(index)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <input
                        type="text"
                        required
                        value={step.stepDescription}
                        onChange={(e) => updateStep(index, 'stepDescription', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Describe this step in detail"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id={`required-${index}`}
                        checked={step.isRequired}
                        onChange={(e) => updateStep(index, 'isRequired', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`required-${index}`} className="text-sm font-medium text-gray-700">
                        Required for mastery
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Mastery Criteria:</strong> This goal will be considered mastered when all steps are completed correctly for 3 consecutive shifts.
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Assigning...' : 'Assign Goal'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}