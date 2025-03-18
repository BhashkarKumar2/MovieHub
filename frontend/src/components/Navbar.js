import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ onSearch }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        onSearch(e.target.value); // Call the onSearch function passed as a prop
    };

    const handleLogoClick = () => {
        navigate('/movies'); // Navigate to the movies page when logo is clicked
    };

    return (
        <nav className="navbar">
            <div className="logo" onClick={handleLogoClick}>
                Movie Management
            </div>
            <input
                type="text"
                placeholder="Search movies..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="search-bar"
            />
        </nav>
    );
};

export default Navbar;
