import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { movieApi } from '../../services/geminiMovieApi';

const MovieDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [movie, setMovie] = useState(null);
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(true);
    const [insightsLoading, setInsightsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [watchlist, setWatchlist] = useState([]);

    useEffect(() => {
        loadMovieDetails();
        loadWatchlist();
    }, [id]);

    const loadMovieDetails = async () => {
        try {
            setLoading(true);
            const movieDetails = await movieApi.getMovieDetails(id);
            if (movieDetails) {
                setMovie(movieDetails);
            } else {
                setError('Movie not found');
            }
        } catch (error) {
            console.error('Error loading movie details:', error);
            setError('Failed to load movie details');
        } finally {
            setLoading(false);
        }
    };

    const loadWatchlist = () => {
        const savedWatchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
        setWatchlist(savedWatchlist);
    };

    const loadInsights = async () => {
        if (!movie || insights) return;
        
        try {
            setInsightsLoading(true);
            const movieInsights = await movieApi.getMovieInsights(id);
            setInsights(movieInsights);
        } catch (error) {
            console.error('Error loading insights:', error);
            setInsights('Failed to load AI insights for this movie.');
        } finally {
            setInsightsLoading(false);
        }
    };

    const toggleWatchlist = () => {
        let updatedWatchlist = [...watchlist];
        const existingIndex = watchlist.findIndex(m => (m.id === movie.id) || (m._id === movie.id));
        
        if (existingIndex !== -1) {
            // Remove from watchlist
            updatedWatchlist.splice(existingIndex, 1);
        } else {
            // Add to watchlist with dateAdded
            const movieWithDate = {
                ...movie,
                dateAdded: new Date().toISOString()
            };
            updatedWatchlist.push(movieWithDate);
        }
        
        setWatchlist(updatedWatchlist);
        localStorage.setItem('watchlist', JSON.stringify(updatedWatchlist));
    };

    const isInWatchlist = () => {
        return watchlist.some(m => (m.id === movie?.id) || (m._id === movie?.id));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
                    <h2 className="text-xl font-semibold text-white">Loading movie details...</h2>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-red-400 mb-4">Error</h2>
                    <p className="text-gray-300 mb-4">{error}</p>
                    <button 
                        onClick={() => navigate('/movies')}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                    >
                        Back to Movies
                    </button>
                </div>
            </div>
        );
    }

    if (!movie) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-400">Movie not found</h2>
                    <button 
                        onClick={() => navigate('/movies')}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg mt-4"
                    >
                        Back to Movies
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Hero Section */}
            <div className="relative">
                {movie.backdrop && (
                    <div className="absolute inset-0">
                        <img 
                            src={movie.backdrop} 
                            alt={movie.title}
                            className="w-full h-full object-cover opacity-30"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent"></div>
                    </div>
                )}
                
                <div className="relative max-w-7xl mx-auto px-6 py-16">
                    <button 
                        onClick={() => navigate('/movies')}
                        className="mb-6 bg-gray-800/80 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        ← Back to Movies
                    </button>

                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Movie Poster */}
                        <div className="lg:w-1/3">
                            <img 
                                src={movie.poster || '/api/placeholder/400/600'} 
                                alt={movie.title}
                                className="w-full max-w-md mx-auto lg:mx-0 rounded-lg shadow-2xl"
                                onError={(e) => {
                                    e.target.src = '/api/placeholder/400/600';
                                }}
                            />
                        </div>

                        {/* Movie Info */}
                        <div className="lg:w-2/3">
                            <h1 className="text-4xl font-bold mb-4">{movie.title}</h1>
                            
                            {movie.originalTitle && movie.originalTitle !== movie.title && (
                                <p className="text-xl text-gray-400 mb-4">({movie.originalTitle})</p>
                            )}

                            <div className="flex flex-wrap gap-4 mb-6">
                                <span className="bg-yellow-500 text-black px-3 py-1 rounded-full font-bold">
                                    ⭐ {movie.rating ? movie.rating.toFixed(1) : 'N/A'}
                                </span>
                                <span className="bg-gray-700 px-3 py-1 rounded-full">
                                    {movie.year || 'Unknown Year'}
                                </span>
                                {movie.runtime && (
                                    <span className="bg-gray-700 px-3 py-1 rounded-full">
                                        {movie.runtime} min
                                    </span>
                                )}
                            </div>

                            {movie.genreNames && movie.genreNames.length > 0 && (
                                <div className="mb-6">
                                    <div className="flex flex-wrap gap-2">
                                        {movie.genreNames.map(genre => (
                                            <span key={genre} className="bg-green-600 px-3 py-1 rounded-full text-sm">
                                                {genre}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {movie.tagline && (
                                <p className="text-xl italic text-gray-300 mb-6">"{movie.tagline}"</p>
                            )}

                            <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                                {movie.overview || 'No overview available.'}
                            </p>

                            {/* Action Buttons */}
                            <div className="flex gap-4 mb-8">
                                <button 
                                    onClick={toggleWatchlist}
                                    className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                                        isInWatchlist() 
                                            ? 'bg-red-600 hover:bg-red-700 text-white' 
                                            : 'bg-green-600 hover:bg-green-700 text-white'
                                    }`}
                                >
                                    {isInWatchlist() ? 'Remove from Watchlist' : 'Add to Watchlist'}
                                </button>
                                
                                <button 
                                    onClick={loadInsights}
                                    disabled={insightsLoading}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                                >
                                    {insightsLoading ? 'Loading...' : 'Get AI Insights'}
                                </button>

                                {movie.trailer && (
                                    <a 
                                        href={movie.trailer} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                                    >
                                        Watch Trailer
                                    </a>
                                )}
                            </div>

                            {/* Additional Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {movie.director && (
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">Director</h3>
                                        <p className="text-gray-300">{movie.director}</p>
                                    </div>
                                )}

                                {movie.cast && movie.cast.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">Cast</h3>
                                        <p className="text-gray-300">{movie.cast.slice(0, 5).join(', ')}</p>
                                    </div>
                                )}

                                {movie.budget && (
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">Budget</h3>
                                        <p className="text-gray-300">${movie.budget.toLocaleString()}</p>
                                    </div>
                                )}

                                {movie.revenue && (
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">Revenue</h3>
                                        <p className="text-gray-300">${movie.revenue.toLocaleString()}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Insights Section */}
            {insights && (
                <div className="max-w-7xl mx-auto px-6 py-16">
                    <h2 className="text-3xl font-bold mb-6">🤖 AI Insights</h2>
                    <div className="bg-gray-800 rounded-lg p-6">
                        <pre className="whitespace-pre-wrap text-gray-300 leading-relaxed">
                            {insights}
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MovieDetailsPage;
