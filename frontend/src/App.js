import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './Dashboard';
import Login from './Login';
import Signup from './Signup';
import TodoList from './TodoList';
import Events from './Events';
import Achievements from './Achievements';
import './App.css';

function Navigation() {
  const location = useLocation();
  
  return (
    <nav>
      <ul>
        <li><Link to="/" className={location.pathname === '/' ? 'active' : ''}>Dashboard</Link></li>
        <li><Link to="/login" className={location.pathname === '/login' ? 'active' : ''}>Login</Link></li>
        <li><Link to="/signup" className={location.pathname === '/signup' ? 'active' : ''}>Sign Up</Link></li>
        <li><Link to="/todos" className={location.pathname === '/todos' ? 'active' : ''}>Todo List</Link></li>
        <li><Link to="/events" className={location.pathname === '/events' ? 'active' : ''}>Events</Link></li>
        <li><Link to="/achievements" className={location.pathname === '/achievements' ? 'active' : ''}>Achievements</Link></li>
      </ul>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="App">
        {/* Background Shapes */}
        <svg className="bg-shape bg-shape1" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path fill="#4f8cff" d="M45.3,-63.3C59.9,-52.8,73.5,-39.8,79.8,-24.8C86.1,-9.8,85.1,7.2,83.1,23.5C81.1,39.8,78.1,55.4,68.9,65.8C59.7,76.2,44.3,81.4,29.2,85.8C14.1,90.2,-0.8,93.8,-15.7,91.4C-30.6,89,-45.5,80.6,-56.8,69.2C-68.1,57.8,-75.8,43.4,-79.8,28.2C-83.8,13,-84.1,-3,-82.8,-18.8C-81.5,-34.6,-78.6,-49.2,-70.8,-59.2C-63,-69.2,-50.3,-74.6,-37.1,-79.8C-23.9,-85,-11.9,-90,-0.3,-89.6C11.3,-89.2,22.6,-83.4,30.7,-75.8C38.8,-68.2,43.7,-58.8,45.3,-63.3Z" transform="translate(100 100)" />
        </svg>
        <svg className="bg-shape bg-shape2" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path fill="#7c5fe6" d="M42.8,-58.9C56.9,-48.9,70.8,-36.9,76.8,-22.8C82.8,-8.7,80.9,7.5,78.5,23.1C76.1,38.7,73.2,53.7,65.1,65.2C57,76.7,43.7,84.7,29.2,89.2C14.7,93.7,-1,93.7,-16.7,91.7C-32.4,89.7,-48.1,85.7,-59.8,76.2C-71.5,66.7,-79.2,51.7,-83.8,36.2C-88.4,20.7,-89.9,4.7,-88.9,-10.8C-87.9,-26.3,-84.4,-41.3,-77.1,-53.3C-69.8,-65.3,-58.7,-74.3,-45.8,-80.3C-32.9,-86.3,-18.2,-89.3,-4.6,-83.7C9,-78.1,18,-64,28.8,-52.8C39.6,-41.6,52.2,-33.3,42.8,-58.9Z" transform="translate(100 100)" />
        </svg>
        
        <Navigation />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/todos" element={<TodoList />} />
          <Route path="/events" element={<Events />} />
          <Route path="/achievements" element={<Achievements />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
