import React, { useState } from 'react';
import { 
  Home, 
  Plus, 
  BarChart3, 
  Settings, 
  Menu, 
  X, 
  Bell,
  Search,
  User
} from 'lucide-react';

interface MobileNavigationProps {
  currentView: 'avatar-landing' | 'dashboard' | 'rfq-wizard';
  onCreateRFQ: () => void;
  onBackToDashboard: () => void;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({
  currentView,
  onCreateRFQ,
  onBackToDashboard,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <>
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-surface-200 shadow-sm md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-accent-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-surface-900">Robbie</h1>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-surface-100 rounded-lg transition-colors">
              <Search className="w-5 h-5 text-surface-600" />
            </button>
            <button className="p-2 hover:bg-surface-100 rounded-lg transition-colors relative">
              <Bell className="w-5 h-5 text-surface-600" />
              <div className="absolute top-1 right-1 w-2 h-2 bg-accent-500 rounded-full"></div>
            </button>
            <button
              onClick={toggleMenu}
              className="p-2 hover:bg-surface-100 rounded-lg transition-colors"
            >
              {isMenuOpen ? (
                <X className="w-5 h-5 text-surface-600" />
              ) : (
                <Menu className="w-5 h-5 text-surface-600" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={toggleMenu} />
          <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300">
            <div className="p-6">
              {/* User Profile */}
              <div className="flex items-center space-x-3 mb-8 pb-6 border-b border-surface-200">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-surface-900">Admin User</h3>
                  <p className="text-sm text-surface-600">admin@company.com</p>
                </div>
              </div>

              {/* Navigation Items */}
              <nav className="space-y-2">
                <button
                  onClick={() => {
                    onBackToDashboard();
                    setIsMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
                    currentView === 'dashboard'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-surface-700 hover:bg-surface-100'
                  }`}
                >
                  <Home className="w-5 h-5" />
                  <span className="font-medium">Dashboard</span>
                </button>

                <button
                  onClick={() => {
                    onCreateRFQ();
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-surface-700 hover:bg-surface-100 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  <span className="font-medium">Create RFQ</span>
                </button>

                <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-surface-700 hover:bg-surface-100 transition-colors">
                  <BarChart3 className="w-5 h-5" />
                  <span className="font-medium">Analytics</span>
                </button>

                <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-surface-700 hover:bg-surface-100 transition-colors">
                  <Settings className="w-5 h-5" />
                  <span className="font-medium">Settings</span>
                </button>
              </nav>

              {/* Quick Actions */}
              <div className="mt-8 pt-6 border-t border-surface-200">
                <h4 className="text-sm font-semibold text-surface-900 mb-4">Quick Actions</h4>
                <button
                  onClick={() => {
                    onCreateRFQ();
                    setIsMenuOpen(false);
                  }}
                  className="w-full bg-gradient-to-r from-primary-600 to-accent-600 text-white py-3 px-4 rounded-xl font-medium shadow-lg"
                >
                  Create Smart RFQ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-surface-200 md:hidden">
        <div className="grid grid-cols-4 gap-1">
          <button
            onClick={onBackToDashboard}
            className={`flex flex-col items-center py-3 px-2 transition-colors ${
              currentView === 'dashboard'
                ? 'text-primary-600'
                : 'text-surface-500 hover:text-surface-700'
            }`}
          >
            <Home className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Home</span>
          </button>

          <button
            onClick={onCreateRFQ}
            className="flex flex-col items-center py-3 px-2 text-surface-500 hover:text-surface-700 transition-colors"
          >
            <Plus className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Create</span>
          </button>

          <button className="flex flex-col items-center py-3 px-2 text-surface-500 hover:text-surface-700 transition-colors">
            <BarChart3 className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Reports</span>
          </button>

          <button className="flex flex-col items-center py-3 px-2 text-surface-500 hover:text-surface-700 transition-colors">
            <Settings className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Settings</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default MobileNavigation;
