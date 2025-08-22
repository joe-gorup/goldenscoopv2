import React, { useState } from 'react';
import { Calendar, Play, Square, Users, Clock, ChevronLeft, ChevronRight, CheckCircle, AlertCircle, Search, AlertTriangle, Phone, Heart, Brain } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import EmployeeProgress from './EmployeeProgress';

export default function ActiveShift() {
  const { employees, activeShift, createShift, endShift, developmentGoals } = useData();
  const { user } = useAuth();
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState('9540 Nall Avenue');
  const [currentEmployeeIndex, setCurrentEmployeeIndex] = useState(0);
  const [showCreateShift, setShowCreateShift] = useState(!activeShift);
  const [searchTerm, setSearchTerm] = useState('');

  const activeEmployees = employees.filter(emp => emp.isActive);
  const filteredEmployees = activeEmployees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const shiftEmployees = activeShift ? 
    employees.filter(emp => activeShift.employeeIds.includes(emp.id)) : [];
  const currentEmployee = shiftEmployees[currentEmployeeIndex];

  const handleCreateShift = () => {
    if (selectedEmployees.length > 0) {
      createShift(selectedEmployees);
      setShowCreateShift(false);
      setCurrentEmployeeIndex(0);
    }
  };

  const handleEndShift = () => {
    endShift();
    setShowCreateShift(true);
    setSelectedEmployees([]);
    setCurrentEmployeeIndex(0);
  };

  const toggleEmployeeSelection = (employeeId: string) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const goToNextEmployee = () => {
    if (currentEmployeeIndex < shiftEmployees.length - 1) {
      setCurrentEmployeeIndex(currentEmployeeIndex + 1);
    }
  };

  const goToPreviousEmployee = () => {
    if (currentEmployeeIndex > 0) {
      setCurrentEmployeeIndex(currentEmployeeIndex - 1);
    }
  };

  const getEmployeeGoals = (employeeId: string) => {
    return developmentGoals.filter(goal => 
      goal.employeeId === employeeId && goal.status === 'active'
    );
  };

  if (showCreateShift || !activeShift) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        {/* Location Selector */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <label htmlFor="location" className="text-sm font-medium text-gray-700">
                Shift Location:
              </label>
              <select
                id="location"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="9540 Nall Avenue">9540 Nall Avenue</option>
                <option value="10460 W 103rd St.">10460 W 103rd St.</option>
              </select>
            </div>
            
            <button
              onClick={handleCreateShift}
              disabled={selectedEmployees.length === 0}
              className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                selectedEmployees.length > 0
                  ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md cursor-pointer'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed border border-gray-300'
              }`}
            >
              <Play className={`h-4 w-4 ${
                selectedEmployees.length > 0 ? 'text-white' : 'text-gray-400'
              }`} />
              <span>
                {selectedEmployees.length > 0 
                  ? `Start Shift (${selectedEmployees.length} selected)`
                  : 'Start Shift (select employees)'
                }
              </span>
            </button>
          </div>
        </div>

        {/* Search and Filters */}
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
              <button
                onClick={() => setSelectedEmployees([])}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={() => setSelectedEmployees(filteredEmployees.map(emp => emp.id))}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                Select All
              </button>
            </div>
          </div>
        </div>

        {/* Employee Selection Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 font-medium text-gray-900 w-12">
                    <input
                      type="checkbox"
                      checked={selectedEmployees.length === filteredEmployees.length && filteredEmployees.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedEmployees(filteredEmployees.map(emp => emp.id));
                        } else {
                          setSelectedEmployees([]);
                        }
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900 min-w-[280px]">Employee</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">Role</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">Support Info</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">Active Goals</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">Last Shift</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredEmployees.map((employee) => {
                  const isSelected = selectedEmployees.includes(employee.id);
                  const employeeGoals = getEmployeeGoals(employee.id);
                  
                  return (
                    <tr 
                      key={employee.id} 
                      className={`hover:bg-gray-50 cursor-pointer ${
                        isSelected ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => toggleEmployeeSelection(employee.id)}
                    >
                      <td className="py-4 px-6 w-12">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleEmployeeSelection(employee.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                      
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
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-blue-600">
                            {employeeGoals.length}
                          </span>
                          <span className="text-sm text-gray-500">
                            goal{employeeGoals.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </td>
                      
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {/* This would come from actual shift data */}
                        Yesterday
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredEmployees.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No employees found</h3>
              <p className="text-gray-600">
                {searchTerm 
                  ? `No employees match "${searchTerm}"`
                  : 'No active employees available'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Active Shift Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-lg font-semibold text-gray-900">
                Active Shift - {selectedLocation}
              </span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>{new Date(activeShift.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Started: {activeShift.startTime}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>{shiftEmployees.length} super scooper{shiftEmployees.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-blue-600 font-medium">4-hour shift</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleEndShift}
              className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              <Square className="h-4 w-4" />
              <span>End Shift</span>
            </button>
          </div>
        </div>
      </div>

        {/* Employee Navigation - Combined */}
        {currentEmployee && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <h2 className="text-lg font-semibold text-gray-900">Documenting Progress</h2>
                <span className="text-sm text-gray-500">
                  {currentEmployeeIndex + 1} of {shiftEmployees.length} super scoopers
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={goToPreviousEmployee}
                  disabled={currentEmployeeIndex === 0}
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-4 w-4 text-gray-600" />
                </button>
                
                <button
                  onClick={goToNextEmployee}
                  disabled={currentEmployeeIndex === shiftEmployees.length - 1}
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="h-4 w-4 text-gray-600" />
                </button>
              </div>
            </div>
            
            {/* Employee Tabs */}
            <div className="flex space-x-2">
              {shiftEmployees.map((employee, index) => (
                <button
                  key={employee.id}
                  onClick={() => setCurrentEmployeeIndex(index)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    index === currentEmployeeIndex
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {employee.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
        )}


        {currentEmployee && (
          <div className="mt-6">
            <EmployeeProgress 
              employee={currentEmployee}
              shiftId={activeShift.id}
            />
          </div>
        )}
    </div>
  );
}