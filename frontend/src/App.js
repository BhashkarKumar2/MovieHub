import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, useNavigate } from "react-router-dom";
import axios from "axios";
import MovieForm from "./components/movies/MovieForm";
import PaymentPage from "./components/user/PaymentPage";
import MoviesPage from "./components/movies/MoviesPage";
import EnhancedMoviesPage from "./components/movies/EnhancedMoviesPage";
import MovieDetailsPage from "./components/movies/MovieDetailsPage";
import WelcomePage from "./components/common/WelcomePage"; // Import the welcome page
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import ForgotPassword from "./components/auth/ForgotPassword";
import ResetPassword from "./components/auth/ResetPassword";
import GoogleAuthSuccess from "./components/auth/GoogleAuthSuccess";
import { AuthProvider } from "./context/AuthContext";
import WatchlistPage from "./components/user/WatchlistPage";

const API_URL = "http://localhost:5000/movies";

const App = () => {
    const [movies, setMovies] = useState([]);
    const navigate = useNavigate();

    // Fetch movies from MongoDB (keeping for backward compatibility)
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
            {console.log("AuthProvider is wrapping the app")}
            <Routes>
                <Route path="/" element={<WelcomePage />} /> {/* Welcome page as default */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/google-auth-success" element={<GoogleAuthSuccess />} />
                <Route path="/edit-movie/:id" element={<MovieForm onSubmit={addOrUpdateMovie} movies={movies} />} />
                <Route path="/movieform" element={<MovieForm onSubmit={addOrUpdateMovie} />} />
                
                {/* Use the new enhanced movies page as primary */}
                <Route path="/movies" element={<EnhancedMoviesPage />} />
                <Route path="/movie/:id" element={<MovieDetailsPage />} />
                <Route path="/movies-classic" element={<MoviesPage movies={movies} onEdit={handleEdit} onDelete={deleteMovie} />} />
                
                <Route path="/payment" element={<PaymentPage />} />
                <Route path="/watchlist" element={<WatchlistPage />} />
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
