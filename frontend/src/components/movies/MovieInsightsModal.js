import React, { useState } from 'react';
import { movieApi } from '../../services/geminiMovieApi';

const MovieInsightsModal = ({ movie, isOpen, onClose }) => {
    const [insights, setInsights] = useState('');
    const [loading, setLoading] = useState(false);
    const [hasLoaded, setHasLoaded] = useState(false);

    const loadInsights = async () => {
        if (hasLoaded) return; // Don't reload if already loaded
        
        setLoading(true);
        try {
            const movieInsights = await movieApi.getMovieInsights(movie.id);
            setInsights(movieInsights);
            setHasLoaded(true);
        } catch (error) {
            console.error('Error loading movie insights:', error);
            setInsights('Unable to load insights at this time. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        if (isOpen && movie) {
            loadInsights();
        }
    }, [isOpen, movie]);

    const handleClose = () => {
        onClose();
    };

    if (!isOpen || !movie) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-lg max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-700">
                    <div className="flex items-center space-x-4">
                        {movie.poster && (
                            <img 
                                src={movie.poster} 
                                alt={movie.title}
                                className="w-16 h-24 object-cover rounded"
                            />
                        )}
                        <div>
                            <h2 className="text-2xl font-bold text-white">{movie.title}</h2>
                            <p className="text-gray-400">{movie.year} • {movie.rating}/10</p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-white transition-colors p-2"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                            <span className="ml-4 text-gray-400">Generating insights...</span>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-gray-800 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-white mb-2">Movie Overview</h3>
                                <p className="text-gray-300">{movie.overview}</p>
                            </div>
                            
                            <div className="bg-gray-800 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-white mb-2">AI-Generated Insights & Trivia</h3>
                                <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                                    {insights || 'No insights available.'}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-700 p-4 flex justify-end space-x-4">
                    {movie.trailer && (
                        <a
                            href={movie.trailer}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Watch Trailer
                        </a>
                    )}
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MovieInsightsModal;
