import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const GoogleAuthSuccess = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const hasProcessed = useRef(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Prevent multiple executions
    if (hasProcessed.current) return;
    
    const processGoogleAuth = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token'); // Access token
        const refreshToken = params.get('refreshToken'); // Refresh token
        
        console.log('URL params:', { token: !!token, refreshToken: !!refreshToken });
        console.log('Full URL:', window.location.href);
        
        if (token) {
          hasProcessed.current = true;
          
          // Store both tokens in localStorage
          localStorage.setItem('token', token);
          if (refreshToken) {
            localStorage.setItem('refreshToken', refreshToken);
          }
          
          // Decode JWT to get user info
          const payload = JSON.parse(atob(token.split('.')[1]));
          console.log('Token payload:', payload);
          
          // Login with user info from JWT
          login({
            id: payload.id,
            username: payload.username || 'Google User',
            email: payload.email,
            role: payload.role || 'customer',
            picture: payload.picture,
            isGoogleUser: payload.isGoogleUser || true,
          });
          
          console.log('Google login successful, redirecting to movies...');
          setLoading(false);
          navigate('/movies');
        } else {
          // Check if there's an error parameter
          const errorParam = params.get('error');
          const errorMessage = errorParam || 'No token found in URL';
          
          console.error('Google Auth Error:', errorMessage);
          console.log('All URL params:', [...params.entries()]);
          
          setError(errorMessage);
          setLoading(false);
          
          // Redirect to login after showing error for a moment
          setTimeout(() => {
            navigate(`/login?error=google-auth-failed&details=${encodeURIComponent(errorMessage)}`);
          }, 3000);
        }
      } catch (error) {
        console.error('Error processing Google login token:', error);
        setError(`Token processing error: ${error.message}`);
        setLoading(false);
        
        setTimeout(() => {
          navigate('/login?error=google-auth-failed');
        }, 3000);
      }
    };

    processGoogleAuth();
  }, [login, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
        {loading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-700">Processing Google Authentication...</h2>
            <p className="text-gray-500 mt-2">Please wait while we log you in</p>
          </div>
        ) : error ? (
          <div className="text-center">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <h3 className="font-bold">Authentication Error</h3>
              <p className="text-sm">{error}</p>
            </div>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Redirecting you back to login...</p>
          </div>
        ) : (
          <div className="text-center">
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              <h3 className="font-bold">Success!</h3>
              <p className="text-sm">Google authentication completed successfully</p>
            </div>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Redirecting to your movies...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoogleAuthSuccess;
