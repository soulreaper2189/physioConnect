import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';

// Protected Route Component to easily secure routes
const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="h-screen w-full flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRole && user.role !== allowedRole) {
    // Redirect to their appropriate dashboard if they try to access the wrong one
    return <Navigate to={`/${user.role}/dashboard`} />;
  }

  return children;
};

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="h-screen w-full flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to={`/${user.role}/dashboard`} />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to={`/${user.role}/dashboard`} />} />

      {/* Patient Routes */}
      <Route
        path="/patient/dashboard"
        element={
          <ProtectedRoute allowedRole="patient">
            <PatientDashboard />
          </ProtectedRoute>
        }
      />

      {/* Doctor Routes */}
      <Route
        path="/doctor/dashboard"
        element={
          <ProtectedRoute allowedRole="doctor">
            <DoctorDashboard />
          </ProtectedRoute>
        }
      />

      {/* Default fallback */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
