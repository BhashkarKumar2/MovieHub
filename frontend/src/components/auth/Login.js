import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import GoogleSignInButton from './GoogleSignInButton';

const Login = () => {
    const { login } = useAuth();
    const [error, setError] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('customer');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    // Animated particles background
    useEffect(() => {
        const createParticle = () => {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.cssText = `
                position: absolute;
                width: 2px;
                height: 2px;
                background: rgba(255, 255, 255, 0.5);
                pointer-events: none;
                border-radius: 50%;
                left: ${Math.random() * 100}vw;
                animation: float ${3 + Math.random() * 4}s linear infinite;
                top: 100vh;
            `;
            document.querySelector('.particles-container')?.appendChild(particle);
            
            setTimeout(() => {
                particle.remove();
            }, 7000);
        };

        const interval = setInterval(createParticle, 200);
        return () => clearInterval(interval);
    }, []);

    // Handle URL parameters for error messages
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const errorParam = params.get('error');
        const messageParam = params.get('message');
        const details = params.get('details');
        
        if (messageParam) {
            switch (messageParam) {
                case 'password-reset-success':
                    setError(''); // Clear any errors
                    // We'll use error state to show success message with green styling
                    setError('✅ Password reset successfully! Please log in with your new password.');
                    break;
                default:
                    break;
            }
        } else if (errorParam) {
            switch (errorParam) {
                case 'google-auth-failed':
                    setError(details ? 
                        `Google Authentication Failed: ${decodeURIComponent(details)}` : 
                        'Google authentication failed. Please try again.'
                    );
                    break;
                case 'no-token':
                    setError('Authentication failed: No token received from Google.');
                    break;
                case 'token-expired':
                    setError('Your session has expired. Please log in again.');
                    break;
                default:
                    setError('An authentication error occurred. Please try again.');
            }
        }
        
        // Clear the URL parameters after showing the message
        if (messageParam || errorParam) {
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            const response = await axios.post('http://localhost:5000/login', { username, password, role });
            localStorage.setItem('token', response.data.token);
            login({ username, role });

            if (role === 'admin') {
                navigate('/movieform');
            } else {
                navigate('/movies');
            }
        } catch (error) {
            console.error("Login failed:", error);
            setError("Login failed: " + (error.response?.data?.message || "Invalid credentials"));
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (googleUser) => {
        setError('');
        setLoading(true);
        
        try {
            // Send Google user data to backend for verification and login
            const response = await axios.post('http://localhost:5000/auth/google', {
                googleId: googleUser.id,
                email: googleUser.email,
                name: googleUser.name,
                picture: googleUser.picture,
                idToken: googleUser.idToken
            });
            
            localStorage.setItem('token', response.data.token);
            login({ 
                username: googleUser.name, 
                email: googleUser.email,
                role: response.data.user.role || 'customer',
                isGoogleUser: true 
            });

            // Always navigate to movies page for Google users (they default to customer role)
            navigate('/movies');
        } catch (error) {
            console.error("Google login failed:", error);
            setError("Google login failed: " + (error.response?.data?.message || "Unable to authenticate with Google"));
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleError = (error) => {
        console.error("Google sign-in error:", error);
        setError("Google sign-in failed. Please try again.");
    };

    return (
        <>
            <style>{`
                @keyframes float {
                    0% { transform: translateY(0px) translateX(0px); opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { transform: translateY(-100vh) translateX(20px); opacity: 0; }
                }
                @keyframes gradientShift {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
                @keyframes slideInUp {
                    0% { transform: translateY(50px); opacity: 0; }
                    100% { transform: translateY(0); opacity: 1; }
                }
                .bg-cinematic {
                    background: linear-gradient(-45deg, #1a1a2e, #16213e, #0f0f23, #533483);
                    background-size: 400% 400%;
                    animation: gradientShift 8s ease infinite;
                }
                .glass-morphism {
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                }
                .movie-glow {
                    box-shadow: 0 0 30px rgba(251, 191, 36, 0.3);
                }
                .slide-in {
                    animation: slideInUp 0.8s ease-out;
                }
            `}</style>
            
            <div className="min-h-screen bg-cinematic relative overflow-hidden flex items-center justify-center">
                {/* Particles Container */}
                <div className="particles-container absolute inset-0 pointer-events-none"></div>
                
                {/* Background Movie Icons */}
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-20 left-20 text-6xl">🎬</div>
                    <div className="absolute top-40 right-32 text-4xl">🎭</div>
                    <div className="absolute bottom-32 left-40 text-5xl">🎪</div>
                    <div className="absolute bottom-20 right-20 text-6xl">🎨</div>
                    <div className="absolute top-1/2 left-10 text-3xl">🎵</div>
                    <div className="absolute top-1/3 right-10 text-5xl">⭐</div>
                </div>

                {/* Main Login Container */}
                <div className="slide-in w-full max-w-md mx-4">
                    {/* Logo/Brand Section */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-yellow-400 to-red-500 rounded-full mb-4 movie-glow">
                            <span className="text-3xl">🎬</span>
                        </div>
                        <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-yellow-400 to-red-500 bg-clip-text text-transparent">
                            MovieHub
                        </h1>
                        <p className="text-gray-300 text-lg">Your Gateway to Cinema</p>
                    </div>

                    {/* Login Form */}
                    <div className="glass-morphism rounded-2xl p-8 shadow-2xl">
                        <h2 className="text-3xl font-bold text-center mb-8 text-white">
                            Welcome Back
                        </h2>

                        {error && (
                            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-center animate-pulse">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-6">
                            {/* Role Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Choose Your Role
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setRole('customer')}
                                        className={`p-3 rounded-lg border-2 transition-all duration-300 ${
                                            role === 'customer' 
                                                ? 'border-yellow-400 bg-yellow-400/20 text-yellow-400' 
                                                : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500'
                                        }`}
                                    >
                                        <div className="text-2xl mb-1">🍿</div>
                                        <div className="text-sm">Movie Fan</div>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setRole('admin')}
                                        className={`p-3 rounded-lg border-2 transition-all duration-300 ${
                                            role === 'admin' 
                                                ? 'border-red-400 bg-red-400/20 text-red-400' 
                                                : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500'
                                        }`}
                                    >
                                        <div className="text-2xl mb-1">👑</div>
                                        <div className="text-sm">Admin</div>
                                    </button>
                                </div>
                            </div>

                            {/* Username Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Username
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all duration-300"
                                        placeholder="Enter your username"
                                        required
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                        <span className="text-gray-400">👤</span>
                                    </div>
                                </div>
                            </div>

                            {/* Password Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-4 py-3 pr-12 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all duration-300"
                                        placeholder="Enter your password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
                                    >
                                        {showPassword ? '🙈' : '👁️'}
                                    </button>
                                </div>
                            </div>

                            {/* Login Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 px-4 bg-gradient-to-r from-yellow-400 to-red-500 hover:from-yellow-500 hover:to-red-600 text-white font-semibold rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed movie-glow"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                        Signing In...
                                    </div>
                                ) : (
                                    'Sign In'
                                )}
                            </button>

                            {/* Forgot Password Link */}
                            <div className="text-center mt-4">
                                <Link 
                                    to="/forgot-password" 
                                    className="text-gray-400 hover:text-white text-sm transition-colors duration-300 hover:underline"
                                >
                                    Forgot your password?
                                </Link>
                            </div>
                        </form>

                        {/* Divider */}
                        <div className="my-6 flex items-center">
                            <div className="flex-1 border-t border-gray-600"></div>
                            <span className="px-4 text-gray-400 text-sm">or</span>
                            <div className="flex-1 border-t border-gray-600"></div>
                        </div>

                        {/* Google Sign-In */}
                        <GoogleSignInButton
                            onSuccess={handleGoogleSuccess}
                            onError={handleGoogleError}
                            disabled={loading}
                        />

                        {/* Register Link */}
                        <div className="mt-8 text-center">
                            <p className="text-gray-300">
                                New to MovieHub?{' '}
                                <Link 
                                    to="/register" 
                                    className="text-yellow-400 hover:text-yellow-300 font-semibold transition-colors duration-300 hover:underline"
                                >
                                    Create Account
                                </Link>
                            </p>
                        </div>

                        {/* Demo Credentials */}
                        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                            <p className="text-blue-300 text-sm text-center mb-2">Quick Demo Access:</p>
                            <div className="text-xs text-blue-200 text-center space-y-1">
                                <div>👤 Customer: <code>demo / demo123</code></div>
                                <div>👑 Admin: <code>admin / admin123</code></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Login;
