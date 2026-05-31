import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import EmployeeList from './components/Employees/EmployeeList';
import ProjectList from './components/Projects/ProjectList';
import Dashboard from './components/Dashboard/Dashboard';
import MyAssignments from './components/Assignments/MyAssignments';
import Navbar from './components/Layout/Navbar';
import ProtectedRoute from './components/Layout/ProtectedRoute';
import { authService } from './services/api';
import './App.css';

const App: React.FC = () => {
  const isAuthenticated = authService.isAuthenticated();

  return (
    <Router>
      <div className="app">
        {isAuthenticated && <Navbar />}
        <main className="main-content">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/" element={<Navigate to="/dashboard" />} />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/employees" element={
              <ProtectedRoute allowedRoles={['ADMIN', 'HR', 'MANAGER']}>
                <EmployeeList />
              </ProtectedRoute>
            } />
            
            <Route path="/projects" element={
              <ProtectedRoute>
                <ProjectList />
              </ProtectedRoute>
            } />
            
            <Route path="/my-assignments" element={
              <ProtectedRoute>
                <MyAssignments />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;