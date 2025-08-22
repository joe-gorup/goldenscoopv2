import React from 'react';
import { Calendar, Users, Target, CheckCircle, Clock, AlertTriangle, TrendingUp } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const { employees, activeShift, developmentGoals, stepProgress } = useData();
  const { user } = useAuth();

  // Calculate dashboard metrics
  const activeEmployees = employees.filter(emp => emp.isActive);
  const activeGoals = developmentGoals.filter(goal => goal.status === 'active');
  const masteredGoals = developmentGoals.filter(goal => goal.masteryAchieved);
  const goalsNearMastery = developmentGoals.filter(goal => 
    goal.status === 'active' && goal.consecutiveAllCorrect >= 2
  );

  // Recent progress (last 7 days)
  const recentProgress = stepProgress.filter(progress => {
    const progressDate = new Date(progress.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return progressDate >= weekAgo;
  });

  const successRate = recentProgress.length > 0 
    ? Math.round((recentProgress.filter(p => p.outcome === 'correct').length / recentProgress.length) * 100)
    : 0;

  const stats = [
    {
      label: 'Active Employees',
      value: activeEmployees.length,
      icon: Users,
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      label: 'Active Goals',
      value: activeGoals.length,
      icon: Target,
      color: 'bg-teal-500',
      textColor: 'text-teal-600'
    },
    {
      label: 'Goals Mastered',
      value: masteredGoals.length,
      icon: CheckCircle,
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      label: 'Success Rate',
      value: `${successRate}%`,
      icon: TrendingUp,
      color: 'bg-purple-500',
      textColor: 'text-purple-600'
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className={`text-2xl font-bold ${stat.textColor} mb-1`}>
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Current Shift Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Current Shift</h2>
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>

          {activeShift ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-800 font-medium">Shift Active</span>
                <span className="text-green-600 text-sm">Started: {activeShift.startTime}</span>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-3">Employees on Shift</h3>
                <div className="space-y-2">
                  {activeShift.employeeIds.map(empId => {
                    const employee = employees.find(emp => emp.id === empId);
                    if (!employee) return null;
                    
                    return (
                      <div key={empId} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                        <img 
                          src={employee.profileImageUrl || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&dpr=2'} 
                          alt={employee.name}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{employee.name}</p>
                          <p className="text-sm text-gray-500">{employee.role}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Shift</h3>
              <p className="text-gray-600 mb-4">Start a shift to begin documenting employee progress</p>
            </div>
          )}
        </div>

        {/* Goals Near Mastery */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Goals Near Mastery</h2>
            <Target className="h-5 w-5 text-gray-400" />
          </div>

          {goalsNearMastery.length > 0 ? (
            <div className="space-y-4">
              {goalsNearMastery.slice(0, 5).map(goal => {
                const employee = employees.find(emp => emp.id === goal.employeeId);
                if (!employee) return null;

                return (
                  <div key={goal.id} className="p-4 border border-orange-200 bg-orange-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{goal.title}</h3>
                      <div className="flex items-center space-x-2">
                        <div className="text-sm font-medium text-orange-600">
                          {goal.consecutiveAllCorrect}/3
                        </div>
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{employee.name}</p>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(goal.consecutiveAllCorrect / 3) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {3 - goal.consecutiveAllCorrect} more needed
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Goals Near Mastery</h3>
              <p className="text-gray-600">Goals will appear here when employees are close to mastery</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
        
        {recentProgress.length > 0 ? (
          <div className="space-y-3">
            {recentProgress.slice(0, 10).map(progress => {
              const employee = employees.find(emp => emp.id === progress.employeeId);
              const goal = developmentGoals.find(g => g.id === progress.developmentGoalId);
              if (!employee || !goal) return null;

              return (
                <div key={progress.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50">
                  <img 
                    src={employee.profileImageUrl || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&dpr=2'} 
                    alt={employee.name}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium text-gray-900">{employee.name}</span>
                      <span className="text-gray-600"> worked on </span>
                      <span className="font-medium text-gray-900">{goal.title}</span>
                    </p>
                    <p className="text-xs text-gray-500">{new Date(progress.date).toLocaleDateString()}</p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    progress.outcome === 'correct' ? 'bg-green-100 text-green-800' :
                    progress.outcome === 'verbal_prompt' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {progress.outcome === 'correct' ? 'Correct' :
                     progress.outcome === 'verbal_prompt' ? 'Verbal Prompt' : 'N/A'}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No recent activity to display</p>
          </div>
        )}
      </div>
    </div>
  );
}