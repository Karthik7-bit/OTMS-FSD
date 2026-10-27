import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import OrganInventory from './pages/OrganInventory';
import TransplantRequests from './pages/TransplantRequests';
import MatchingEngine from './pages/MatchingEngine';
import Profile from './pages/Profile';
import AdminPortal from './pages/AdminPortal';
import DonateOrgan from './pages/DonateOrgan';
import RequestOrgan from './pages/RequestOrgan';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/admin" element={<PrivateRoute><AdminPortal /></PrivateRoute>} />
          <Route path="/organs" element={<PrivateRoute><OrganInventory /></PrivateRoute>} />
          <Route path="/requests" element={<PrivateRoute><TransplantRequests /></PrivateRoute>} />
          <Route path="/matching" element={<PrivateRoute><MatchingEngine /></PrivateRoute>} />
          <Route path="/donate" element={<PrivateRoute><DonateOrgan /></PrivateRoute>} />
          <Route path="/request" element={<PrivateRoute><RequestOrgan /></PrivateRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
