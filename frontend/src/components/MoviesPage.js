import React, { useState, useEffect } from "react";
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import '../index.css';

const API_URL = "https://movie-list-4z2r.onrender.com/movies";
const MOVIES_PER_PAGE = 6; // Pagination limit

const MoviesPage = ({ movies, onEdit, onDelete }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState(""); 
    const [currentPage, setCurrentPage] = useState(1);
    const [watchlist, setWatchlist] = useState([]);
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem("darkMode") === "true";
    });
   




    useEffect(() => {
        const savedWatchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
        setWatchlist(savedWatchlist);
    }, []);

    useEffect(() => {
        localStorage.setItem("darkMode", darkMode);
    }, [darkMode]);

    const handleDelete = async (id) => {
        await axios.delete(`${API_URL}/${id}`);
        onDelete(id);
    };

    const handleLogout = () => {
        logout();
        navigate("/");
    };


    

    const toggleDarkMode = () => {
        setDarkMode((prevMode) => !prevMode);
    };

    const toggleWatchlist = (movie) => {
        let updatedWatchlist = [...watchlist];
        if (watchlist.some(m => m._id === movie._id)) {
            updatedWatchlist = watchlist.filter(m => m._id !== movie._id);
        } else {
            updatedWatchlist.push(movie);
        }
        setWatchlist(updatedWatchlist);
        localStorage.setItem("watchlist", JSON.stringify(updatedWatchlist));
    };

    const shareMovie = async (movie) => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: movie.title,
                    text: `Check out this movie: ${movie.title}!`,
                    url: window.location.href
                });
            } catch (error) {
                console.error("Error sharing:", error);
            }
        } else {
            alert("Sharing not supported on this device.");
        }
    };

    // Filter movies based on search query
    const filteredMovies = movies.filter((movie) =>
        movie.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Pagination logic
    const totalPages = Math.ceil(filteredMovies.length / MOVIES_PER_PAGE);
    const startIdx = (currentPage - 1) * MOVIES_PER_PAGE;
    const paginatedMovies = filteredMovies.slice(startIdx, startIdx + MOVIES_PER_PAGE);

    return (
        
        <div className={`${darkMode ? "bg-gray-900 text-white" : "bg-white"} relative max-w-6xl mt-10 mx-auto p-6 rounded-lg shadow-lg transition-colors duration-300`}>
            {/* Header Section */}
            <div className="flex justify-between items-center mb-4">
                <button onClick={toggleDarkMode} className="bg-gray-800 text-white px-3 py-2 rounded-md">
                    {darkMode ? "Light Mode" : "Dark Mode"}
                </button>
                <h2 className="text-4xl font-bold text-center text-red-500">Movies List</h2>
                <button onClick={handleLogout} className="bg-blue-300 text-red-700 hover:underline text-lg">
                    Logout
                </button>
            </div>

            {/* Search Bar */}
            <div className="flex justify-center mb-6">
                <input
                    type="text"
                    placeholder="Search for a movie..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
               

            {/* Watchlist Section */}
            <div className="mb-6">
                <h3 className="text-2xl font-semibold text-center text-green-500 mb-2">Your Watchlist</h3>
                {watchlist.length > 0 ? (
                    <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {watchlist.map((movie) => (
                            <li key={movie._id} className="border p-4 rounded-lg shadow-md bg-gray-100">
                                <h4 className="text-lg font-semibold text-center">{movie.title}</h4>
                                <img src={movie.poster} alt={`${movie.title} Poster`} className="w-32 h-48 object-cover mx-auto rounded mt-2" />
                                <button
                                    onClick={() => toggleWatchlist(movie)}
                                    className="mt-2 w-full bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
                                >
                                    Remove
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-center text-gray-500">Your watchlist is empty.</p>
                )}
            </div>


            {/* Add Movie Button for Admin */}
            {user && user.role === 'admin' && (
                <Link to="/movieform" className="text-blue-700 hover:underline mb-6 block text-center text-lg">
                    Add New Movie
                </Link>
            )}

            {/* Movie List */}
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 bg-white rounded-lg shadow-lg p-4">
                {paginatedMovies.length > 0 ? (
                    paginatedMovies.map((movie) => (
                        <li key={movie._id} className="mb-6">
                            <div className="border border-blue-300 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 w-full h-full flex flex-col items-center">
                                <Link to={`/movies/${movie._id}`}>
                                    <h3 className="text-2xl font-semibold text-gray-800 text-center mb-4">{movie.title}</h3>
                                </Link>
                               

                                <img src={movie.poster} alt={`${movie.title} Poster`} className="w-40 h-60 object-cover rounded mb-4" />
                                <p className="text-gray-700 text-center mb-2">Genre: {movie.genre}</p>
                                <p className="text-gray-700 text-center mb-4">Year: {movie.year}</p>
                                <a href={movie.trailer} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline mb-4">Watch Trailer</a>
                                
                                {/* Watchlist & Share Buttons */}
                                <div className="flex space-x-4">
                                    <button onClick={() => toggleWatchlist(movie)} className={`px-4 py-2 rounded ${watchlist.some(m => m._id === movie._id) ? "bg-red-500" : "bg-green-500"} text-white hover:opacity-80 transition`}>
                                        {watchlist.some(m => m._id === movie._id) ? "Remove from Watchlist" : "Add to Watchlist"}
                                    </button>
                                    <button onClick={() => shareMovie(movie)} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
                                        Share
                                    </button>
                                </div>

                                {/* Admin Controls */}
                                {user && user.role === 'admin' && (
                                    <div className="mt-4 flex justify-between w-full">
                                        <button onClick={() => onEdit(movie)} className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition duration-200">Edit</button>
                                        <button onClick={() => handleDelete(movie._id)} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition duration-200">Delete</button>
                                    </div>
                                )}
                                {user && user.role === 'customer' && (
                                        <button onClick={() => navigate('/payment')} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-200 ml-12">
                                            Pay Now
                                        </button>
                                    )}
                            </div>
                        </li>
                    ))
                ) : (
                    <p className="text-center text-gray-500 col-span-full">No movies found</p>
                )}
            </ul>

            {/* Pagination Controls */}
            <div className="flex justify-center space-x-4 mt-6">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)} className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50">
                    Prev
                </button>
                <span className="text-lg">{currentPage} / {totalPages}</span>
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)} className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50">
                    Next
                </button>
            </div>
        </div>
    );
};

export default MoviesPage;
