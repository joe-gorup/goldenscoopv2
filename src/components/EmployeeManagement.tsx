import React, { useState } from 'react';
import { User, Plus, Search, Edit, Eye, AlertTriangle, Phone, Heart, Brain, Shield } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import EmployeeForm from './EmployeeForm';
import EmployeeDetail from './EmployeeDetail';

export default function EmployeeManagement() {
  const { employees, developmentGoals } = useData();
  const { user } = useAuth();
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && employee.isActive) ||
      (statusFilter === 'inactive' && !employee.isActive);
    return matchesSearch && matchesStatus;
  });

  const getEmployeeGoals = (employeeId: string) => {
    return developmentGoals.filter(goal => goal.employeeId === employeeId);
  };

  const getEmployeeStats = (employeeId: string) => {
    const goals = getEmployeeGoals(employeeId);
    return {
      activeGoals: goals.filter(g => g.status === 'active').length,
      masteredGoals: goals.filter(g => g.masteryAchieved).length,
      totalGoals: goals.length
    };
  };

  const handleAddEmployee = () => {
    setEditingEmployee(null);
    setShowForm(true);
  };

  const handleEditEmployee = (employeeId: string) => {
    setEditingEmployee(employeeId);
    setShowForm(true);
  };

  const handleViewEmployee = (employeeId: string) => {
    setSelectedEmployee(employeeId);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingEmployee(null);
  };

  const handleCloseDetail = () => {
    setSelectedEmployee(null);
  };

  if (selectedEmployee) {
    return (
      <EmployeeDetail 
        employeeId={selectedEmployee} 
        onClose={handleCloseDetail}
      />
    );
  }

  if (showForm) {
    return (
      <EmployeeForm 
        employeeId={editingEmployee}
        onClose={handleCloseForm}
      />
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-end mb-8">
        {user?.role === 'admin' && (
          <button
            onClick={handleAddEmployee}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Add Employee</span>
          </button>
        )}
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="flex space-x-2">
            {['all', 'active', 'inactive'].map((status) => (
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

      {/* Employees Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 font-medium text-gray-900">Employee</th>
                <th className="text-left py-4 px-6 font-medium text-gray-900">Role</th>
                <th className="text-left py-4 px-6 font-medium text-gray-900">Status</th>
                <th className="text-left py-4 px-6 font-medium text-gray-900">Support Info</th>
                <th className="text-left py-4 px-6 font-medium text-gray-900">Goals</th>
                <th className="text-left py-4 px-6 font-medium text-gray-900">Created</th>
                <th className="text-right py-4 px-6 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredEmployees.map((employee) => {
                const stats = getEmployeeStats(employee.id);
                
                return (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <img
                          src={employee.profileImageUrl || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&dpr=2'}
                          alt={employee.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{employee.name}</p>
                          <p className="text-sm text-gray-500">ID: {employee.id}</p>
                        </div>
                      </div>
                    </td>
                    
                    <td className="py-4 px-6">
                      <span className="text-sm text-gray-900">{employee.role}</span>
                    </td>
                    
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        employee.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {employee.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        {employee.allergies.length > 0 && (
                          <div className="flex items-center space-x-1 text-amber-600">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="text-xs">{employee.allergies.length}</span>
                          </div>
                        )}
                        
                        {employee.emergencyContacts.length > 0 && (
                          <div className="flex items-center space-x-1 text-blue-600">
                            <Phone className="h-4 w-4" />
                            <span className="text-xs">{employee.emergencyContacts.length}</span>
                          </div>
                        )}
                        
                        {employee.interestsMotivators.length > 0 && (
                          <div className="flex items-center space-x-1 text-green-600">
                            <Heart className="h-4 w-4" />
                            <span className="text-xs">{employee.interestsMotivators.length}</span>
                          </div>
                        )}
                        
                        {employee.regulationStrategies.length > 0 && (
                          <div className="flex items-center space-x-1 text-purple-600">
                            <Brain className="h-4 w-4" />
                            <span className="text-xs">{employee.regulationStrategies.length}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="py-4 px-6">
                      <div className="flex space-x-3 text-sm">
                        <div className="text-blue-600">
                          <span className="font-medium">{stats.activeGoals}</span>
                          <span className="text-gray-500 ml-1">active</span>
                        </div>
                        <div className="text-green-600">
                          <span className="font-medium">{stats.masteredGoals}</span>
                          <span className="text-gray-500 ml-1">mastered</span>
                        </div>
                      </div>
                    </td>
                    
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {new Date(employee.createdAt).toLocaleDateString()}
                    </td>
                    
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleViewEmployee(employee.id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View employee details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        
                        {user?.role === 'admin' && (
                          <button
                            onClick={() => handleEditEmployee(employee.id)}
                            className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                            title="Edit employee"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredEmployees.length === 0 && (
          <div className="text-center py-12">
            <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No employees found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm 
                ? `No employees match "${searchTerm}"`
                : 'No employees match the current filters'
              }
            </p>
            {user?.role === 'admin' && !searchTerm && (
              <button
                onClick={handleAddEmployee}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add First Employee
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}