import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [token, setToken] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const urlToken = searchParams.get('token');
        if (urlToken) {
            setToken(urlToken);
        }
    }, [searchParams]);

    const checkPasswordStrength = (password) => {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        return strength;
    };

    const handlePasswordChange = (e) => {
        const newPassword = e.target.value;
        setPassword(newPassword);
        setPasswordStrength(checkPasswordStrength(newPassword));
    };

    const getStrengthColor = (strength) => {
        switch (strength) {
            case 0:
            case 1: return 'bg-red-500';
            case 2: return 'bg-orange-500';
            case 3: return 'bg-yellow-500';
            case 4: return 'bg-blue-500';
            case 5: return 'bg-green-500';
            default: return 'bg-gray-300';
        }
    };

    const getStrengthText = (strength) => {
        switch (strength) {
            case 0:
            case 1: return 'Very Weak';
            case 2: return 'Weak';
            case 3: return 'Fair';
            case 4: return 'Good';
            case 5: return 'Strong';
            default: return '';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        // Validation
        if (!token) {
            setError('Reset token is missing. Please use the link from your email.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters long.');
            return;
        }

        if (passwordStrength < 3) {
            setError('Password is too weak. Please include uppercase, lowercase, numbers, and special characters.');
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(
                `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/reset-password`,
                { 
                    token, 
                    newPassword: password 
                }
            );

            if (response.data.success) {
                setMessage('Password reset successfully! Redirecting to login...');
                setTimeout(() => {
                    navigate('/login?message=password-reset-success');
                }, 2000);
            } else {
                setError(response.data.message || 'Failed to reset password.');
            }
        } catch (error) {
            console.error('Reset password error:', error);
            setError(
                error.response?.data?.message || 
                'An error occurred while resetting password. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900 px-4">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="particles-container absolute inset-0"></div>
            </div>

            <div className="relative z-10 max-w-md w-full">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full mb-4">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-2">Create New Password</h2>
                        <p className="text-gray-300">Enter your new password below</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Token Input (if not from URL) */}
                        {!token && (
                            <div>
                                <label htmlFor="token" className="block text-sm font-medium text-gray-200 mb-2">
                                    Reset Token
                                </label>
                                <input
                                    id="token"
                                    type="text"
                                    required
                                    value={token}
                                    onChange={(e) => setToken(e.target.value)}
                                    className="block w-full px-3 py-3 border border-gray-600 bg-gray-700/50 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                    placeholder="Enter reset token from email"
                                />
                            </div>
                        )}

                        {/* New Password Input */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-2">
                                New Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={handlePasswordChange}
                                    className="block w-full pr-10 px-3 py-3 border border-gray-600 bg-gray-700/50 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                    placeholder="Enter new password"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200"
                                >
                                    {showPassword ? (
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                        </svg>
                                    ) : (
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            
                            {/* Password Strength Indicator */}
                            {password && (
                                <div className="mt-2">
                                    <div className="flex space-x-1 mb-1">
                                        {[1, 2, 3, 4, 5].map((level) => (
                                            <div
                                                key={level}
                                                className={`h-2 flex-1 rounded ${
                                                    level <= passwordStrength 
                                                        ? getStrengthColor(passwordStrength)
                                                        : 'bg-gray-600'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                    <p className={`text-xs ${
                                        passwordStrength < 3 ? 'text-red-400' : 
                                        passwordStrength < 5 ? 'text-yellow-400' : 'text-green-400'
                                    }`}>
                                        Password strength: {getStrengthText(passwordStrength)}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password Input */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-200 mb-2">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="block w-full pr-10 px-3 py-3 border border-gray-600 bg-gray-700/50 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                    placeholder="Confirm new password"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200"
                                >
                                    {showConfirmPassword ? (
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                        </svg>
                                    ) : (
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {confirmPassword && password !== confirmPassword && (
                                <p className="text-red-400 text-xs mt-1">Passwords do not match</p>
                            )}
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg">
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {error}
                                </div>
                            </div>
                        )}

                        {/* Success Message */}
                        {message && (
                            <div className="bg-green-500/20 border border-green-500/50 text-green-200 px-4 py-3 rounded-lg">
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    {message}
                                </div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || !password || !confirmPassword || password !== confirmPassword || passwordStrength < 3}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Resetting Password...
                                </>
                            ) : (
                                'Reset Password'
                            )}
                        </button>
                    </form>

                    {/* Footer Links */}
                    <div className="mt-8 text-center">
                        <Link 
                            to="/login"
                            className="text-gray-300 hover:text-white transition-colors"
                        >
                            ← Back to Login
                        </Link>
                    </div>
                </div>
            </div>

            {/* Particles Animation CSS */}
            <style jsx>{`
                @keyframes float {
                    0% { transform: translateY(0px) translateX(0px); opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { transform: translateY(-100vh) translateX(20px); opacity: 0; }
                }
                .particles-container {
                    overflow: hidden;
                }
            `}</style>
        </div>
    );
};

export default ResetPassword;
