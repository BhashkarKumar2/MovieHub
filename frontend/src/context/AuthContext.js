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
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
    };

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        const storedToken = localStorage.getItem("token");
        
        if (storedUser && storedToken) {
            try {
                // Verify token is still valid (basic check)
                const payload = JSON.parse(atob(storedToken.split('.')[1]));
                const isExpired = payload.exp * 1000 < Date.now();
                
                if (!isExpired) {
                    setUser(JSON.parse(storedUser));
                } else {
                    // Token expired, clear storage
                    localStorage.removeItem("user");
                    localStorage.removeItem("token");
                    localStorage.removeItem("refreshToken");
                }
            } catch (error) {
                console.error("Error parsing stored token:", error);
                localStorage.removeItem("user");
                localStorage.removeItem("token");
                localStorage.removeItem("refreshToken");
            }
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
