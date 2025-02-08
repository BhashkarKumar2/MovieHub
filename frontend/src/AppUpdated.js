import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import MoviesPage from './components/MoviesPage';
import MovieForm from './components/MovieForm';
import Login from './components/Login';
import PrivateRoute from './components/PrivateRoute';

const AppUpdated = () => {
    return (
        <AuthProvider>
            <Router>
                <Switch>
                    <Route path="/" exact component={Login} />
                    <Route path="/movies" component={MoviesPage} />
                    <PrivateRoute path="/movieform" component={MovieForm} />
                </Switch>
            </Router>
        </AuthProvider>
    );
};

export default AppUpdated;
