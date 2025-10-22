import React, { useState } from 'react';
import { Target, CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

interface Goal {
  id: string;
  title: string;
  description: string;
  consecutiveAllCorrect: number;
  hasDocumentation: boolean;
}

const mockGoals: Goal[] = [
  {
    id: '1',
    title: 'Customer Greeting & Engagement',
    description: 'Greet customers warmly and engage in friendly conversation',
    consecutiveAllCorrect: 2,
    hasDocumentation: true
  },
  {
    id: '2',
    title: 'Ice Cream Scooping Technique',
    description: 'Proper scooping form and portion control',
    consecutiveAllCorrect: 1,
    hasDocumentation: false
  }
];

export default function AssessmentGoalSelector() {
  const [selectedOption, setSelectedOption] = useState<'option1' | 'option2' | 'option3'>('option1');

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Assessment Goal Selection Options</h1>
          <p className="text-gray-600">
            Exploring different UI patterns for handling partial goal documentation during employee assessments.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <OptionTabs selectedOption={selectedOption} setSelectedOption={setSelectedOption} />

          {selectedOption === 'option1' && <Option1InlineToggle goals={mockGoals} />}
          {selectedOption === 'option2' && <Option2CheckboxList goals={mockGoals} />}
          {selectedOption === 'option3' && <Option3RadioButtons goals={mockGoals} />}
        </div>
      </div>
    </div>
  );
}

function OptionTabs({
  selectedOption,
  setSelectedOption
}: {
  selectedOption: string;
  setSelectedOption: (option: 'option1' | 'option2' | 'option3') => void;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex space-x-4">
        <button
          onClick={() => setSelectedOption('option1')}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            selectedOption === 'option1'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Option 1: Inline Toggle
        </button>
        <button
          onClick={() => setSelectedOption('option2')}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            selectedOption === 'option2'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Option 2: Checkbox List
        </button>
        <button
          onClick={() => setSelectedOption('option3')}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            selectedOption === 'option3'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Option 3: Per-Goal Status
        </button>
      </div>
    </div>
  );
}

function Option1InlineToggle({ goals }: { goals: Goal[] }) {
  const [includedGoals, setIncludedGoals] = useState<Set<string>>(
    new Set(goals.filter(g => g.hasDocumentation).map(g => g.id))
  );

  const toggleGoal = (goalId: string) => {
    setIncludedGoals(prev => {
      const newSet = new Set(prev);
      if (newSet.has(goalId)) {
        newSet.delete(goalId);
      } else {
        newSet.add(goalId);
      }
      return newSet;
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="border-b border-gray-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-900">Option 1: Inline Toggle Switch</h2>
        <p className="text-sm text-gray-600 mt-1">
          Each goal has a toggle switch to include or exclude it from the assessment.
        </p>
      </div>

      <div className="p-6 space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Pros:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Quick and intuitive - single action to include/exclude</li>
                <li>Clear visual state with toggle position</li>
                <li>Familiar pattern for users</li>
              </ul>
              <p className="font-medium mt-3 mb-1">Cons:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>May not be obvious why you would exclude a goal</li>
                <li>No explicit indication of missing documentation</li>
              </ul>
            </div>
          </div>
        </div>

        {goals.map(goal => (
          <div
            key={goal.id}
            className={`border rounded-lg p-6 transition-all ${
              includedGoals.has(goal.id)
                ? 'border-green-200 bg-green-50'
                : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{goal.title}</h3>
                  {!goal.hasDocumentation && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                      No documentation
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-3">{goal.description}</p>
                <div className="text-sm text-gray-600">
                  Progress: <span className="font-medium text-blue-600">{goal.consecutiveAllCorrect}/3</span> consecutive correct
                </div>
              </div>

              <div className="flex flex-col items-end space-y-2 ml-6">
                <button
                  onClick={() => toggleGoal(goal.id)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    includedGoals.has(goal.id)
                      ? 'bg-green-600'
                      : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      includedGoals.has(goal.id) ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className={`text-xs font-medium ${
                  includedGoals.has(goal.id) ? 'text-green-700' : 'text-gray-500'
                }`}>
                  {includedGoals.has(goal.id) ? 'Included' : 'Excluded'}
                </span>
              </div>
            </div>
          </div>
        ))}

        <div className="pt-4 border-t border-gray-200">
          <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Generate Assessment ({includedGoals.size} of {goals.length} goals)
          </button>
        </div>
      </div>
    </div>
  );
}

function Option2CheckboxList({ goals }: { goals: Goal[] }) {
  const [includedGoals, setIncludedGoals] = useState<Set<string>>(
    new Set(goals.filter(g => g.hasDocumentation).map(g => g.id))
  );

  const toggleGoal = (goalId: string) => {
    setIncludedGoals(prev => {
      const newSet = new Set(prev);
      if (newSet.has(goalId)) {
        newSet.delete(goalId);
      } else {
        newSet.add(goalId);
      }
      return newSet;
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="border-b border-gray-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-900">Option 2: Checkbox Selection List</h2>
        <p className="text-sm text-gray-600 mt-1">
          Traditional checkbox pattern with clear labels for selection.
        </p>
      </div>

      <div className="p-6 space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Pros:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Standard UI pattern - universally understood</li>
                <li>Can select/deselect all at once</li>
                <li>Clear indication of what will be included</li>
              </ul>
              <p className="font-medium mt-3 mb-1">Cons:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Takes up more horizontal space</li>
                <li>Feels more like a form than an active decision</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
          <h3 className="font-medium text-gray-900">Select Goals for Assessment</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setIncludedGoals(new Set(goals.map(g => g.id)))}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              Select All
            </button>
            <button
              onClick={() => setIncludedGoals(new Set())}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>

        {goals.map(goal => (
          <div
            key={goal.id}
            className="border border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer"
            onClick={() => toggleGoal(goal.id)}
          >
            <div className="p-6">
              <div className="flex items-start space-x-4">
                <div className="pt-1">
                  <input
                    type="checkbox"
                    checked={includedGoals.has(goal.id)}
                    onChange={() => toggleGoal(goal.id)}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{goal.title}</h3>
                    {!goal.hasDocumentation && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full flex items-center space-x-1">
                        <AlertCircle className="h-3 w-3" />
                        <span>No documentation</span>
                      </span>
                    )}
                    {goal.hasDocumentation && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full flex items-center space-x-1">
                        <CheckCircle className="h-3 w-3" />
                        <span>Documented</span>
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{goal.description}</p>
                  <div className="text-sm text-gray-600">
                    Progress: <span className="font-medium text-blue-600">{goal.consecutiveAllCorrect}/3</span> consecutive correct
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="pt-4 border-t border-gray-200">
          <button
            disabled={includedGoals.size === 0}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Generate Assessment ({includedGoals.size} of {goals.length} goals)
          </button>
        </div>
      </div>
    </div>
  );
}

function Option3RadioButtons({ goals }: { goals: Goal[] }) {
  const [goalStatuses, setGoalStatuses] = useState<Record<string, 'include' | 'exclude' | 'pending'>>(
    goals.reduce((acc, goal) => ({
      ...acc,
      [goal.id]: goal.hasDocumentation ? 'include' : 'pending'
    }), {})
  );

  const setGoalStatus = (goalId: string, status: 'include' | 'exclude' | 'pending') => {
    setGoalStatuses(prev => ({
      ...prev,
      [goalId]: status
    }));
  };

  const includedCount = Object.values(goalStatuses).filter(s => s === 'include').length;
  const pendingCount = Object.values(goalStatuses).filter(s => s === 'pending').length;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="border-b border-gray-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-900">Option 3: Per-Goal Status Selection</h2>
        <p className="text-sm text-gray-600 mt-1">
          Explicit choice between Include, Exclude, or Mark as Pending for each goal.
        </p>
      </div>

      <div className="p-6 space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Pros:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Most explicit - three clear states</li>
                <li>Can mark goals as pending for future documentation</li>
                <li>Great for workflows where documentation is in progress</li>
              </ul>
              <p className="font-medium mt-3 mb-1">Cons:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>More decision points for the user</li>
                <li>Takes up the most space</li>
                <li>May be overkill for simple include/exclude</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-6 pb-4 border-b border-gray-200 text-sm">
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-700"><span className="font-medium">{includedCount}</span> Included</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 bg-red-500 rounded-full"></div>
            <span className="text-gray-700"><span className="font-medium">{goals.length - includedCount - pendingCount}</span> Excluded</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 bg-yellow-500 rounded-full"></div>
            <span className="text-gray-700"><span className="font-medium">{pendingCount}</span> Pending</span>
          </div>
        </div>

        {goals.map(goal => (
          <div
            key={goal.id}
            className={`border rounded-lg p-6 transition-all ${
              goalStatuses[goal.id] === 'include'
                ? 'border-green-200 bg-green-50'
                : goalStatuses[goal.id] === 'exclude'
                ? 'border-red-200 bg-red-50'
                : 'border-yellow-200 bg-yellow-50'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{goal.title}</h3>
                  {!goal.hasDocumentation && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full flex items-center space-x-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>No documentation</span>
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-3">{goal.description}</p>
                <div className="text-sm text-gray-600">
                  Progress: <span className="font-medium text-blue-600">{goal.consecutiveAllCorrect}/3</span> consecutive correct
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-gray-700 mb-1">Assessment Status</label>
              <div className="flex space-x-3">
                <button
                  onClick={() => setGoalStatus(goal.id, 'include')}
                  className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg border-2 transition-all ${
                    goalStatuses[goal.id] === 'include'
                      ? 'border-green-500 bg-green-100 text-green-800'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-green-300'
                  }`}
                >
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-medium">Include</span>
                </button>

                <button
                  onClick={() => setGoalStatus(goal.id, 'pending')}
                  className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg border-2 transition-all ${
                    goalStatuses[goal.id] === 'pending'
                      ? 'border-yellow-500 bg-yellow-100 text-yellow-800'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-yellow-300'
                  }`}
                >
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-medium">Pending</span>
                </button>

                <button
                  onClick={() => setGoalStatus(goal.id, 'exclude')}
                  className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg border-2 transition-all ${
                    goalStatuses[goal.id] === 'exclude'
                      ? 'border-red-500 bg-red-100 text-red-800'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-red-300'
                  }`}
                >
                  <XCircle className="h-4 w-4" />
                  <span className="font-medium">Exclude</span>
                </button>
              </div>

              {goalStatuses[goal.id] === 'pending' && (
                <p className="text-sm text-yellow-700 mt-2">
                  This goal will be marked for future documentation and not included in this assessment.
                </p>
              )}
              {goalStatuses[goal.id] === 'exclude' && (
                <p className="text-sm text-red-700 mt-2">
                  This goal will be excluded from the assessment report.
                </p>
              )}
            </div>
          </div>
        ))}

        <div className="pt-4 border-t border-gray-200">
          <button
            disabled={includedCount === 0}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Generate Assessment ({includedCount} of {goals.length} goals)
          </button>
          {pendingCount > 0 && (
            <p className="text-sm text-gray-600 text-center mt-3">
              {pendingCount} goal{pendingCount !== 1 ? 's' : ''} marked as pending for later
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
