import React from "react";
import { useNavigate } from "react-router-dom";

const Navbar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <nav className="flex justify-between items-center px-6 py-4 bg-white shadow-md">
      <div className="flex items-center gap-3">
        {/* Logo with gradient background */}
        <div className="h-10 w-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
          <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
          </svg>
        </div>
        {/* Site name */}
        <h1 className="text-lg font-semibold text-primary">Nova Schola Hub</h1>
      </div>

      <div className="flex items-center gap-3">
        <button
          className="text-gray-700 hover:text-gray-900 font-medium"
          onClick={() => navigate('/login')}
        >
          Login
        </button>
        <button
          className="bg-primary hover:bg-blue-600/90 text-white px-4 py-2 rounded-md font-semibold"
          onClick={() => navigate('/register')}
        >
          Register
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
