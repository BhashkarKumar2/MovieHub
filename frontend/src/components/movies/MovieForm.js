import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://localhost:5000/movies";

const MovieForm = ({ onSubmit, movies }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [movie, setMovie] = useState({ title: "", genre: "", year: "", poster: "", trailer: "", director: "" });

    useEffect(() => {
        if (id) {
            const existingMovie = movies.find((m) => m._id === id);
            if (existingMovie) setMovie(existingMovie);
        }
    }, [id, movies]);

    const handleChange = (e) => {
        setMovie({ ...movie, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Submitting movie data:", movie); // Log the movie data
        if (id) {
            await axios.put(`${API_URL}/${id}`, movie);
        } else {
            await axios.post(API_URL, movie);
        }
        navigate("/movies");
    };

    return ( 
         <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600">
            <form onSubmit={handleSubmit} className="max-w-lg w-full p-8 bg-white rounded-lg shadow-lg grid grid-cols-2 gap-4">
            
            <a href="/movies" className="text-red-500 hover:underline hover:text-blue-700 transition duration-200 ">Go to Movies Page</a>

                <h2 className="col-span-2 text-3xl font-bold mb-6 text-center text-blue-600">{id ? "Edit Movie" : "Add Movie"}</h2>
                {["title", "genre", "year", "poster", "trailer", "director"].map((field, index) => (
                    <div key={index} className="mb-4">
                        <label className="block text-gray-700 font-semibold mb-1" htmlFor={field}>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                        <input
                            type={field === "year" ? "number" : "text"}
                            name={field}
                            value={movie[field]}
                            onChange={handleChange}
                            placeholder={`Enter ${field.charAt(0).toUpperCase() + field.slice(1)}`}
                            required
                            className={`w-full p-3 border border-gray-300 rounded transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400`}
                        />
                    </div>
                ))}
                <button type="submit" className="col-span-2 w-full bg-green-500 text-white px-4 py-2 rounded hover:fade-in transition duration-200">{id ? "Update" : "Add"} Movie</button>
            </form>
        </div>
    );
};

export default MovieForm;
