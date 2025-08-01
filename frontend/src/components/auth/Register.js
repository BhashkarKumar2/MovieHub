import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import GoogleSignInButton from './GoogleSignInButton';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('customer');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState({ score: 0, text: '', color: '' });
    const { login } = useAuth();
    const navigate = useNavigate();

    // Animated particles background
    useEffect(() => {
        const createParticle = () => {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.cssText = `
                position: absolute;
                width: 3px;
                height: 3px;
                background: rgba(251, 191, 36, 0.6);
                pointer-events: none;
                border-radius: 50%;
                left: ${Math.random() * 100}vw;
                animation: float ${4 + Math.random() * 3}s linear infinite;
                top: 100vh;
            `;
            document.querySelector('.particles-container')?.appendChild(particle);
            
            setTimeout(() => {
                particle.remove();
            }, 7000);
        };

        const interval = setInterval(createParticle, 150);
        return () => clearInterval(interval);
    }, []);

    // Password strength checker
    useEffect(() => {
        const checkPasswordStrength = (pwd) => {
            let score = 0;
            let feedback = [];

            if (pwd.length >= 8) score += 1;
            else feedback.push('8+ characters');

            if (/[a-z]/.test(pwd)) score += 1;
            else feedback.push('lowercase');

            if (/[A-Z]/.test(pwd)) score += 1;
            else feedback.push('uppercase');

            if (/[0-9]/.test(pwd)) score += 1;
            else feedback.push('number');

            if (/[^a-zA-Z0-9]/.test(pwd)) score += 1;
            else feedback.push('special character');

            let strength = { score, text: '', color: '' };
            
            if (score === 0) {
                strength = { score, text: 'Enter password', color: 'text-gray-400' };
            } else if (score <= 2) {
                strength = { score, text: `Weak (need: ${feedback.join(', ')})`, color: 'text-red-400' };
            } else if (score <= 3) {
                strength = { score, text: `Fair (missing: ${feedback.join(', ')})`, color: 'text-yellow-400' };
            } else if (score <= 4) {
                strength = { score, text: 'Good', color: 'text-blue-400' };
            } else {
                strength = { score, text: 'Excellent', color: 'text-green-400' };
            }

            return strength;
        };

        setPasswordStrength(checkPasswordStrength(password));
    }, [password]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (passwordStrength.score < 2) {
            setError('Please choose a stronger password');
            return;
        }

        setLoading(true);
        
        try {
            const response = await axios.post('http://localhost:5000/register', { username, password, role });
            // Show success message and redirect
            navigate('/login', { 
                state: { 
                    message: 'Registration successful! Please log in with your credentials.' 
                }
            });
        } catch (error) {
            setError("Registration failed: " + (error.response?.data?.message || "Username might already exist"));
            console.error("Error registering user:", error);
        } finally {
            setLoading(false);
        }
    };


    // Google sign-in is now handled by backend redirect. No handlers needed.

    return (
        <>
            <style>{`
                @keyframes float {
                    0% { transform: translateY(0px) translateX(0px); opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { transform: translateY(-100vh) translateX(-20px); opacity: 0; }
                }
                @keyframes gradientShift {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
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
                    background: rgba(255, 255, 255, 0.12);
                    backdrop-filter: blur(15px);
                    border: 1px solid rgba(255, 255, 255, 0.25);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                }
                .movie-glow {
                    box-shadow: 0 0 30px rgba(251, 191, 36, 0.4);
                }
                .slide-in {
                    animation: slideInUp 0.8s ease-out;
                }
            `}</style>
            
            <div className="min-h-screen bg-cinematic relative overflow-hidden flex items-center justify-center py-12">
                {/* Particles Container */}
                <div className="particles-container absolute inset-0 pointer-events-none"></div>
                
                {/* Background Movie Icons */}
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-16 left-16 text-5xl">🎞️</div>
                    <div className="absolute top-32 right-24 text-4xl">🎪</div>
                    <div className="absolute bottom-24 left-32 text-6xl">🎨</div>
                    <div className="absolute bottom-16 right-16 text-5xl">🎭</div>
                    <div className="absolute top-1/2 left-8 text-3xl">📽️</div>
                    <div className="absolute top-1/4 right-8 text-4xl">🌟</div>
                </div>

                {/* Main Register Container */}
                <div className="slide-in w-full max-w-md mx-4">
                    {/* Logo/Brand Section */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mb-4 movie-glow">
                            <span className="text-3xl">🎬</span>
                        </div>
                        <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                            Join MovieHub
                        </h1>
                        <p className="text-gray-300 text-lg">Start Your Cinema Journey</p>
                    </div>

                    {/* Register Form */}
                    <div className="glass-morphism rounded-2xl p-8 shadow-2xl">
                        <h2 className="text-3xl font-bold text-center mb-8 text-white">
                            Create Account
                        </h2>

                        {error && (
                            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-center animate-pulse">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Role Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-3">
                                    What brings you here?
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setRole('customer')}
                                        className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                                            role === 'customer' 
                                                ? 'border-green-400 bg-green-400/20 text-green-400' 
                                                : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500'
                                        }`}
                                    >
                                        <div className="text-3xl mb-2">🍿</div>
                                        <div className="text-sm font-medium">Movie Lover</div>
                                        <div className="text-xs text-gray-400">Discover & watch</div>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setRole('admin')}
                                        className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                                            role === 'admin' 
                                                ? 'border-purple-400 bg-purple-400/20 text-purple-400' 
                                                : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500'
                                        }`}
                                    >
                                        <div className="text-3xl mb-2">👑</div>
                                        <div className="text-sm font-medium">Administrator</div>
                                        <div className="text-xs text-gray-400">Manage platform</div>
                                    </button>
                                </div>
                            </div>

                            {/* Username Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Choose Username
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-800/70 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition-all duration-300"
                                        placeholder="Your unique username"
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
                                    Create Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-4 py-3 pr-12 bg-gray-800/70 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition-all duration-300"
                                        placeholder="Strong password"
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
                                {password && (
                                    <div className="mt-2 space-y-2">
                                        <div className="flex items-center space-x-2">
                                            <div className="flex-1 bg-gray-700 rounded-full h-2">
                                                <div 
                                                    className={`h-2 rounded-full transition-all duration-300 ${
                                                        passwordStrength.score <= 2 ? 'bg-red-400' :
                                                        passwordStrength.score <= 3 ? 'bg-yellow-400' :
                                                        passwordStrength.score <= 4 ? 'bg-blue-400' : 'bg-green-400'
                                                    }`}
                                                    style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                        <p className={`text-xs ${passwordStrength.color}`}>
                                            {passwordStrength.text}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Confirm Password Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-800/70 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition-all duration-300"
                                        placeholder="Confirm your password"
                                        required
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                        <span className={`${
                                            confirmPassword && password === confirmPassword 
                                                ? 'text-green-400' 
                                                : confirmPassword 
                                                    ? 'text-red-400' 
                                                    : 'text-gray-400'
                                        }`}>
                                            {confirmPassword && password === confirmPassword ? '✓' : '🔒'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Register Button */}
                            <button
                                type="submit"
                                disabled={loading || passwordStrength.score < 2 || password !== confirmPassword}
                                className="w-full py-3 px-4 bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-semibold rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed movie-glow"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                        Creating Account...
                                    </div>
                                ) : (
                                    'Create Account'
                                )}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="my-6 flex items-center">
                            <div className="flex-1 border-t border-gray-600"></div>
                            <span className="px-4 text-gray-400 text-sm">or</span>
                            <div className="flex-1 border-t border-gray-600"></div>
                        </div>

                        {/* Google Sign-In */}
                        <GoogleSignInButton disabled={loading} />

                        {/* Login Link */}
                        <div className="mt-8 text-center">
                            <p className="text-gray-300">
                                Already have an account?{' '}
                                <Link 
                                    to="/login" 
                                    className="text-green-400 hover:text-green-300 font-semibold transition-colors duration-300 hover:underline"
                                >
                                    Sign In
                                </Link>
                            </p>
                        </div>

                        {/* Features Preview */}
                        <div className="mt-6 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg">
                            <p className="text-blue-300 text-sm text-center mb-2">What you'll get:</p>
                            <div className="text-xs text-blue-200 text-center space-y-1">
                                <div>🎬 Discover thousands of movies</div>
                                <div>🤖 AI-powered movie insights</div>
                                <div>📚 Personal watchlist</div>
                                <div>⭐ Rate and review movies</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Register;
