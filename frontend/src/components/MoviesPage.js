import React from "react";
import { useAuth } from '../context/AuthContext'; // Import the useAuth hook
import { Link } from "react-router-dom";
import axios from "axios";
import '../index.css'; // Importing the main CSS file with Tailwind

const API_URL = "http://localhost:5000/movies";

const MoviesPage = ({ movies, onEdit, onDelete }) => {
    const { user } = useAuth(); // Access user data from context

    const handleDelete = async (id) => {
        await axios.delete(`${API_URL}/${id}`);
        onDelete(id);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-200 to-gray-400 p-6">
            <div className="max-w-6xl mt-10 mx-auto p-6 bg-white rounded-lg shadow-lg">
                <h2 className="text-4xl font-bold text-center mb-8 text-purple-900">Movies List</h2>
                {user && user.role === 'admin' && (
                    <Link to="/add-movie" className="text-blue-700 hover:underline mb-6 block text-center text-lg">Add New Movie</Link>
                )}

                <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {movies.map((movie) => (
                        <li key={movie._id} className="mb-6">
                            <div className="bg-white border border-blue-300 bg-teal-500 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 w-full h-full flex flex-col items-center">
                                <h3 className="text-2xl font-semibold text-gray-800 text-center mb-4">{movie.title}</h3>
                                <img src={movie.poster} alt={`${movie.title} Poster`} className="w-40 h-60 object-cover rounded mb-4" />
                                <p className="text-gray-700 text-center mb-2">Genre: {movie.genre}</p>
                                <p className="text-gray-700 text-center mb-4">Year: {movie.year}</p>
                                <a href={movie.trailer} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline mb-4">Watch Trailer</a>
                                <div className="mt-4 flex justify-between w-full">
                                    {user && user.role === 'admin' && (
                                        <>
                                            <button onClick={() => onEdit(movie)} className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition duration-200">Edit</button>
                                            <button onClick={() => handleDelete(movie._id)} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition duration-200">Delete</button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default MoviesPage;
