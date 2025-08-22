import React, { useState } from 'react';
import { Target, Plus, Edit, Archive, Search, Eye, Copy, X } from 'lucide-react';
import { useData, GoalTemplate } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';

export default function GoalTemplates() {
  const { goalTemplates, addGoalTemplate } = useData();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('active');
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [viewingTemplate, setViewingTemplate] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    goalStatement: '',
    defaultMasteryCriteria: '3 consecutive shifts with all required steps Correct',
    defaultTargetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'active' as 'active' | 'archived',
    steps: [{ stepOrder: 1, stepDescription: '', isRequired: true }]
  });

  const filteredTemplates = goalTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.goalStatement.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || template.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const cleanData = {
      ...formData,
      steps: formData.steps.filter(step => step.stepDescription.trim() !== '')
    };

    if (editingTemplate) {
      // Update existing template logic would go here
      console.log('Update template:', editingTemplate, cleanData);
    } else {
      addGoalTemplate(cleanData);
    }
    
    handleCloseForm();
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTemplate(null);
    setFormData({
      name: '',
      goalStatement: '',
      defaultMasteryCriteria: '3 consecutive shifts with all required steps Correct',
      defaultTargetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'active',
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

  const duplicateTemplate = (template: GoalTemplate) => {
    setFormData({
      name: `${template.name} (Copy)`,
      goalStatement: template.goalStatement,
      defaultMasteryCriteria: template.defaultMasteryCriteria,
      defaultTargetDate: template.defaultTargetDate,
      status: 'active',
      steps: template.steps.map(step => ({
        stepOrder: step.stepOrder,
        stepDescription: step.stepDescription,
        isRequired: step.isRequired
      }))
    });
    setShowForm(true);
  };

  const viewTemplate = goalTemplates.find(t => t.id === viewingTemplate);

  if (user?.role !== 'admin') {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <Target className="h-12 w-12 text-red-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">You don't have permission to manage goal templates.</p>
        </div>
      </div>
    );
  }

  if (viewingTemplate && viewTemplate) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setViewingTemplate(null)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{viewTemplate.name}</h1>
              <p className="text-gray-600">Goal Template Details</p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => duplicateTemplate(viewTemplate)}
              className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Copy className="h-4 w-4" />
              <span>Duplicate</span>
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Goal Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Goal Statement</label>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-gray-900">{viewTemplate.goalStatement}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mastery Criteria</label>
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-gray-900">{viewTemplate.defaultMasteryCriteria}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Default Target Date</label>
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-gray-900">{new Date(viewTemplate.defaultTargetDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  viewTemplate.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {viewTemplate.status === 'active' ? 'Active' : 'Archived'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Goal Steps ({viewTemplate.steps.length})</h2>
            
            <div className="space-y-4">
              {viewTemplate.steps.map((step, index) => (
                <div
                  key={index}
                  className={`p-4 border rounded-lg ${
                    step.isRequired 
                      ? 'border-blue-200 bg-blue-50' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <span className="font-medium text-gray-900 mt-1">
                        {step.stepOrder}. {step.stepDescription}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-end mb-8">
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Create Template</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="flex space-x-2">
            {['all', 'active', 'archived'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Template Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {editingTemplate ? 'Edit Template' : 'Create New Template'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Template Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Ice Cream Flavors Knowledge"
                    />
                  </div>

                  <div>
                    <label htmlFor="defaultTargetDate" className="block text-sm font-medium text-gray-700 mb-2">
                      Default Target Date *
                    </label>
                    <input
                      type="date"
                      id="defaultTargetDate"
                      required
                      value={formData.defaultTargetDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, defaultTargetDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="goalStatement" className="block text-sm font-medium text-gray-700 mb-2">
                    Goal Statement *
                  </label>
                  <textarea
                    id="goalStatement"
                    required
                    rows={4}
                    value={formData.goalStatement}
                    onChange={(e) => setFormData(prev => ({ ...prev, goalStatement: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe what the employee will achieve and how success will be measured..."
                  />
                </div>

                <div>
                  <label htmlFor="defaultMasteryCriteria" className="block text-sm font-medium text-gray-700 mb-2">
                    Mastery Criteria
                  </label>
                  <input
                    type="text"
                    id="defaultMasteryCriteria"
                    value={formData.defaultMasteryCriteria}
                    onChange={(e) => setFormData(prev => ({ ...prev, defaultMasteryCriteria: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Goal Steps */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Goal Steps</h3>
                    <button
                      type="button"
                      onClick={addStep}
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Step</span>
                    </button>
                  </div>

                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {formData.steps.map((step, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900">Step {step.stepOrder}</h4>
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
                            <textarea
                              required
                              value={step.stepDescription}
                              onChange={(e) => updateStep(index, 'stepDescription', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Describe this step in detail"
                              rows={2}
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
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingTemplate ? 'Update Template' : 'Create Template'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">{template.name}</h3>
                <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                  {template.goalStatement}
                </p>
              </div>
              
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                template.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {template.status === 'active' ? 'Active' : 'Archived'}
              </span>
            </div>

            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
              <span>{template.steps.length} step{template.steps.length !== 1 ? 's' : ''}</span>
              <span>{template.steps.filter(s => s.isRequired).length} required</span>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => setViewingTemplate(template.id)}
                className="flex-1 flex items-center justify-center space-x-2 py-2 px-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Eye className="h-4 w-4" />
                <span>View</span>
              </button>
              
              <button
                onClick={() => duplicateTemplate(template)}
                className="flex items-center justify-center px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm 
              ? `No templates match "${searchTerm}"`
              : 'Create your first goal template to get started'
            }
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create First Template
            </button>
          )}
        </div>
      )}
    </div>
  );
}