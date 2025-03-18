import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const WatchlistPage = () => {
    const [watchlist, setWatchlist] = useState([]);

    useEffect(() => {
        const savedWatchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
        setWatchlist(savedWatchlist);
    }, []);

    const removeFromWatchlist = (id) => {
        const updatedWatchlist = watchlist.filter((movie) => movie._id !== id);
        setWatchlist(updatedWatchlist);
        localStorage.setItem("watchlist", JSON.stringify(updatedWatchlist));
    };

    return (
        <div className="max-w-6xl mt-10 mx-auto p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-4xl font-bold text-center mb-6 text-red-500">My Watchlist</h2>
            
            <Link to="/" className="text-blue-700 hover:underline block text-center mb-6">
                Back to Movies
            </Link>

            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {watchlist.length > 0 ? (
                    watchlist.map((movie) => (
                        <li key={movie._id} className="mb-6">
                            <div className="bg-white border border-blue-300 rounded-lg p-6 shadow-lg flex flex-col items-center">
                                <h3 className="text-2xl font-semibold text-gray-800 text-center mb-4">{movie.title}</h3>
                                <img src={movie.poster} alt={`${movie.title} Poster`} className="w-40 h-60 object-cover rounded mb-4" />
                                <button 
                                    onClick={() => removeFromWatchlist(movie._id)} 
                                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-200"
                                >
                                    Remove from Watchlist
                                </button>
                            </div>
                        </li>
                    ))
                ) : (
                    <p className="text-center text-gray-500 col-span-full">Your watchlist is empty</p>
                )}
            </ul>
        </div>
    );
};

export default WatchlistPage;
