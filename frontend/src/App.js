import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, useNavigate } from "react-router-dom";
import axios from "axios";
import MovieForm from "./components/MovieForm";
import MoviesPage from "./components/MoviesPage";
import Login from "./components/Login"; // Importing the Login component
import Register from "./components/Register"; // Importing the Register component
import { AuthProvider } from "./context/AuthContext"; // Importing AuthProvider

const API_URL = "http://localhost:5000/movies";

const App = () => {
    const [movies, setMovies] = useState([]);
    const navigate = useNavigate();

    // Fetch movies from MongoDB
    useEffect(() => {
        axios.get(API_URL)
            .then((response) => setMovies(response.data))
            .catch((error) => console.error("Error fetching movies:", error));
    }, []);

    // Handle movie addition or update
    const addOrUpdateMovie = async (movie, isEdit) => {
        if (isEdit) {
            const response = await axios.put(`${API_URL}/${movie._id}`, movie);
            setMovies(movies.map((m) => (m._id === movie._id ? response.data : m)));
        } else {
            const response = await axios.post(API_URL, movie);
            setMovies([...movies, response.data]);
        }
    };

    // Handle movie deletion
    const deleteMovie = (id) => {
        setMovies(movies.filter((movie) => movie._id !== id));
    };

    // Navigate to edit movie page
    const handleEdit = (movie) => {
        navigate(`/edit-movie/${movie._id}`);
    };

    return (
        <AuthProvider> {/* Wrapping App with AuthProvider */}
            <Routes>
                <Route path="/" element={<Login />} /> {/* Updated to render Login component */}
                <Route path="/register" element={<Register />} /> {/* Adding the registration route */}
                <Route path="/edit-movie/:id" element={<MovieForm onSubmit={addOrUpdateMovie} movies={movies} />} />
                <Route path="/movieform" element={<MovieForm onSubmit={addOrUpdateMovie} />} /> {/* Added route for MovieForm */}

                <Route path="/movies" element={<MoviesPage movies={movies} onEdit={handleEdit} onDelete={deleteMovie} />} />
                <Route path="/login" element={<Login />} />
            </Routes>
        </AuthProvider>
    );
};

const AppWrapper = () => {
    return (
        <Router>
            <App />
        </Router>
    );
};

export default AppWrapper;
