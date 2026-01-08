import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Layouts
import MainLayout from './layouts/MainLayout';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import DeploymentDetail from './pages/DeploymentDetail';
import DeployNewStatic from './pages/DeployNewStatic';
import DeployNewWeb from './pages/DeployNewWeb';

const ProtectedRoute = ({ children }) => {
  const [authorized, setAuthorized] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Optimistic check or check existing cookie presence logic
    // For now keeping strict check to avoid flashing dashboard
    axios.get("http://localhost:3004/checkCreds", {
      withCredentials: true,
    })
      .then(res => {
        if (res.status === 200) setAuthorized(true);
      })
      .catch(() => setAuthorized(false))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (authorized === false) return <Navigate to="/login" />;

  return (
    <MainLayout>
      {children}
    </MainLayout>
  );
};

// OAuth Redirect Handler
const Redirect = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const code = queryParams.get('code');

  useEffect(() => {
    if (code) {
      window.location.href = `http://localhost:3004/oauth/callback?code=${code}`;
    }
  }, [code]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <h2>Redirecting...</h2>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/redirect" element={<Redirect />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/static/new"
          element={
            <ProtectedRoute>
              <DeployNewStatic />
            </ProtectedRoute>
          }
        />
        <Route
          path="/web/new"
          element={
            <ProtectedRoute>
              <DeployNewWeb />
            </ProtectedRoute>
          }
        />
        <Route
          path="/deployment/:id"
          element={
            <ProtectedRoute>
              <DeploymentDetail />
            </ProtectedRoute>
          }
        />
        {/* Placeholder routes for links in sidebar that don't exist yet */}
        <Route path="/projects" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        {/* <Route path="/integrations" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} /> */}
        <Route path="/settings" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
