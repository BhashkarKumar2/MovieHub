import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext'; // Import useAuth for authentication context
import { useNavigate } from 'react-router-dom'; // Import useNavigate from react-router-dom
import axios from 'axios'; // Import axios for API calls

const Login = () => {
    const [error, setError] = useState(''); // State for error messages
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('customer'); // State for user role
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(''); // Reset error message
        try {
            const response = await axios.post('http://localhost:5000/login', { username, password, role });
            // Successful login logic
            localStorage.setItem('token', response.data.token); // Store token in local storage
            if (role === 'admin') {
                navigate('/movieform'); // Redirect admin to MovieForm page
            } else {
                navigate('/movies'); // Redirect customer to MoviesPage
            }

        } catch (error) {
            console.error("Login failed:", error);
            setError("Login failed: " + (error.response?.data?.message || "Unknown error")); // Set error message
        }
    };

    return (
        <div className="max-w-md mx-auto p-4">
            <h2 className="text-2xl font-bold text-center mb-4 text-blue-600">Login</h2>
            {error && <p className="text-red-500">{error}</p>} 

            <form onSubmit={handleLogin} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                <div className="mb-4">
                    <label className="block text-gray-700">Role</label>
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="border border-gray-300 rounded w-full p-2"
                    >
                        <option value="customer">Customer</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="border border-gray-300 rounded w-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="border border-gray-300 rounded w-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200">Login</button>
            </form>
            <p className="text-center">
                Don't have an account? <a href="/register" className="text-blue-500">Register here</a>
            </p>
        </div>
    );
};

export default Login;
