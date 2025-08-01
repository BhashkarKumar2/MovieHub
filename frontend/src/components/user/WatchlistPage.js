import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { movieApi } from '../../services/geminiMovieApi';

const WatchlistPage = () => {
    const [watchlist, setWatchlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortBy, setSortBy] = useState('dateAdded'); // dateAdded, title, year, rating
    const [filterGenre, setFilterGenre] = useState('all');
    const navigate = useNavigate();

    useEffect(() => {
        loadWatchlist();
    }, []);

    const loadWatchlist = async () => {
        try {
            setLoading(true);
            const savedWatchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
            
            // Enhance watchlist items with additional movie details if needed
            const enhancedWatchlist = await Promise.all(
                savedWatchlist.map(async (movie) => {
                    // If movie doesn't have all details, fetch them
                    if (!movie.overview || !movie.genreNames || !movie.cast) {
                        try {
                            const fullDetails = await movieApi.getMovieDetails(movie.id || movie._id);
                            if (fullDetails) {
                                return {
                                    ...movie,
                                    ...fullDetails,
                                    dateAdded: movie.dateAdded || new Date().toISOString()
                                };
                            }
                        } catch (error) {
                            console.error(`Error fetching details for movie ${movie.title}:`, error);
                        }
                    }
                    return {
                        ...movie,
                        dateAdded: movie.dateAdded || new Date().toISOString()
                    };
                })
            );

            setWatchlist(enhancedWatchlist);
        } catch (error) {
            console.error('Error loading watchlist:', error);
            setError('Failed to load watchlist');
        } finally {
            setLoading(false);
        }
    };

    const removeFromWatchlist = (movieId) => {
        const updatedWatchlist = watchlist.filter((movie) => 
            (movie._id !== movieId) && (movie.id !== movieId)
        );
        setWatchlist(updatedWatchlist);
        localStorage.setItem("watchlist", JSON.stringify(updatedWatchlist));
    };

    const clearWatchlist = () => {
        if (window.confirm('Are you sure you want to clear your entire watchlist?')) {
            setWatchlist([]);
            localStorage.setItem("watchlist", JSON.stringify([]));
        }
    };

    const viewMovieDetails = (movieId) => {
        navigate(`/movie/${movieId}`);
    };

    const getSortedAndFilteredMovies = () => {
        let filtered = watchlist;

        // Filter by genre
        if (filterGenre !== 'all') {
            filtered = filtered.filter(movie => 
                movie.genreNames && movie.genreNames.some(genre => 
                    genre.toLowerCase().includes(filterGenre.toLowerCase())
                )
            );
        }

        // Sort movies
        const sorted = [...filtered].sort((a, b) => {
            switch (sortBy) {
                case 'title':
                    return a.title.localeCompare(b.title);
                case 'year':
                    return (b.year || 0) - (a.year || 0);
                case 'rating':
                    return (b.rating || 0) - (a.rating || 0);
                case 'dateAdded':
                default:
                    return new Date(b.dateAdded || 0) - new Date(a.dateAdded || 0);
            }
        });

        return sorted;
    };

    const getUniqueGenres = () => {
        const genres = new Set();
        watchlist.forEach(movie => {
            if (movie.genreNames) {
                movie.genreNames.forEach(genre => genres.add(genre));
            }
        });
        return Array.from(genres).sort();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
                    <h2 className="text-xl font-semibold text-white">Loading your watchlist...</h2>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-red-400 mb-4">Error Loading Watchlist</h2>
                    <p className="text-gray-300 mb-4">{error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    const sortedAndFilteredMovies = getSortedAndFilteredMovies();
    const uniqueGenres = getUniqueGenres();

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <div className="max-w-7xl mx-auto p-6">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-4xl font-bold text-green-400">My Watchlist</h1>
                        <Link 
                            to="/movies" 
                            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            ← Back to Movies
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="bg-gray-800 rounded-lg p-4 mb-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div>
                                <div className="text-2xl font-bold text-green-400">{watchlist.length}</div>
                                <div className="text-sm text-gray-400">Total Movies</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-blue-400">
                                    {Math.round(watchlist.reduce((sum, movie) => sum + (movie.runtime || 0), 0) / 60)}h
                                </div>
                                <div className="text-sm text-gray-400">Total Runtime</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-yellow-400">
                                    {watchlist.length > 0 ? (watchlist.reduce((sum, movie) => sum + (movie.rating || 0), 0) / watchlist.length).toFixed(1) : '0'}
                                </div>
                                <div className="text-sm text-gray-400">Avg Rating</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-purple-400">{uniqueGenres.length}</div>
                                <div className="text-sm text-gray-400">Genres</div>
                            </div>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
                        <div className="flex flex-wrap gap-4">
                            {/* Sort Options */}
                            <select 
                                value={sortBy} 
                                onChange={(e) => setSortBy(e.target.value)}
                                className="bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2"
                            >
                                <option value="dateAdded">Sort by Date Added</option>
                                <option value="title">Sort by Title</option>
                                <option value="year">Sort by Year</option>
                                <option value="rating">Sort by Rating</option>
                            </select>

                            {/* Genre Filter */}
                            <select 
                                value={filterGenre} 
                                onChange={(e) => setFilterGenre(e.target.value)}
                                className="bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2"
                            >
                                <option value="all">All Genres</option>
                                {uniqueGenres.map(genre => (
                                    <option key={genre} value={genre}>{genre}</option>
                                ))}
                            </select>
                        </div>

                        {/* Clear Watchlist */}
                        {watchlist.length > 0 && (
                            <button 
                                onClick={clearWatchlist}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                Clear All
                            </button>
                        )}
                    </div>
                </div>

                {/* Movies Grid */}
                {sortedAndFilteredMovies.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {sortedAndFilteredMovies.map((movie) => (
                            <div 
                                key={movie._id || movie.id} 
                                className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                            >
                                {/* Movie Poster */}
                                <div className="relative">
                                    <img 
                                        src={movie.poster || '/api/placeholder/300/450'} 
                                        alt={`${movie.title} Poster`} 
                                        className="w-full h-80 object-cover"
                                        onError={(e) => {
                                            e.target.src = '/api/placeholder/300/450';
                                        }}
                                    />
                                    <div className="absolute top-2 right-2">
                                        <span className="bg-yellow-500 text-black px-2 py-1 rounded-full text-sm font-bold">
                                            ⭐ {movie.rating ? movie.rating.toFixed(1) : 'N/A'}
                                        </span>
                                    </div>
                                </div>

                                {/* Movie Info */}
                                <div className="p-4">
                                    <h3 className="text-lg font-semibold mb-2 line-clamp-2 text-white">
                                        {movie.title}
                                    </h3>
                                    
                                    <div className="text-sm text-gray-400 mb-3">
                                        <div className="flex justify-between items-center mb-1">
                                            <span>{movie.year || 'Unknown'}</span>
                                            <span>{movie.runtime ? `${movie.runtime}min` : ''}</span>
                                        </div>
                                        {movie.genreNames && movie.genreNames.length > 0 && (
                                            <div className="text-xs text-gray-500">
                                                {movie.genreNames.slice(0, 3).join(', ')}
                                            </div>
                                        )}
                                    </div>

                                    {movie.overview && (
                                        <p className="text-sm text-gray-300 mb-4 line-clamp-3">
                                            {movie.overview}
                                        </p>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => viewMovieDetails(movie.id || movie._id)}
                                            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                                        >
                                            View Details
                                        </button>
                                        <button 
                                            onClick={() => removeFromWatchlist(movie._id || movie.id)}
                                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                                            title="Remove from Watchlist"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">🎬</div>
                        <h2 className="text-2xl font-semibold text-gray-400 mb-2">
                            {filterGenre !== 'all' ? 'No movies found in this genre' : 'Your watchlist is empty'}
                        </h2>
                        <p className="text-gray-500 mb-6">
                            {filterGenre !== 'all' 
                                ? 'Try selecting a different genre or clear the filter.' 
                                : 'Start adding movies to your watchlist to see them here!'
                            }
                        </p>
                        <Link 
                            to="/movies" 
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg inline-block transition-colors"
                        >
                            Discover Movies
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WatchlistPage;
