import { Link, useNavigate } from 'react-router-dom';
import { Home, PlusCircle, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Navigation = () => {
  const { logout, username } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2 text-blue-600">
              <Home className="w-5 h-5" />
              <span className="font-semibold">Travel Planner</span>
            </Link>
            <Link
              to="/add-trip"
              className="flex items-center space-x-1 text-gray-600 hover:text-blue-600"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Add Trip</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">{username}</span>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 text-gray-600 hover:text-red-600"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};