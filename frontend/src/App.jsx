import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PaymentSuccess from './pages/PaymentSuccess';

// Simple Landing Page Component
const Home = () => (
  <div className="min-h-screen bg-blue-50 flex flex-col items-center justify-center">
    <h1 className="text-4xl font-bold text-blue-900 mb-4">NSS Donation Portal</h1>
    <p className="text-gray-600 mb-8">Secure, Transparent, and Impactful.</p>
    <div className="space-x-4">
      <a href="/login" className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Login</a>
      <a href="/register" className="px-6 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50">Register</a>
    </div>
  </div>
);

// Helper to protect routes (Redirects to login if no token found)
const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route path="/dashboard" element={
        <ProtectedRoute>
            <UserDashboard />
        </ProtectedRoute>
      } />

      <Route path="/admin" element={
        <ProtectedRoute>
          <AdminDashboard />
        </ProtectedRoute>
      } />

    <Route path="/payment-success" element={<PaymentSuccess />} />

    </Routes>

  );
}

export default App;