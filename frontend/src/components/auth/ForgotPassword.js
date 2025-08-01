import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            const response = await axios.post(
                `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/forgot-password`,
                { email }
            );

            if (response.data.success) {
                setMessage(response.data.message);
                setSubmitted(true);
                
                // In development, show the reset token
                if (process.env.NODE_ENV === 'development' && response.data.resetToken) {
                    setMessage(prev => prev + ` (Dev Mode - Token: ${response.data.resetToken})`);
                }
            } else {
                setError('Failed to send password reset email. Please try again.');
            }
        } catch (error) {
            console.error('Forgot password error:', error);
            setError(
                error.response?.data?.message || 
                'An error occurred while requesting password reset. Please try again.'
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
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-2">Reset Password</h2>
                        <p className="text-gray-300">
                            {submitted 
                                ? "Check your email for reset instructions" 
                                : "Enter your email to receive a password reset link"
                            }
                        </p>
                    </div>

                    {!submitted ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Email Input */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                        </svg>
                                    </div>
                                    <input
                                        id="email"
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-600 bg-gray-700/50 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        placeholder="Enter your email address"
                                        disabled={loading}
                                    />
                                </div>
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

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading || !email}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Sending Reset Link...
                                    </>
                                ) : (
                                    'Send Reset Link'
                                )}
                            </button>
                        </form>
                    ) : (
                        <div className="text-center space-y-6">
                            {/* Success Icon */}
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full">
                                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>

                            {/* Success Message */}
                            {message && (
                                <div className="bg-green-500/20 border border-green-500/50 text-green-200 px-4 py-3 rounded-lg">
                                    {message}
                                </div>
                            )}

                            <div className="text-gray-300 text-sm space-y-2">
                                <p>📧 We've sent a password reset link to your email</p>
                                <p>⏰ The link will expire in 10 minutes</p>
                                <p>📥 Check your spam folder if you don't see it</p>
                            </div>

                            {/* Resend Button */}
                            <button
                                onClick={() => {
                                    setSubmitted(false);
                                    setMessage('');
                                    setError('');
                                }}
                                className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                            >
                                Send another reset link
                            </button>
                        </div>
                    )}

                    {/* Footer Links */}
                    <div className="mt-8 text-center space-y-2">
                        <Link 
                            to="/login"
                            className="block text-gray-300 hover:text-white transition-colors"
                        >
                            ← Back to Login
                        </Link>
                        <p className="text-gray-400 text-sm">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium">
                                Sign up
                            </Link>
                        </p>
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

export default ForgotPassword;
