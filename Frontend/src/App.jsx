// src/App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ProtectedRoute = ({ children }) => {
  const [authorized, setAuthorized] = useState(null);  // State to track authorization
  const [loading, setLoading] = useState(true);  // State for loading

  useEffect(() => {
    axios.get("http://localhost:3004/checkCreds", {
      withCredentials: true,  // Send cookies for session management
    })
      .then(res => {
        if (res.status === 200) setAuthorized(true);
      })
      .catch(() => setAuthorized(false))
      .finally(() => setLoading(false));  // Ensure loading is set to false after check
  }, []);

  if (loading) return <p>Loading...</p>;  // Show loading state while checking credentials
  if (authorized === false) return <Navigate to="/login" />;  // Redirect to login if unauthorized
  return children;  // Return children (protected page) if authorized
};

const Home = () => {
  return <h2>Welcome to Home Page</h2>
};
const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const res = await axios.post("http://localhost:3004/logout", {}, { withCredentials: true });
      if (res.status === 200) {
        navigate('/login');
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      <h2>Welcome to Dashboard Protect</h2>
      <button onClick={handleLogout}>
        Logout
      </button>
    </>
  );
};


const Login = () => {
  const handleLogin = () => {
    window.location.href = "http://localhost:3004/login";
  };

  return (
    <div>
      <h2>Login Page</h2>
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

const Redirect = () => {
  const location = useLocation();
  // Parse 'code' from query string using URLSearchParams
  const queryParams = new URLSearchParams(location.search);
  const code = queryParams.get('code');

  useEffect(() => {
    if (code) {
      // Redirect browser to backend to handle OAuth callback and set cookie
      window.location.href = `http://localhost:3004/oauth/callback?code=${code}`;
    }
  }, [code]);

  return (
    <div>
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
        <Route
          path="/home"
          element={
            <ProtectedRoute>
            <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Login />} />
      </Routes>
    </Router>
  );
};

export default App;
