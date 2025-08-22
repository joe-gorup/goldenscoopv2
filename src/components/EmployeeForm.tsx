import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, X, AlertTriangle, Phone, Heart, Brain, Shield } from 'lucide-react';
import { useData, Employee } from '../contexts/DataContext';

interface EmployeeFormProps {
  employeeId?: string | null;
  onClose: () => void;
}

export default function EmployeeForm({ employeeId, onClose }: EmployeeFormProps) {
  const { employees, addEmployee, updateEmployee } = useData();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    role: 'Team Member',
    profileImageUrl: '',
    isActive: true,
    allergies: [''],
    emergencyContacts: [{ name: '', relationship: '', phone: '' }],
    interestsMotivators: [''],
    challenges: [''],
    regulationStrategies: ['']
  });

  useEffect(() => {
    if (employeeId) {
      const employee = employees.find(emp => emp.id === employeeId);
      if (employee) {
        setFormData({
          name: employee.name,
          role: employee.role,
          profileImageUrl: employee.profileImageUrl || '',
          isActive: employee.isActive,
          allergies: employee.allergies.length > 0 ? employee.allergies : [''],
          emergencyContacts: employee.emergencyContacts.length > 0 ? employee.emergencyContacts : [{ name: '', relationship: '', phone: '' }],
          interestsMotivators: employee.interestsMotivators.length > 0 ? employee.interestsMotivators : [''],
          challenges: employee.challenges.length > 0 ? employee.challenges : [''],
          regulationStrategies: employee.regulationStrategies.length > 0 ? employee.regulationStrategies : ['']
        });
      }
    }
  }, [employeeId, employees]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const cleanData = {
        ...formData,
        allergies: formData.allergies.filter(a => a.trim() !== ''),
        emergencyContacts: formData.emergencyContacts.filter(c => c.name.trim() !== '' || c.relationship.trim() !== '' || c.phone.trim() !== ''),
        interestsMotivators: formData.interestsMotivators.filter(i => i.trim() !== ''),
        challenges: formData.challenges.filter(c => c.trim() !== ''),
        regulationStrategies: formData.regulationStrategies.filter(r => r.trim() !== '')
      };

      if (employeeId) {
        updateEmployee(employeeId, cleanData);
      } else {
        addEmployee(cleanData);
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving employee:', error);
    } finally {
      setLoading(false);
    }
  };

  const addArrayItem = (field: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field as keyof typeof prev] as string[], '']
    }));
  };

  const removeArrayItem = (field: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field as keyof typeof prev] as string[]).filter((_, i) => i !== index)
    }));
  };

  const updateArrayItem = (field: string, index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field as keyof typeof prev] as string[]).map((item, i) => i === index ? value : item)
    }));
  };

  const addEmergencyContact = () => {
    setFormData(prev => ({
      ...prev,
      emergencyContacts: [...prev.emergencyContacts, { name: '', relationship: '', phone: '' }]
    }));
  };

  const removeEmergencyContact = (index: number) => {
    setFormData(prev => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.filter((_, i) => i !== index)
    }));
  };

  const updateEmergencyContact = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.map((contact, i) => 
        i === index ? { ...contact, [field]: value } : contact
      )
    }));
  };

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
            <h1 className="text-3xl font-bold text-gray-900">
              {employeeId ? 'Edit Employee' : 'Add New Employee'}
            </h1>
            <p className="text-gray-600">
              {employeeId ? 'Update employee information and support details' : 'Create a comprehensive employee profile'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter full name"
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                Role *
              </label>
              <select
                id="role"
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Team Member">Team Member</option>
                <option value="Assistant Manager">Assistant Manager</option>
                <option value="Shift Lead">Shift Lead</option>
              </select>
            </div>

            <div>
              <label htmlFor="profileImageUrl" className="block text-sm font-medium text-gray-700 mb-2">
                Profile Image URL
              </label>
              <input
                type="url"
                id="profileImageUrl"
                value={formData.profileImageUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, profileImageUrl: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com/photo.jpg"
              />
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Active Employee
              </label>
            </div>
          </div>
        </div>

        {/* Safety Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <h2 className="text-xl font-semibold text-gray-900">Safety Information</h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Allergies & Dietary Restrictions
            </label>
            <div className="space-y-2">
              {formData.allergies.map((allergy, index) => (
                <div key={index} className="flex space-x-2">
                  <input
                    type="text"
                    value={allergy}
                    onChange={(e) => updateArrayItem('allergies', index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter allergy or dietary restriction"
                  />
                  {formData.allergies.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('allergies', index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => addArrayItem('allergies')}
              className="mt-2 flex items-center space-x-2 text-blue-600 hover:text-blue-700"
            >
              <Plus className="h-4 w-4" />
              <span>Add Allergy</span>
            </button>
          </div>
        </div>

        {/* Emergency Contacts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Phone className="h-5 w-5 text-blue-500" />
            <h2 className="text-xl font-semibold text-gray-900">Emergency Contacts</h2>
          </div>

          <div className="space-y-4">
            {formData.emergencyContacts.map((contact, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">Contact {index + 1}</h3>
                  {formData.emergencyContacts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEmergencyContact(index)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    value={contact.name}
                    onChange={(e) => updateEmergencyContact(index, 'name', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Contact name"
                  />
                  <input
                    type="text"
                    value={contact.relationship}
                    onChange={(e) => updateEmergencyContact(index, 'relationship', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Relationship (e.g., Mother)"
                  />
                  <input
                    type="tel"
                    value={contact.phone}
                    onChange={(e) => updateEmergencyContact(index, 'phone', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Phone number"
                  />
                </div>
              </div>
            ))}
          </div>
          
          <button
            type="button"
            onClick={addEmergencyContact}
            className="mt-4 flex items-center space-x-2 text-blue-600 hover:text-blue-700"
          >
            <Plus className="h-4 w-4" />
            <span>Add Emergency Contact</span>
          </button>
        </div>

        {/* About Me - Support Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Heart className="h-5 w-5 text-pink-500" />
            <h2 className="text-xl font-semibold text-gray-900">About Me - Support Information</h2>
          </div>

          <div className="space-y-6">
            {/* Interests & Motivators */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Interests & Motivators
                <span className="text-gray-500 text-xs ml-1">(What they enjoy and what motivates them)</span>
              </label>
              <div className="space-y-2">
                {formData.interestsMotivators.map((item, index) => (
                  <div key={index} className="flex space-x-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => updateArrayItem('interestsMotivators', index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Music, praise and recognition, colorful stickers"
                    />
                    {formData.interestsMotivators.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem('interestsMotivators', index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => addArrayItem('interestsMotivators')}
                className="mt-2 flex items-center space-x-2 text-blue-600 hover:text-blue-700"
              >
                <Plus className="h-4 w-4" />
                <span>Add Interest/Motivator</span>
              </button>
            </div>

            {/* Challenges */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Challenges
                <span className="text-gray-500 text-xs ml-1">(Areas where they may need extra support)</span>
              </label>
              <div className="space-y-2">
                {formData.challenges.map((challenge, index) => (
                  <div key={index} className="flex space-x-2">
                    <input
                      type="text"
                      value={challenge}
                      onChange={(e) => updateArrayItem('challenges', index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Loud noises, sudden changes in routine"
                    />
                    {formData.challenges.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem('challenges', index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => addArrayItem('challenges')}
                className="mt-2 flex items-center space-x-2 text-blue-600 hover:text-blue-700"
              >
                <Plus className="h-4 w-4" />
                <span>Add Challenge</span>
              </button>
            </div>

            {/* Regulation Strategies */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Support & Regulation Strategies
                <span className="text-gray-500 text-xs ml-1">(Specific approaches that help them succeed)</span>
              </label>
              <div className="space-y-2">
                {formData.regulationStrategies.map((strategy, index) => (
                  <div key={index} className="flex space-x-2">
                    <input
                      type="text"
                      value={strategy}
                      onChange={(e) => updateArrayItem('regulationStrategies', index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Offer 5-minute breaks, use visual schedules, speak in calm, quiet voice"
                    />
                    {formData.regulationStrategies.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem('regulationStrategies', index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => addArrayItem('regulationStrategies')}
                className="mt-2 flex items-center space-x-2 text-blue-600 hover:text-blue-700"
              >
                <Plus className="h-4 w-4" />
                <span>Add Strategy</span>
              </button>
            </div>
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
            {loading ? 'Saving...' : (employeeId ? 'Update Employee' : 'Create Employee')}
          </button>
        </div>
      </form>
    </div>
  );
}