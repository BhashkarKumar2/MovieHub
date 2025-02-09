import React, { createContext, useState, useContext, useEffect } from 'react';

// Create Auth Context
const AuthContext = createContext();

// Auth Provider Component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // user will hold user data and role

    const login = (userData) => {
        console.log("Logging in:", userData);
        if (userData) { // Ensure this updates the state only if userData is valid
            setUser(userData);
            localStorage.setItem("user", JSON.stringify(userData)); // Persist user
        } else {
            console.error("Invalid user data");
        }
    };

    const logout = () => {
        console.log("Logging out...");
        setUser(null);
        localStorage.removeItem("user");
    };

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []); // Correctly use useEffect here

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use Auth Context
export const useAuth = () => {
    return useContext(AuthContext);
};
