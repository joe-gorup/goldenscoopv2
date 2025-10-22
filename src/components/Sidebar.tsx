import React from 'react';
import { LayoutDashboard, Users, Calendar, Target, Settings, LogOut, Menu, X, PanelLeft, ClipboardCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export default function Sidebar({ activeSection, setActiveSection, collapsed, setCollapsed }: SidebarProps) {
  const { user, logout } = useAuth();

  const menuItems = [
    { id: 'active-shift', label: 'Shifts', icon: Calendar, roles: ['admin', 'shift_manager'] },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'shift_manager'] },
    { id: 'employees', label: 'Employees', icon: Users, roles: ['admin', 'shift_manager'] },
    { id: 'users', label: 'User Management', icon: Settings, roles: ['admin'] },
    { id: 'goal-templates', label: 'Goal Templates', icon: Target, roles: ['admin'] },
    { id: 'assessment-mockups', label: 'Assessment Mockups', icon: ClipboardCheck, roles: ['admin', 'shift_manager'] }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role || 'shift_manager')
  );

  const handleItemClick = (itemId: string) => {
    setActiveSection(itemId);
  };

  if (collapsed) {
    return null;
  }

  return (
    <>
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-gray-900 z-30 flex flex-col shadow-xl">
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Golden Scoop</h2>
              <p className="text-sm text-gray-400">Shift Manager</p>
            </div>
            <button
              onClick={() => setCollapsed(true)}
              className="p-2 rounded-md hover:bg-gray-800 transition-colors"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleItemClick(item.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-gray-700">
          <div className="mb-3">
            <p className="text-sm font-medium text-white">{user?.name}</p>
            <p className="text-xs text-gray-400 capitalize">{user?.role?.replace('_', ' ')}</p>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-300 hover:bg-red-900/20 hover:text-red-400 rounded-md transition-all duration-200"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
}