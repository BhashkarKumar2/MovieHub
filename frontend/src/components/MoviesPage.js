import React from "react";
import { useAuth } from '../context/AuthContext'; // Import the useAuth hook
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import '../index.css'; // Importing the main CSS file with Tailwind

const API_URL = "http://localhost:5000/movies";

const MoviesPage = ({ movies, onEdit, onDelete }) => {
    const { user, logout } = useAuth(); // Access user data from context
    const navigate = useNavigate();

    const handleDelete = async (id) => {
        await axios.delete(`${API_URL}/${id}`);
        onDelete(id);
    };

    const handleLogout = () => {
        logout(); // Logic to clear user session
        navigate("/"); // Redirect to login page
    };

    return (
        

            <div className="max-w-6xl mt-10 mx-auto p-6 bg-white rounded-lg shadow-lg">
                <h2 className="text-4xl font-bold text-center mb-8 text-red-500">Movies List</h2>

                {user && user.role === 'admin' && (
                    <Link to="/movieform" className="text-blue-700 hover:underline mb-6 block text-center text-lg">Add New Movie</Link>
                )}

                <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 bg-white rounded-lg shadow-lg p-4">

                    {movies.map((movie) => (
                        <li key={movie._id} className="mb-6">
                                <div className="bg-white border border-blue-300 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 w-full h-full flex flex-col items-center">

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
                <button onClick={handleLogout} className="text-red-700 hover:underline mb-6 block text-center text-lg">Logout</button>
            </div>
        
    );
};

export default MoviesPage;
