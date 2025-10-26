import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { isUserLoggedInSync } from '../utils/auth';
import { FaUserCircle, FaPlus, FaFileAlt, FaSignOutAlt } from 'react-icons/fa';
import { FiLogIn, FiUserPlus } from 'react-icons/fi';
import config from '../config';

const Navbar = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(isUserLoggedInSync());
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const checkAuth = () => {
      const loggedIn = isUserLoggedInSync();
      setIsLoggedIn(loggedIn);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        checkAuth();
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const handleCreateNew = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate('/login');
      return;
    }

    // Redirect to Code_compiler app
    window.location.href = config.codeCompilerUrl;
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setIsLoggedIn(false);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  return (
    <nav className="w-full backdrop-blur-sm py-0.5 bg-white/5 border-b border-white/10 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex lg:flex-1">
          <Link to="https://careerhubs.info" className="-m-1 p-1 flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-base">C</span>
            </div>
            <div className="text-base font-bold text-white">
              CodeShare
            </div>
          </Link>
        </div>
        
        <div className="flex items-center gap-4">
          {isLoggedIn ? <button 
              onClick={handleCreateNew}
              className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-orange-500 text-white px-3 py-1.5 rounded-lg transition-all hover:opacity-90 transform hover:scale-105 shadow-md"
              title="Create New Document"
            >
              <FaPlus className="w-4 h-4" />
              <span className="hidden md:inline text-sm font-medium">New Document</span>
            </button> : null}
          
          {isLoggedIn ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={toggleProfileDropdown}
                className="text-gray-300 hover:text-pink-500 transition-colors focus:outline-none hover:bg-white/5 p-1.5 rounded-full"
                title="Profile"
              >
                <FaUserCircle className="w-5 h-5" />
              </button>
              
              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-48 backdrop-blur-lg bg-white/5 rounded-lg shadow-xl z-50 border border-white/10 overflow-hidden">
                  <div className="py-1">
                    <Link 
                      to="/files" 
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-200 hover:bg-white/10 w-full transition-colors"
                    >
                      <FaFileAlt className="w-4 h-4 text-pink-500" />
                      Your Files
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-200 hover:bg-white/10 w-full transition-colors"
                    >
                      <FaSignOutAlt className="w-4 h-4 text-red-400" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link 
                to="/login" 
                className="flex items-center gap-2 backdrop-blur-sm bg-white/5 border border-white/10 text-gray-300 px-3 py-1.5 rounded-lg transition-all hover:bg-white/10 hover:border-white/20 transform hover:scale-105"
                title="Login"
              >
                <FiLogIn className="w-4 h-4" />
                <span className="hidden md:inline text-sm font-medium">Login</span>
              </Link>
              <Link 
                to="/signup" 
                className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-orange-500 text-white px-3 py-1.5 rounded-lg transition-all hover:opacity-90 transform hover:scale-105 shadow-md"
                title="Signup"
              >
                <FiUserPlus className="w-4 h-4" />
                <span className="hidden md:inline text-sm font-medium">Signup</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;