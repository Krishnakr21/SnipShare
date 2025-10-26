import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isUserLoggedIn } from '../utils/auth';

const ProtectedRoute = ({ children, isAuthPage = false }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      const isLoggedInResult = await isUserLoggedIn();
      setLoggedIn(isLoggedInResult);
      
      // If it's an auth page (login/signup) and user is logged in, redirect to home
      if (isAuthPage && isLoggedInResult) {
        navigate('/');
      }
      // If it's a protected page and user is not logged in, redirect to login
      else if (!isAuthPage && !isLoggedInResult) {
        navigate('/login');
      }
      
      setLoading(false);
    };

    checkAuth();
  }, [navigate, isAuthPage]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black to-gray-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // For auth pages, show if not logged in
  // For protected pages, show if logged in
  return isAuthPage ? (!loggedIn ? children : null) : (loggedIn ? children : null);
};

export default ProtectedRoute; 