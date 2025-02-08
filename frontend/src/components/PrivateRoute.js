import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Custom Private Route Component
const PrivateRoute = ({ component: Component, ...rest }) => {
    const { user } = useAuth();

    return (
        <Route
            {...rest}
            render={props =>
                user && user.role === 'admin' ? ( // Check if user is admin
                    <Component {...props} />
                ) : (
                    <Redirect to="/" /> // Redirect to home if not authorized
                )
            }
        />
    );
};

export default PrivateRoute;
