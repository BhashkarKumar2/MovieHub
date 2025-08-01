// Pure TMDB API + Gemini AI movie service
import axios from 'axios';

const TMDB_API_KEY = process.env.REACT_APP_TMDB_API_KEY || 'your_tmdb_api_key_here';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY || 'your_gemini_api_key_here';

// Try multiple Gemini model endpoints for better reliability
const GEMINI_ENDPOINTS = [
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-8b:generateContent'
];

console.log('[GeminiMovieAPI] Available endpoints:', GEMINI_ENDPOINTS.length);
console.log('[GeminiMovieAPI] Gemini API Key:', GEMINI_API_KEY ? 'CONFIGURED' : 'NOT CONFIGURED');

// Function to list all available Gemini models
const listAvailableModels = async () => {
    try {
        if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
            console.log('[GeminiMovieAPI] Cannot list models: API key not configured');
            return [];
        }

        console.log('[GeminiMovieAPI] Fetching available models...');
        const response = await axios.get(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 10000
            }
        );

        const models = response.data.models || [];
        console.log('[GeminiMovieAPI] Available models:', models.map(m => ({
            name: m.name,
            displayName: m.displayName,
            supportedGenerationMethods: m.supportedGenerationMethods
        })));

        // Filter models that support generateContent
        const contentModels = models.filter(model => 
            model.supportedGenerationMethods && 
            model.supportedGenerationMethods.includes('generateContent')
        );

        console.log('[GeminiMovieAPI] Models supporting generateContent:', contentModels.map(m => m.name));
        return contentModels;
    } catch (error) {
        console.error('[GeminiMovieAPI] Error listing models:', error);
        return [];
    }
};

// Call listAvailableModels on startup to see what's available
listAvailableModels();

// Helper method to call TMDB API
const callTMDBAPI = async (endpoint, params = {}) => {
    try {
        const response = await axios.get(`${TMDB_BASE_URL}${endpoint}`, {
            params: {
                api_key: TMDB_API_KEY,
                language: 'en-US',
                ...params
            }
        });
        return response.data;
    } catch (error) {
        console.error('TMDB API Error:', error);
        throw error;
    }
};

// Helper method to call Gemini API for movie insights with fallback endpoints
const callGeminiAPI = async (prompt, retryCount = 0) => {
    const maxRetries = GEMINI_ENDPOINTS.length;
    
    if (retryCount >= maxRetries) {
        throw new Error('All Gemini API endpoints failed');
    }

    try {
        // Check if API key is configured
        if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
            throw new Error('Gemini API key is not configured');
        }

        const currentEndpoint = GEMINI_ENDPOINTS[retryCount];
        console.log(`[GeminiMovieAPI] Trying endpoint ${retryCount + 1}/${maxRetries}:`, currentEndpoint);

        const response = await axios.post(
            `${currentEndpoint}?key=${GEMINI_API_KEY}`,
            {
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 30000 // 30 second timeout
            }
        );

        console.log('[GeminiMovieAPI] Success with endpoint:', currentEndpoint);
        console.log('[GeminiMovieAPI] Response status:', response.status);

        // Check if response has the expected structure
        if (!response.data || !response.data.candidates || !response.data.candidates[0]) {
            throw new Error('Invalid response structure from Gemini API');
        }

        const candidate = response.data.candidates[0];
        
        // Check for safety ratings or blocked content
        if (candidate.finishReason === 'SAFETY') {
            throw new Error('Content was blocked due to safety filters');
        }

        if (!candidate.content || !candidate.content.parts || !candidate.content.parts[0]) {
            throw new Error('No content in Gemini API response');
        }

        return candidate.content.parts[0].text;
    } catch (error) {
        console.error(`[GeminiMovieAPI] Endpoint ${retryCount + 1} failed:`, {
            endpoint: GEMINI_ENDPOINTS[retryCount],
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
        });

        // If this is a 503 or network error, try the next endpoint
        if (error.response?.status === 503 || error.code === 'ERR_BAD_RESPONSE' || error.code === 'ECONNABORTED') {
            console.log(`[GeminiMovieAPI] Retrying with next endpoint... (${retryCount + 1}/${maxRetries})`);
            return await callGeminiAPI(prompt, retryCount + 1);
        }

        // For other errors, don't retry
        throw error;
    }
};

// Transform TMDB movie data to our format
const transformTMDBMovie = (movie) => {
    return {
        id: movie.id,
        title: movie.title,
        originalTitle: movie.original_title,
        genre: movie.genre_ids || [],
        genreNames: movie.genres?.map(g => g.name) || [],
        year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
        poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
        backdrop: movie.backdrop_path ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}` : null,
        overview: movie.overview || 'No overview available.',
        rating: movie.vote_average || 0,
        voteCount: movie.vote_count || 0,
        popularity: movie.popularity || 0,
        language: movie.original_language,
        releaseDate: movie.release_date,
        adult: movie.adult || false,
        runtime: movie.runtime,
        budget: movie.budget,
        revenue: movie.revenue,
        homepage: movie.homepage,
        tagline: movie.tagline,
        status: movie.status,
        productionCompanies: movie.production_companies?.map(company => company.name) || [],
        productionCountries: movie.production_countries?.map(country => country.name) || [],
        spokenLanguages: movie.spoken_languages?.map(lang => lang.english_name) || []
    };
};

// Get movie details with cast and crew
const getMovieDetails = async (movieId) => {
    try {
        const [details, credits, videos] = await Promise.all([
            callTMDBAPI(`/movie/${movieId}`),
            callTMDBAPI(`/movie/${movieId}/credits`),
            callTMDBAPI(`/movie/${movieId}/videos`)
        ]);

        const trailer = videos.results.find(video => 
            video.type === 'Trailer' && video.site === 'YouTube'
        );

        const transformedMovie = transformTMDBMovie(details);
        
        return {
            ...transformedMovie,
            director: credits.crew.find(person => person.job === 'Director')?.name || 'Unknown',
            cast: credits.cast.slice(0, 10).map(actor => actor.name),
            trailer: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null,
            crew: credits.crew.filter(person => 
                ['Director', 'Producer', 'Writer', 'Cinematographer'].includes(person.job)
            ).map(person => ({ name: person.name, job: person.job }))
        };
    } catch (error) {
        console.error(`Error getting details for movie ${movieId}:`, error);
        return null;
    }
};

// Generate AI insights about a movie using Gemini
const generateMovieInsights = async (movieData) => {
    try {
        // Check if we have enough movie data
        if (!movieData || !movieData.title) {
            return 'Insufficient movie data to generate insights.';
        }

        const prompt = `Provide interesting insights and trivia about the movie "${movieData.title}" (${movieData.year}). 
        
        Movie Details:
        - Director: ${movieData.director || 'Unknown'}
        - Cast: ${movieData.cast?.join(', ') || 'Cast information not available'}
        - Genres: ${movieData.genreNames?.join(', ') || 'Genre information not available'}
        - Overview: ${movieData.overview || 'No overview available'}
        - Rating: ${movieData.rating || 'N/A'}/10 (${movieData.voteCount || 0} votes)
        - Budget: ${movieData.budget ? `$${movieData.budget.toLocaleString()}` : 'Budget information not available'}
        - Revenue: ${movieData.revenue ? `$${movieData.revenue.toLocaleString()}` : 'Revenue information not available'}
        - Runtime: ${movieData.runtime ? `${movieData.runtime} minutes` : 'Runtime not available'}
        
        Please provide interesting and engaging insights about this movie including:
        1. Behind-the-scenes trivia and production facts
        2. Cultural impact and significance
        3. Awards and critical recognition
        4. Fun facts about the cast and crew
        5. Box office performance analysis
        6. Technical achievements and innovations
        7. Legacy and influence on cinema
        8. Interesting connections to other films
        
        Format the response as engaging, informative content that movie enthusiasts would find fascinating. Make it conversational and include specific details. Keep the response under 1000 words.`;

        const response = await callGeminiAPI(prompt);
        
        // Validate the response
        if (!response || response.trim().length === 0) {
            throw new Error('Empty response from Gemini API');
        }

        return response;
    } catch (error) {
        console.error('Error generating movie insights:', error);
        
        // Provide a more informative fallback based on the error
        if (error.message.includes('API key')) {
            return `🤖 AI Insights Unavailable\n\nThe AI service requires proper API configuration. Please check the Gemini API key settings.\n\nIn the meantime, here's what we know about "${movieData?.title || 'this movie'}":\n\n📊 Rating: ${movieData?.rating || 'N/A'}/10\n🎭 Director: ${movieData?.director || 'Unknown'}\n📅 Year: ${movieData?.year || 'Unknown'}\n⏱️ Runtime: ${movieData?.runtime ? `${movieData.runtime} minutes` : 'Unknown'}\n\n${movieData?.overview || 'No description available.'}`;
        } else if (error.message.includes('Rate limit')) {
            return `🤖 AI Insights Temporarily Unavailable\n\nThe AI service is currently experiencing high demand. Please try again in a few minutes.\n\nHere are the basic details for "${movieData?.title || 'this movie'}":\n\n📊 Rating: ${movieData?.rating || 'N/A'}/10 (${movieData?.voteCount || 0} votes)\n🎭 Director: ${movieData?.director || 'Unknown'}\n👥 Cast: ${movieData?.cast?.slice(0, 5).join(', ') || 'Cast information not available'}\n📅 Release Year: ${movieData?.year || 'Unknown'}\n\n${movieData?.overview || 'No description available.'}`;
        } else if (error.message.includes('Network') || error.message.includes('timeout')) {
            return `🤖 AI Insights Connection Issue\n\nUnable to connect to the AI service right now. Please check your internet connection and try again.\n\nBasic movie information for "${movieData?.title || 'this movie'}":\n\n📊 TMDB Rating: ${movieData?.rating || 'N/A'}/10\n🎭 Directed by: ${movieData?.director || 'Unknown'}\n🎪 Genres: ${movieData?.genreNames?.join(', ') || 'Not specified'}\n📅 Released: ${movieData?.year || 'Unknown'}\n💰 Budget: ${movieData?.budget ? `$${movieData.budget.toLocaleString()}` : 'Not disclosed'}\n\n${movieData?.overview || 'No synopsis available.'}`;
        } else {
            return `🤖 AI Insights Currently Unavailable\n\nWe're experiencing technical difficulties with our AI service. Here's the available information about "${movieData?.title || 'this movie'}":\n\n⭐ Rating: ${movieData?.rating || 'N/A'}/10 from ${movieData?.voteCount || 0} users\n🎬 Director: ${movieData?.director || 'Not specified'}\n🎭 Main Cast: ${movieData?.cast?.slice(0, 5).join(', ') || 'Cast information unavailable'}\n📅 Release Year: ${movieData?.year || 'Unknown'}\n⏱️ Duration: ${movieData?.runtime ? `${movieData.runtime} minutes` : 'Not specified'}\n🏷️ Genres: ${movieData?.genreNames?.join(', ') || 'Not categorized'}\n\n📖 Synopsis:\n${movieData?.overview || 'No plot summary available for this movie.'}\n\nPlease try the AI insights feature again later when the service is restored.`;
        }
    }
};

export const movieApi = {
    // Get popular movies from TMDB
    getPopularMovies: async (page = 1) => {
        try {
            const data = await callTMDBAPI('/movie/popular', { page });
            return {
                movies: data.results.map(transformTMDBMovie),
                totalPages: Math.min(data.total_pages, 500), // TMDB limit
                currentPage: page,
                totalResults: data.total_results
            };
        } catch (error) {
            console.error('Error fetching popular movies:', error);
            return { movies: [], totalPages: 0, currentPage: 1, totalResults: 0 };
        }
    },

    // Get top-rated movies from TMDB
    getTopRatedMovies: async (page = 1) => {
        try {
            const data = await callTMDBAPI('/movie/top_rated', { page });
            return {
                movies: data.results.map(transformTMDBMovie),
                totalPages: Math.min(data.total_pages, 500),
                currentPage: page,
                totalResults: data.total_results
            };
        } catch (error) {
            console.error('Error fetching top-rated movies:', error);
            return { movies: [], totalPages: 0, currentPage: 1, totalResults: 0 };
        }
    },

    // Get now playing movies from TMDB
    getNowPlayingMovies: async (page = 1) => {
        try {
            const data = await callTMDBAPI('/movie/now_playing', { page });
            return {
                movies: data.results.map(transformTMDBMovie),
                totalPages: Math.min(data.total_pages, 500),
                currentPage: page,
                totalResults: data.total_results
            };
        } catch (error) {
            console.error('Error fetching now playing movies:', error);
            return { movies: [], totalPages: 0, currentPage: 1, totalResults: 0 };
        }
    },

    // Get upcoming movies from TMDB
    getUpcomingMovies: async (page = 1) => {
        try {
            const data = await callTMDBAPI('/movie/upcoming', { page });
            return {
                movies: data.results.map(transformTMDBMovie),
                totalPages: Math.min(data.total_pages, 500),
                currentPage: page,
                totalResults: data.total_results
            };
        } catch (error) {
            console.error('Error fetching upcoming movies:', error);
            return { movies: [], totalPages: 0, currentPage: 1, totalResults: 0 };
        }
    },

    // Get movies by genre from TMDB
    getMoviesByGenre: async (genreId, page = 1) => {
        try {
            const data = await callTMDBAPI('/discover/movie', { 
                with_genres: genreId, 
                page,
                sort_by: 'popularity.desc'
            });
            return {
                movies: data.results.map(transformTMDBMovie),
                totalPages: Math.min(data.total_pages, 500),
                currentPage: page,
                totalResults: data.total_results
            };
        } catch (error) {
            console.error(`Error fetching movies for genre ${genreId}:`, error);
            return { movies: [], totalPages: 0, currentPage: 1, totalResults: 0 };
        }
    },

    // Search for movies on TMDB
    searchMovies: async (query, page = 1) => {
        try {
            const data = await callTMDBAPI('/search/movie', { 
                query: encodeURIComponent(query), 
                page 
            });
            return {
                movies: data.results.map(transformTMDBMovie),
                totalPages: Math.min(data.total_pages, 500),
                currentPage: page,
                totalResults: data.total_results
            };
        } catch (error) {
            console.error(`Error searching movies for "${query}":`, error);
            return { movies: [], totalPages: 0, currentPage: 1, totalResults: 0 };
        }
    },

    // Get detailed information about a specific movie
    getMovieDetails: async (movieId) => {
        return await getMovieDetails(movieId);
    },

    // Get AI-generated insights about a movie
    getMovieInsights: async (movieId) => {
        try {
            console.log(`Fetching insights for movie ID: ${movieId}`);
            
            const movieDetails = await getMovieDetails(movieId);
            if (!movieDetails) {
                return 'Movie details could not be retrieved from TMDB. Please try again or select a different movie.';
            }
            
            console.log(`Movie details retrieved for: ${movieDetails.title}`);
            return await generateMovieInsights(movieDetails);
        } catch (error) {
            console.error(`Error getting insights for movie ${movieId}:`, error);
            return `🤖 AI Insights Error\n\nSorry, we encountered an issue while generating insights for this movie. This could be due to:\n\n• API configuration issues\n• Network connectivity problems\n• Service temporarily unavailable\n\nPlease try again in a few moments. If the problem persists, the AI service might be experiencing technical difficulties.\n\nError details: ${error.message || 'Unknown error occurred'}`;
        }
    },

    // Get available genres from TMDB
    getGenres: async () => {
        try {
            const data = await callTMDBAPI('/genre/movie/list');
            return data.genres;
        } catch (error) {
            console.error('Error fetching genres:', error);
            return [];
        }
    },

    // Get trending movies (daily/weekly)
    getTrendingMovies: async (timeWindow = 'day', page = 1) => {
        try {
            const data = await callTMDBAPI(`/trending/movie/${timeWindow}`, { page });
            return {
                movies: data.results.map(transformTMDBMovie),
                totalPages: Math.min(data.total_pages, 500),
                currentPage: page,
                totalResults: data.total_results
            };
        } catch (error) {
            console.error(`Error fetching trending movies (${timeWindow}):`, error);
            return { movies: [], totalPages: 0, currentPage: 1, totalResults: 0 };
        }
    },

    // Get movies by year
    getMoviesByYear: async (year, page = 1) => {
        try {
            const data = await callTMDBAPI('/discover/movie', { 
                primary_release_year: year, 
                page,
                sort_by: 'popularity.desc'
            });
            return {
                movies: data.results.map(transformTMDBMovie),
                totalPages: Math.min(data.total_pages, 500),
                currentPage: page,
                totalResults: data.total_results
            };
        } catch (error) {
            console.error(`Error fetching movies for year ${year}:`, error);
            return { movies: [], totalPages: 0, currentPage: 1, totalResults: 0 };
        }
    },

    // Get similar movies
    getSimilarMovies: async (movieId, page = 1) => {
        try {
            const data = await callTMDBAPI(`/movie/${movieId}/similar`, { page });
            return {
                movies: data.results.map(transformTMDBMovie),
                totalPages: Math.min(data.total_pages, 500),
                currentPage: page,
                totalResults: data.total_results
            };
        } catch (error) {
            console.error(`Error fetching similar movies for ${movieId}:`, error);
            return { movies: [], totalPages: 0, currentPage: 1, totalResults: 0 };
        }
    },

    // Get movie recommendations
    getMovieRecommendations: async (movieId, page = 1) => {
        try {
            const data = await callTMDBAPI(`/movie/${movieId}/recommendations`, { page });
            return {
                movies: data.results.map(transformTMDBMovie),
                totalPages: Math.min(data.total_pages, 500),
                currentPage: page,
                totalResults: data.total_results
            };
        } catch (error) {
            console.error(`Error fetching recommendations for movie ${movieId}:`, error);
            return { movies: [], totalPages: 0, currentPage: 1, totalResults: 0 };
        }
    },

    // List available Gemini models
    listGeminiModels: async () => {
        return await listAvailableModels();
    }
};

// Configuration helpers
export const isAPIConfigured = () => {
    const tmdbConfigured = TMDB_API_KEY && TMDB_API_KEY !== 'your_tmdb_api_key_here';
    const geminiConfigured = GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key_here';
    
    console.log('API Configuration Status:', {
        tmdb: tmdbConfigured,
        gemini: geminiConfigured,
        tmdbKey: TMDB_API_KEY ? `${TMDB_API_KEY.substring(0, 8)}...` : 'Not set',
        geminiKey: GEMINI_API_KEY ? `${GEMINI_API_KEY.substring(0, 8)}...` : 'Not set'
    });
    
    return {
        tmdb: tmdbConfigured,
        gemini: geminiConfigured,
        both: tmdbConfigured && geminiConfigured
    };
};

// Debug function to test API connections
export const testAPIConnections = async () => {
    const results = {
        tmdb: { status: 'unknown', message: '' },
        gemini: { status: 'unknown', message: '' }
    };

    // Test TMDB API
    try {
        const tmdbTest = await callTMDBAPI('/movie/popular', { page: 1 });
        if (tmdbTest && tmdbTest.results && tmdbTest.results.length > 0) {
            results.tmdb = { status: 'success', message: 'TMDB API is working correctly' };
        } else {
            results.tmdb = { status: 'error', message: 'TMDB API returned empty results' };
        }
    } catch (error) {
        results.tmdb = { status: 'error', message: `TMDB API Error: ${error.message}` };
    }

    // Test Gemini API
    try {
        const geminiTest = await callGeminiAPI('Test message: Respond with "API test successful"');
        if (geminiTest && geminiTest.includes('API test successful')) {
            results.gemini = { status: 'success', message: 'Gemini API is working correctly' };
        } else {
            results.gemini = { status: 'success', message: 'Gemini API responded (test message may have been modified)' };
        }
    } catch (error) {
        results.gemini = { status: 'error', message: `Gemini API Error: ${error.message}` };
    }

    return results;
};

// TMDB Genre mapping
export const TMDB_GENRES = {
    28: 'Action',
    12: 'Adventure',
    16: 'Animation',
    35: 'Comedy',
    80: 'Crime',
    99: 'Documentary',
    18: 'Drama',
    10751: 'Family',
    14: 'Fantasy',
    36: 'History',
    27: 'Horror',
    10402: 'Music',
    9648: 'Mystery',
    10749: 'Romance',
    878: 'Science Fiction',
    10770: 'TV Movie',
    53: 'Thriller',
    10752: 'War',
    37: 'Western'
};

export default movieApi;
