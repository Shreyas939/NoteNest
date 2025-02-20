import React, { useState, useEffect, createContext } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home/Home.jsx';
import Login from './pages/Login/Login.jsx';
import SignUp from './pages/SignUp/SignUp.jsx';
import Navbar from './components/Navbar/Navbar';
import './App.css';

export const ThemeContext = createContext();

const App = () => {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className={`app ${theme}`}>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/dashboard" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/" element={<Login />} />
          </Routes>
        </Router>
      </div>
    </ThemeContext.Provider>
  );
};

export default App;
