import React, { useState, useEffect } from 'react';
import MovieInsightsModal from './MovieInsightsModal';
import { TMDB_GENRES } from '../../services/geminiMovieApi';
import { preloadImage } from '../../services/posterService';

const MovieCard = ({ movie, onAddToWatchlist, isInWatchlist = false }) => {
    const [showInsights, setShowInsights] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);
    const [finalPosterUrl, setFinalPosterUrl] = useState(null);

    // Enhanced image loading with fallbacks
    useEffect(() => {
        const loadPoster = async () => {
            setImageLoading(true);
            
            // Try the primary poster URL
            if (movie.poster) {
                const isValid = await preloadImage(movie.poster);
                if (isValid) {
                    setFinalPosterUrl(movie.poster);
                    setImageLoading(false);
                    return;
                }
            }
            
            // Fallback to a movie-themed image
            const fallbackUrl = `https://source.unsplash.com/500x750/?movie,cinema,${encodeURIComponent(movie.title.substring(0, 20))}`;
            const isFallbackValid = await preloadImage(fallbackUrl);
            
            if (isFallbackValid) {
                setFinalPosterUrl(fallbackUrl);
            } else {
                // Ultimate fallback
                const encodedTitle = encodeURIComponent(movie.title.substring(0, 15));
                const year = movie.year || 'Unknown';
                setFinalPosterUrl(`https://via.placeholder.com/500x750/1a1a1a/ffffff?text=${encodedTitle}+(${year})`);
            }
            
            setImageLoading(false);
        };

        loadPoster();
    }, [movie.poster, movie.title, movie.year]);

    const handleImageError = () => {
        setImageError(true);
        // Try one more fallback
        const encodedTitle = encodeURIComponent(movie.title.substring(0, 15));
        const year = movie.year || 'Unknown';
        setFinalPosterUrl(`https://via.placeholder.com/500x750/2a2a2a/ffffff?text=${encodedTitle}+(${year})`);
    };

    const getGenreNames = (genres) => {
        if (!genres) return [];
        
        // TMDB returns genres as an array of IDs or as genreNames array
        if (Array.isArray(genres)) {
            // If it's an array of genre names (from detailed API call)
            if (typeof genres[0] === 'string') {
                return genres;
            }
            // If it's an array of genre IDs, map them to names
            return genres.map(genreId => TMDB_GENRES[genreId] || 'Unknown').filter(Boolean);
        }
        
        return [];
    };

    const formatRating = (rating) => {
        return rating ? parseFloat(rating).toFixed(1) : 'N/A';
    };

    return (
        <>
            <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                {/* Movie Poster */}
                <div className="relative aspect-[2/3] overflow-hidden bg-gray-700">
                    {imageLoading ? (
                        <div className="w-full h-full flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        </div>
                    ) : (
                        <img
                            src={finalPosterUrl}
                            alt={movie.title}
                            className="w-full h-full object-cover transition-opacity duration-300"
                            onError={handleImageError}
                            loading="lazy"
                        />
                    )}
                    
                    {/* Rating Badge */}
                    <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-yellow-400 px-2 py-1 rounded-lg text-sm font-bold">
                        ⭐ {formatRating(movie.rating)}
                    </div>

                    {/* Year Badge */}
                    {movie.year && (
                        <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded-lg text-sm font-bold">
                            {movie.year}
                        </div>
                    )}

                    {/* TMDB ID Badge */}
                    {movie.id && typeof movie.id === 'number' && (
                        <div className="absolute bottom-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">
                            TMDB
                        </div>
                    )}
                </div>

                {/* Movie Information */}
                <div className="p-4">
                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 hover:line-clamp-none transition-all">
                        {movie.title}
                    </h3>
                    
                    {/* Genres */}
                    <div className="flex flex-wrap gap-1 mb-3">
                        {getGenreNames(movie.genreNames || movie.genre).slice(0, 2).map((genre, index) => (
                            <span
                                key={index}
                                className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs"
                            >
                                {genre}
                            </span>
                        ))}
                    </div>

                    {/* Overview */}
                    <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                        {movie.overview || 'No description available.'}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-col space-y-2">
                        <button
                            onClick={() => setShowInsights(true)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors duration-200 font-medium"
                        >
                            🤖 Know More with AI
                        </button>
                        
                        <button
                            onClick={() => onAddToWatchlist && onAddToWatchlist(movie)}
                            className={`w-full py-2 px-4 rounded-lg transition-colors duration-200 font-medium ${
                                isInWatchlist
                                    ? 'bg-green-600 hover:bg-green-700 text-white'
                                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                            }`}
                        >
                            {isInWatchlist ? '✓ In Watchlist' : '+ Add to Watchlist'}
                        </button>
                    </div>

                    {/* Additional Info */}
                    <div className="mt-3 flex justify-between text-xs text-gray-400">
                        <span>👥 {movie.voteCount ? `${movie.voteCount} votes` : 'No votes'}</span>
                        <span>🔥 {movie.popularity ? Math.round(movie.popularity) : 'N/A'}</span>
                    </div>
                </div>
            </div>

            {/* Movie Insights Modal */}
            <MovieInsightsModal
                movie={movie}
                isOpen={showInsights}
                onClose={() => setShowInsights(false)}
            />
        </>
    );
};

export default MovieCard;
