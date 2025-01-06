import React from 'react'
import Home from "./pages/Home/Home.jsx"
import {BrowserRouter as Router,Route,Routes} from "react-router-dom"
import Login from './pages/Login/Login.jsx';
import SignUp from './pages/SignUp/SignUp.jsx';


const routes = (
    <Router>
      <Routes>
        <Route path="/dashboard" exact element={<Home />} />
        <Route path="/login" exact element={<Login />} />
        <Route path="/signup" exact element={<SignUp />} />
      </Routes>
    </Router>
);


const App = () => {
  return (
    <div>
      {routes}
    </div>
  )
}

export default App