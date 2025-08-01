// TMDB-focused poster service
import axios from 'axios';

const TMDB_API_KEY = process.env.REACT_APP_TMDB_API_KEY;
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

export const getPosterUrl = async (movie) => {
    const { title, year, poster, id } = movie;
    
    // Use existing TMDB poster URL if available
    if (poster && poster.startsWith('https://image.tmdb.org')) {
        return poster;
    }
    
    // Construct TMDB poster URL if we have poster_path
    if (poster && poster.startsWith('/')) {
        return `${TMDB_IMAGE_BASE}/w500${poster}`;
    }
    
    // Generate a movie-themed image from Unsplash as fallback
    const movieKeywords = title.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(' ').slice(0, 3).join(',');
    const unsplashUrl = `https://source.unsplash.com/500x750/?movie,cinema,film,${movieKeywords}`;
    
    try {
        // Test if Unsplash URL is accessible
        await axios.head(unsplashUrl, { timeout: 3000 });
        return unsplashUrl;
    } catch (error) {
        // Final fallback: Custom placeholder
        const encodedTitle = encodeURIComponent(title.substring(0, 25));
        const displayYear = year || 'Unknown';
        return `https://via.placeholder.com/500x750/1a1a1a/ffffff?text=${encodedTitle}%20(${displayYear})`;
    }
};

export const getBackdropUrl = async (movie) => {
    const { title, year, backdrop, id } = movie;
    
    // Use existing backdrop URL if available
    if (backdrop && backdrop.startsWith('https://image.tmdb.org')) {
        return backdrop;
    }
    
    // Construct TMDB backdrop URL if we have backdrop_path
    if (backdrop && backdrop.startsWith('/')) {
        return `${TMDB_IMAGE_BASE}/w1280${backdrop}`;
    }
    
    // Fallback to a cinematic backdrop from Unsplash
    const movieKeywords = title.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(' ').slice(0, 2).join(',');
    return `https://source.unsplash.com/1920x1080/?cinema,movie,${movieKeywords},dark`;
};

export const preloadImage = (url) => {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
    });
};

const posterCache = new Map();

export const getCachedPoster = async (movie) => {
    const cacheKey = `${movie.id || movie.title}-${movie.year}`;
    
    if (posterCache.has(cacheKey)) {
        return posterCache.get(cacheKey);
    }
    
    const posterUrl = await getPosterUrl(movie);
    posterCache.set(cacheKey, posterUrl);
    
    return posterUrl;
};

export default {
    getPosterUrl,
    getBackdropUrl,
    preloadImage,
    getCachedPoster
};
