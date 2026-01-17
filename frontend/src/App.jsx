import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PaymentSuccess from './pages/PaymentSuccess';
import { Heart, Shield, Users, ArrowRight } from 'lucide-react';

const Home = () => (
  <div className="min-h-screen bg-white font-sans">
    {/* Navbar */}
    <nav className="flex justify-between items-center p-6 container mx-auto">
      <div className="text-2xl font-bold text-blue-900 flex items-center gap-2">
        <Heart className="text-red-500 fill-current" /> NSS Relief Fund
      </div>
      <div className="space-x-4">
        <a href="/login" className="text-gray-600 hover:text-blue-900 font-medium">Login</a>
        <a href="/register" className="bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 transition shadow-md">
          Join the Cause
        </a>
      </div>
    </nav>

    {/* Hero Section */}
    <header className="container mx-auto px-6 py-16 md:py-24 flex flex-col-reverse md:flex-row items-center gap-12">
      <div className="md:w-1/2 space-y-6">
        <h1 className="text-5xl font-extrabold text-slate-900 leading-tight">
          Small Acts, <br/>
          <span className="text-blue-600">Big Impact.</span>
        </h1>
        <p className="text-lg text-gray-600 leading-relaxed">
          Your contribution can change lives. We ensure 100% transparency in every rupee donated. Join our mission to support education and disaster relief.
        </p>
        <div className="flex gap-4">
          <a href="/register" className="flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-lg font-bold hover:bg-blue-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1">
            Start Donating <ArrowRight size={20} />
          </a>
          <a href="/login" className="px-8 py-4 border-2 border-gray-200 rounded-lg font-bold text-gray-600 hover:border-blue-600 hover:text-blue-600 transition">
            View Impact
          </a>
        </div>
      </div>
      <div className="md:w-1/2 relative">
        <div className="absolute inset-0 bg-blue-600 rounded-2xl transform rotate-3 opacity-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
          alt="Charity" 
          className="rounded-2xl shadow-2xl relative z-10 w-full object-cover h-96"
        />
      </div>
    </header>

    {/* Features Section */}
    <section className="bg-slate-50 py-20">
      <div className="container mx-auto px-6 grid md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition">
          <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
            <Shield className="text-blue-600" />
          </div>
          <h3 className="text-xl font-bold mb-3">100% Secure</h3>
          <p className="text-gray-500">Donations are processed via Stripe with military-grade encryption.</p>
        </div>
        <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition">
          <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
            <Users className="text-green-600" />
          </div>
          <h3 className="text-xl font-bold mb-3">Transparent</h3>
          <p className="text-gray-500">Every donor gets a dashboard to track their contribution history.</p>
        </div>
        <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition">
          <div className="bg-red-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
            <Heart className="text-red-600" />
          </div>
          <h3 className="text-xl font-bold mb-3">Direct Impact</h3>
          <p className="text-gray-500">We ensure funds reach those who need them most without intermediaries.</p>
        </div>
      </div>
    </section>
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