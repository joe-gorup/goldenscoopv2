import React, { useState, useEffect } from 'react';
import { User, Users, Calendar, Target, Settings, ChevronLeft, ChevronRight, Menu, X } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard';
import EmployeeManagement from './components/EmployeeManagement';
import UserManagement from './components/UserManagement';
import ActiveShift from './components/ActiveShift';
import GoalTemplates from './components/GoalTemplates';
import Sidebar from './components/Sidebar';

function AppContent() {
  const { user, isAuthenticated } = useAuth();
  const [activeSection, setActiveSection] = useState('active-shift');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  const getPageTitle = () => {
    switch (activeSection) {
      case 'active-shift':
        return { title: 'Start New Shift', description: 'Select employees who will be working this shift to begin documentation' };
      case 'dashboard':
        return { title: 'Dashboard', description: 'Overview of employee progress and shift activity' };
      case 'employees':
        return { title: 'Employee Management', description: 'Manage employee profiles, goals, and support information' };
      case 'users':
        return { title: 'User Management', description: 'Manage system users, roles, and access permissions' };
      case 'goal-templates':
        return { title: 'Goal Templates', description: 'Create and manage reusable goal templates for employee development' };
      default:
        return { title: 'Start New Shift', description: 'Select employees who will be working this shift to begin documentation' };
    }
  };

  const pageInfo = getPageTitle();

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'active-shift':
        return <ActiveShift />;
      case 'dashboard':
        return <Dashboard />;
      case 'employees':
        return <EmployeeManagement />;
      case 'users':
        return user?.role === 'admin' ? <UserManagement /> : <Dashboard />;
      case 'goal-templates':
        return user?.role === 'admin' ? <GoalTemplates /> : <Dashboard />;
      default:
        return <ActiveShift />;
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex">
      <Sidebar 
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />
      
      <div className={`flex flex-col h-full flex-1 transition-all duration-300 ${
        !sidebarCollapsed ? 'ml-64' : 'ml-0'
      }`}>
        <header className="bg-white shadow-sm border-b px-6 py-4 relative z-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarCollapsed(false)}
                className={`p-2 rounded-md hover:bg-gray-100 transition-all duration-200 ${
                  !sidebarCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'
                }`}
              >
                <Menu className="h-5 w-5 text-gray-600" />
              </button>
              
              <div className="text-left">
                <h1 className="text-xl font-semibold text-gray-900">{pageInfo.title}</h1>
                <p className="text-sm text-gray-600">{pageInfo.description}</p>
              </div>
            </div>
            
            <div></div>
          </div>
        </header>
        
        <main className="flex-1 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
}

export default App;