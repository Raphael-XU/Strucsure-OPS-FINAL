import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Menu, 
  X, 
  Home, 
  Users, 
  Settings, 
  Shield, 
  Briefcase,
  LogOut,
  User
} from 'lucide-react';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser, userRole, logout } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isActive = (path) => location.pathname === path;

  if (!currentUser || location.pathname === '/dashboard') return null;

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex-shrink-0 flex items-center">
              <Briefcase className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                StrucSure
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            <Link
              to="/dashboard"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/dashboard')
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              <Home className="inline h-4 w-4 mr-1" />
              Dashboard
            </Link>

            <Link
              to="/profile"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/profile')
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              <User className="inline h-4 w-4 mr-1" />
              Profile
            </Link>

            {(userRole === 'admin' || userRole === 'executive') && (
              <Link
                to="/executive"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/executive')
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <Users className="inline h-4 w-4 mr-1" />
                Executive
              </Link>
            )}

            {userRole === 'admin' && (
              <Link
                to="/admin"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/admin')
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <Shield className="inline h-4 w-4 mr-1" />
                Admin
              </Link>
            )}

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {currentUser.displayName || currentUser.email}
              </span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                userRole === 'admin' 
                  ? 'bg-red-100 text-red-800'
                  : userRole === 'executive'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-green-100 text-green-800'
              }`}>
                {userRole?.charAt(0).toUpperCase() + userRole?.slice(1)}
              </span>
              <button
                onClick={handleLogout}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50"
              >
                <LogOut className="inline h-4 w-4 mr-1" />
                Logout
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
            <Link
              to="/dashboard"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/dashboard')
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
              }`}
              onClick={() => setIsOpen(false)}
            >
              <Home className="inline h-4 w-4 mr-2" />
              Dashboard
            </Link>

            <Link
              to="/profile"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/profile')
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
              }`}
              onClick={() => setIsOpen(false)}
            >
              <User className="inline h-4 w-4 mr-2" />
              Profile
            </Link>

            {(userRole === 'admin' || userRole === 'executive') && (
              <Link
                to="/executive"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/executive')
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                }`}
                onClick={() => setIsOpen(false)}
              >
                <Users className="inline h-4 w-4 mr-2" />
                Executive
              </Link>
            )}

            {userRole === 'admin' && (
              <Link
                to="/admin"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/admin')
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                }`}
                onClick={() => setIsOpen(false)}
              >
                <Shield className="inline h-4 w-4 mr-2" />
                Admin
              </Link>
            )}

            <div className="border-t pt-4 mt-4">
              <div className="px-3 py-2 text-sm text-gray-700">
                {currentUser.displayName || currentUser.email}
              </div>
              <div className="px-3 py-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  userRole === 'admin' 
                    ? 'bg-red-100 text-red-800'
                    : userRole === 'executive'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {userRole?.charAt(0).toUpperCase() + userRole?.slice(1)}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-red-600 hover:bg-red-50"
              >
                <LogOut className="inline h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
