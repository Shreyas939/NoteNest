import React, { useState } from 'react';
import ProfileInfo from '../Cards/ProfileInfo';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../SearchBar/SearchBar';
import { useAuth } from '../../context/AuthContext'; // Import AuthContext

const Navbar = ({ userInfo, onSearchNote, handleClearSearch, hideSearch }) => {

  const { isAuthenticated, setIsAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');


  const navigate = useNavigate();

  const onLogout = () => {
    localStorage.clear()
    setIsAuthenticated(false); // Update the auth state
    navigate('/login');
  };

  const handleSearch = () => {
    if(searchQuery){
      onSearchNote(searchQuery)
    }
  };

  const onClearSearch = () => {
    setSearchQuery('');
    handleClearSearch()
  };


  return (
   <div className="flex items-center justify-between px-6 py-2 bg-white drop-shadow">
    <h2 className="py-2 text-xl font-medium text-black">Notes</h2> 

    {isAuthenticated && !hideSearch && (
      <SearchBar 
        value={searchQuery} 
        onChange={({ target }) => {
          setSearchQuery(target.value);
        }}
        handleSearch={handleSearch}
        onClearSearch={onClearSearch}
      />
    )}

    {isAuthenticated && <ProfileInfo userInfo={userInfo} onLogout={onLogout} />}
    </div>  
  );
};

export default Navbar;