import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const WelcomePage = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);

    const heroSlides = [
        {
            title: "Discover Movies Like Never Before",
            subtitle: "AI-powered insights, personalized recommendations, and unlimited entertainment",
            emoji: "🎬",
            gradient: "from-purple-600 via-pink-600 to-red-500"
        },
        {
            title: "Build Your Ultimate Watchlist",
            subtitle: "Create, organize, and share your favorite movies with fellow cinema enthusiasts",
            emoji: "📚",
            gradient: "from-blue-600 via-teal-500 to-green-500"
        },
        {
            title: "Get Smart Movie Insights",
            subtitle: "Powered by AI, get fascinating trivia and deep analysis of your favorite films",
            emoji: "🤖",
            gradient: "from-yellow-500 via-orange-500 to-red-500"
        }
    ];

    useEffect(() => {
        setIsLoaded(true);
        const slideInterval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
        }, 4000);

        return () => clearInterval(slideInterval);
    }, [heroSlides.length]);

    // Create floating particles
    useEffect(() => {
        const createParticle = () => {
            const particle = document.createElement('div');
            particle.className = 'floating-particle';
            particle.style.cssText = `
                position: absolute;
                width: ${Math.random() * 4 + 2}px;
                height: ${Math.random() * 4 + 2}px;
                background: rgba(251, 191, 36, ${Math.random() * 0.8 + 0.2});
                pointer-events: none;
                border-radius: 50%;
                left: ${Math.random() * 100}vw;
                animation: floatUp ${6 + Math.random() * 4}s linear infinite;
                top: 100vh;
            `;
            document.querySelector('.particles-bg')?.appendChild(particle);
            
            setTimeout(() => {
                particle.remove();
            }, 10000);
        };

        const particleInterval = setInterval(createParticle, 300);
        return () => clearInterval(particleInterval);
    }, []);

    return (
        <>
            <style jsx>{`
                @keyframes floatUp {
                    0% { 
                        transform: translateY(0px) translateX(0px) rotate(0deg); 
                        opacity: 0; 
                    }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { 
                        transform: translateY(-100vh) translateX(${Math.random() * 200 - 100}px) rotate(360deg); 
                        opacity: 0; 
                    }
                }
                @keyframes slideIn {
                    0% { transform: translateX(-100px); opacity: 0; }
                    100% { transform: translateX(0); opacity: 1; }
                }
                @keyframes fadeInUp {
                    0% { transform: translateY(30px); opacity: 0; }
                    100% { transform: translateY(0); opacity: 1; }
                }
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
                .hero-bg {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    background-size: 400% 400%;
                    animation: gradientShift 8s ease infinite;
                }
                @keyframes gradientShift {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                .slide-in {
                    animation: slideIn 1s ease-out;
                }
                .fade-in-up {
                    animation: fadeInUp 1s ease-out;
                }
                .pulse-animation {
                    animation: pulse 2s ease-in-out infinite;
                }
            `}</style>

            <div className="min-h-screen hero-bg relative overflow-hidden">
                {/* Floating particles background */}
                <div className="particles-bg absolute inset-0 pointer-events-none"></div>

                {/* Navigation Header */}
                <nav className="relative z-10 flex justify-between items-center p-6 bg-black/20 backdrop-blur-sm">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-red-500 rounded-full flex items-center justify-center">
                            <span className="text-xl">🎬</span>
                        </div>
                        <h1 className="text-2xl font-bold text-white">MovieHub</h1>
                    </div>
                    <div className="flex space-x-4">
                        <Link 
                            to="/login" 
                            className="px-6 py-2 bg-white/20 text-white rounded-lg backdrop-blur-sm hover:bg-white/30 transition-all duration-300"
                        >
                            Sign In
                        </Link>
                        <Link 
                            to="/register" 
                            className="px-6 py-2 bg-gradient-to-r from-yellow-400 to-red-500 text-white rounded-lg hover:from-yellow-500 hover:to-red-600 transition-all duration-300 font-semibold"
                        >
                            Get Started
                        </Link>
                    </div>
                </nav>

                {/* Hero Section */}
                <div className="relative z-10 flex items-center justify-center min-h-screen px-6">
                    <div className="text-center max-w-4xl mx-auto">
                        {/* Animated Hero Content */}
                        <div className={`transition-all duration-1000 ${isLoaded ? 'slide-in' : 'opacity-0'}`}>
                            <div className="text-8xl mb-6 pulse-animation">
                                {heroSlides[currentSlide].emoji}
                            </div>
                            <h1 className={`text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r ${heroSlides[currentSlide].gradient} bg-clip-text text-transparent`}>
                                {heroSlides[currentSlide].title}
                            </h1>
                            <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
                                {heroSlides[currentSlide].subtitle}
                            </p>
                        </div>

                        {/* CTA Buttons */}
                        <div className={`flex flex-col sm:flex-row gap-6 justify-center items-center ${isLoaded ? 'fade-in-up' : 'opacity-0'}`} style={{animationDelay: '0.5s'}}>
                            <Link 
                                to="/register" 
                                className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-red-500 text-white text-lg font-bold rounded-full hover:from-yellow-500 hover:to-red-600 transform hover:scale-105 transition-all duration-300 shadow-2xl"
                            >
                                🚀 Start Your Journey
                            </Link>
                            <Link 
                                to="/login" 
                                className="px-8 py-4 bg-white/20 text-white text-lg font-semibold rounded-full backdrop-blur-sm hover:bg-white/30 transform hover:scale-105 transition-all duration-300"
                            >
                                👋 Welcome Back
                            </Link>
                        </div>

                        {/* Slide Indicators */}
                        <div className="flex justify-center space-x-3 mt-12">
                            {heroSlides.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentSlide(index)}
                                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                        index === currentSlide 
                                            ? 'bg-white scale-125' 
                                            : 'bg-white/50 hover:bg-white/70'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Features Preview Section */}
                <div className="relative z-10 bg-black/30 backdrop-blur-sm py-20">
                    <div className="max-w-6xl mx-auto px-6">
                        <h2 className="text-4xl font-bold text-center text-white mb-16">
                            Why Choose MovieHub?
                        </h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: "🎬",
                                    title: "Vast Movie Database",
                                    description: "Access thousands of movies with detailed information, ratings, and reviews from TMDB"
                                },
                                {
                                    icon: "🤖",
                                    title: "AI-Powered Insights",
                                    description: "Get fascinating trivia, analysis, and recommendations powered by advanced AI"
                                },
                                {
                                    icon: "📚",
                                    title: "Personal Watchlist",
                                    description: "Create and manage your custom watchlist, track what you've watched"
                                }
                            ].map((feature, index) => (
                                <div 
                                    key={index}
                                    className="text-center p-8 bg-white/10 rounded-2xl backdrop-blur-sm hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
                                >
                                    <div className="text-6xl mb-4">{feature.icon}</div>
                                    <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                                    <p className="text-white/80 leading-relaxed">{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="relative z-10 bg-black/50 backdrop-blur-sm py-8">
                    <div className="max-w-6xl mx-auto px-6 text-center">
                        <div className="flex items-center justify-center space-x-3 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-red-500 rounded-full flex items-center justify-center">
                                <span className="text-lg">🎬</span>
                            </div>
                            <span className="text-xl font-bold text-white">MovieHub</span>
                        </div>
                        <p className="text-white/60">
                            Discover, explore, and enjoy the world of cinema like never before.
                        </p>
                        <div className="mt-4 flex justify-center space-x-6 text-white/60">
                            <span>🎯 Smart Recommendations</span>
                            <span>🔒 Secure & Private</span>
                            <span>📱 Mobile Friendly</span>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
};

export default WelcomePage;
