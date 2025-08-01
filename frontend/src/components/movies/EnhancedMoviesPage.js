import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { movieApi, isAPIConfigured, TMDB_GENRES } from '../../services/geminiMovieApi';
import MovieCard from './MovieCard';

const EnhancedMoviesPage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    
    // State management
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedGenre, setSelectedGenre] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('popular');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [genres, setGenres] = useState([]);
    const [watchlist, setWatchlist] = useState([]);
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem('darkMode') === 'true';
    });

    // Check API configuration
    const apiConfig = isAPIConfigured();

    // Load watchlist from localStorage
    useEffect(() => {
        const savedWatchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
        setWatchlist(savedWatchlist);
    }, []);

    // Save dark mode preference
    useEffect(() => {
        localStorage.setItem('darkMode', darkMode);
    }, [darkMode]);

    // Load genres on component mount
    useEffect(() => {
        const loadGenres = async () => {
            if (!apiConfig.tmdb) return;
            
            try {
                const genreList = await movieApi.getGenres();
                setGenres(genreList);
            } catch (error) {
                console.error('Error loading genres:', error);
            }
        };

        loadGenres();
    }, [apiConfig.tmdb]);

    // Load movies based on current filters
    useEffect(() => {
        loadMovies();
    }, [selectedCategory, selectedGenre, currentPage, searchQuery, apiConfig.tmdb]);

    const loadMovies = async () => {
        if (!apiConfig.tmdb) {
            setError('TMDB API is not configured. Please check your API keys.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            let result;

            if (searchQuery.trim()) {
                // Search for movies
                result = await movieApi.searchMovies(searchQuery, currentPage);
            } else if (selectedGenre) {
                // Get movies by genre
                result = await movieApi.getMoviesByGenre(selectedGenre, currentPage);
            } else {
                // Get movies by category
                switch (selectedCategory) {
                    case 'top_rated':
                        result = await movieApi.getTopRatedMovies(currentPage);
                        break;
                    case 'now_playing':
                        result = await movieApi.getNowPlayingMovies(currentPage);
                        break;
                    case 'upcoming':
                        result = await movieApi.getUpcomingMovies(currentPage);
                        break;
                    case 'trending':
                        result = await movieApi.getTrendingMovies('day', currentPage);
                        break;
                    default:
                        result = await movieApi.getPopularMovies(currentPage);
                }
            }

            setMovies(result.movies);
            setTotalPages(result.totalPages);
        } catch (error) {
            console.error('Error loading movies:', error);
            setError('Failed to load movies. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
        setSelectedGenre('');
        setCurrentPage(1);
        setSearchQuery('');
    };

    const handleGenreChange = (genreId) => {
        setSelectedGenre(genreId);
        setSelectedCategory('');
        setCurrentPage(1);
        setSearchQuery('');
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
        setSelectedCategory('');
        setSelectedGenre('');
        setCurrentPage(1);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleAddToWatchlist = (movie) => {
        let updatedWatchlist = [...watchlist];
        const existingIndex = watchlist.findIndex(m => m.id === movie.id);
        
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

    const isInWatchlist = (movieId) => {
        return watchlist.some(movie => movie.id === movieId);
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const getPaginationNumbers = () => {
        const delta = 2;
        const range = [];
        const rangeWithDots = [];

        for (let i = Math.max(2, currentPage - delta); 
             i <= Math.min(totalPages - 1, currentPage + delta); 
             i++) {
            range.push(i);
        }

        if (currentPage - delta > 2) {
            rangeWithDots.push(1, '...');
        } else {
            rangeWithDots.push(1);
        }

        rangeWithDots.push(...range);

        if (currentPage + delta < totalPages - 1) {
            rangeWithDots.push('...', totalPages);
        } else {
            rangeWithDots.push(totalPages);
        }

        return rangeWithDots;
    };

    if (!apiConfig.tmdb) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center text-white">
                    <h2 className="text-2xl font-bold mb-4">API Configuration Required</h2>
                    <p className="text-gray-300 mb-4">
                        Please configure your TMDB API key in the environment variables.
                    </p>
                    <p className="text-sm text-gray-400">
                        Add REACT_APP_TMDB_API_KEY to your .env file
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen transition-colors duration-300 ${
            darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'
        }`}>
            {/* Header */}
            <header className={`sticky top-0 z-50 ${
                darkMode ? 'bg-gray-800' : 'bg-white'
            } shadow-lg`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <h1 className="text-2xl md:text-3xl font-bold text-blue-500">
                            🎬 MovieHub
                        </h1>
                        
                        <div className="flex items-center space-x-4">
                            <Link
                                to="/watchlist"
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                                    darkMode 
                                        ? 'bg-gray-700 hover:bg-gray-600 text-green-400' 
                                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                }`}
                            >
                                <span>📋</span>
                                <span>Watchlist ({watchlist.length})</span>
                            </Link>
                            
                            <button
                                onClick={() => setDarkMode(!darkMode)}
                                className={`p-2 rounded-lg transition-colors ${
                                    darkMode 
                                        ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' 
                                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                }`}
                            >
                                {darkMode ? '🌞' : '🌙'}
                            </button>
                            
                            <span className="text-sm">
                                Welcome, {user?.username || 'User'}!
                            </span>
                            
                            <button
                                onClick={handleLogout}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Search and Filters */}
                <div className="mb-8 space-y-4">
                    {/* Search Bar */}
                    <div className="flex justify-center">
                        <div className="w-full max-w-md">
                            <input
                                type="text"
                                placeholder="Search for movies..."
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    darkMode 
                                        ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                                        : 'bg-white border-gray-300 text-gray-900'
                                }`}
                            />
                        </div>
                    </div>

                    {/* Category Filters */}
                    <div className="flex flex-wrap justify-center gap-2">
                        {[
                            { key: 'popular', label: '🔥 Popular' },
                            { key: 'top_rated', label: '⭐ Top Rated' },
                            { key: 'now_playing', label: '🎭 Now Playing' },
                            { key: 'upcoming', label: '🚀 Upcoming' },
                            { key: 'trending', label: '📈 Trending' }
                        ].map(category => (
                            <button
                                key={category.key}
                                onClick={() => handleCategoryChange(category.key)}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    selectedCategory === category.key
                                        ? 'bg-blue-600 text-white'
                                        : darkMode
                                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                            : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                {category.label}
                            </button>
                        ))}
                    </div>

                    {/* Genre Filters */}
                    <div className="flex flex-wrap justify-center gap-2">
                        {genres.slice(0, 10).map(genre => (
                            <button
                                key={genre.id}
                                onClick={() => handleGenreChange(genre.id)}
                                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                    selectedGenre === genre.id
                                        ? 'bg-green-600 text-white'
                                        : darkMode
                                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                {genre.name}
                            </button>
                        ))}
                    </div>
                </div>


                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                        <span className="ml-3 text-lg">Loading movies...</span>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="flex justify-center items-center py-12">
                        <div className="text-center">
                            <p className="text-red-500 text-lg mb-4">{error}</p>
                            <button
                                onClick={loadMovies}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                )}

                {/* Movies Grid */}
                {!loading && !error && (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6 mb-8">
                            {movies.map(movie => (
                                <MovieCard
                                    key={movie.id}
                                    movie={movie}
                                    onAddToWatchlist={handleAddToWatchlist}
                                    isInWatchlist={isInWatchlist(movie.id)}
                                />
                            ))}
                        </div>

                        {/* No Results */}
                        {movies.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-xl mb-4">No movies found</p>
                                <p className="text-gray-500">
                                    Try adjusting your search or filters
                                </p>
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center space-x-2">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                        currentPage === 1
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            : darkMode
                                                ? 'bg-gray-700 text-white hover:bg-gray-600'
                                                : 'bg-white text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    Previous
                                </button>

                                {getPaginationNumbers().map((page, index) => (
                                    <button
                                        key={index}
                                        onClick={() => typeof page === 'number' && handlePageChange(page)}
                                        disabled={typeof page !== 'number'}
                                        className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                                            page === currentPage
                                                ? 'bg-blue-600 text-white'
                                                : typeof page === 'number'
                                                    ? darkMode
                                                        ? 'bg-gray-700 text-white hover:bg-gray-600'
                                                        : 'bg-white text-gray-700 hover:bg-gray-100'
                                                    : 'text-gray-500 cursor-default'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                        currentPage === totalPages
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            : darkMode
                                                ? 'bg-gray-700 text-white hover:bg-gray-600'
                                                : 'bg-white text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* API Status Footer */}
            <footer className={`mt-12 py-4 text-center text-sm ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
                <div className="flex justify-center items-center space-x-4">
                    <span className={`flex items-center ${apiConfig.tmdb ? 'text-green-500' : 'text-red-500'}`}>
                        <span className={`w-2 h-2 rounded-full mr-2 ${apiConfig.tmdb ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        TMDB API
                    </span>
                    <span className={`flex items-center ${apiConfig.gemini ? 'text-green-500' : 'text-yellow-500'}`}>
                        <span className={`w-2 h-2 rounded-full mr-2 ${apiConfig.gemini ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                        Gemini AI
                    </span>
                </div>
            </footer>
        </div>
    );
};

export default EnhancedMoviesPage;
