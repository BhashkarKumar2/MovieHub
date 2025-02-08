import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('customer'); // State for user role
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Reset error message
        try {
            // Send registration data to the backend, including the role
            const response = await axios.post('http://localhost:5000/register', { username, password, role });
            // If registration is successful, log the user in
            login(response.data);
            navigate('/login'); // Redirect to the login page after successful registration
        } catch (error) {
            setError("Error registering user: " + (error.response?.data?.message || "Unknown error"));
            console.error("Error registering user:", error);
        }
    };

    const isPasswordStrong = (password) => {
        return password.length >= 6; // Simple strength check
    };

    return (
        <div className="max-w-md mx-auto p-4">
            <h2 className="text-2xl font-bold text-center mb-4">Register</h2>
            {error && <p className="text-red-500">{error}</p>}
            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
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
                        className="border border-gray-300 rounded w-full p-2"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="border border-gray-300 rounded w-full p-2"
                        required
                    />
                    {!isPasswordStrong(password) && <p className="text-red-500">Password must be at least 6 characters long.</p>}
                </div>
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Register</button>
            </form>
        </div>
    );
};

export default Register;
