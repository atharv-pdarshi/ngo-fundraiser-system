import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import api from './api';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailure from './pages/PaymentFailure';

// Consolidated Icons
import { Heart, Shield, Users, ArrowRight, Award, Target } from 'lucide-react';

// --- PREMIUM LANDING PAGE COMPONENT ---
const Home = () => {
    const [campaigns, setCampaigns] = useState([]);

    useEffect(() => {
        api.get('/campaigns').then(res => setCampaigns(res.data.slice(0, 3))).catch(e => console.log(e));
    }, []);

    return (
        <div className="min-h-screen bg-white font-sans selection:bg-blue-100">
            {/* Navbar */}
            <nav className="flex justify-between items-center p-6 container mx-auto">
                <div className="text-2xl font-black text-blue-900 flex items-center gap-2 italic">
                    <Heart className="text-red-500 fill-current" /> RELIEF<span className="text-blue-600">CORE</span>
                </div>
                <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-500">
                    <a href="#campaigns" className="hover:text-blue-600">Active Causes</a>
                    <a href="/login" className="hover:text-blue-600">Login</a>
                    <a href="/register" className="bg-blue-600 text-white px-6 py-2.5 rounded-full hover:shadow-xl transition hover:-translate-y-0.5">Start Donating</a>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="container mx-auto px-6 py-20 flex flex-col md:flex-row items-center gap-16">
                <div className="md:w-1/2 space-y-8 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
                        <Award size={14} /> Official NSS Initiative
                    </div>
                    <h1 className="text-6xl md:text-7xl font-black text-slate-900 leading-tight">
                        Empower <br />
                        <span className="text-blue-600 italic">Communities.</span>
                    </h1>
                    <p className="text-xl text-slate-500 leading-relaxed font-medium">
                        A secure, transparent platform connecting generous hearts with meaningful causes. Every contribution is verified and tracked.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                        <a href="/register" className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-black transition-all shadow-2xl flex items-center gap-2 group">
                            Become a Donor <ArrowRight className="group-hover:translate-x-2 transition" />
                        </a>
                    </div>
                </div>
                <div className="md:w-1/2 relative group">
                    <div className="absolute -inset-4 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-3xl opacity-20 blur-2xl group-hover:opacity-30 transition duration-1000"></div>
                    <img
                        src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80"
                        alt="Impact"
                        className="rounded-3xl shadow-2xl relative z-10 w-full aspect-[4/3] object-cover grayscale-[20%] group-hover:grayscale-0 transition duration-700"
                    />
                </div>
            </header>

            {/* LIVE CAMPAIGNS SECTION */}
            <section id="campaigns" className="bg-slate-50 py-24">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
                        <div className="space-y-2">
                            <h2 className="text-4xl font-black text-slate-900 italic">Live Causes</h2>
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Verified by NSS Relief Core</p>
                        </div>
                        <a href="/register" className="text-blue-600 font-black text-sm flex items-center gap-1 hover:underline">VIEW ALL CAUSES <ArrowRight size={14} /></a>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {campaigns.length > 0 ? campaigns.map(c => (
                            <div key={c._id} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition duration-500 group">
                                <div className="h-56 relative overflow-hidden">
                                    <img src={c.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" alt="" />
                                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black text-blue-600 uppercase">Active</div>
                                </div>
                                <div className="p-8 space-y-4">
                                    <h3 className="text-xl font-black text-slate-800">{c.title}</h3>
                                    <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">{c.description}</p>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs font-black">
                                            <span className="text-blue-600">₹{c.raisedAmount.toLocaleString()}</span>
                                            <span className="text-slate-300">GOAL: ₹{c.targetAmount.toLocaleString()}</span>
                                        </div>
                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className="bg-blue-600 h-full transition-all duration-1000"
                                                style={{ width: `${Math.min(100, (c.raisedAmount / c.targetAmount) * 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <a href="/register" className="block text-center bg-slate-50 text-slate-900 py-3 rounded-xl font-black text-sm hover:bg-blue-600 hover:text-white transition">SUPPORT CAUSE</a>
                                </div>
                            </div>
                        )) : (
                            <p className="text-slate-400 font-medium">Loading amazing causes...</p>
                        )}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t text-center space-y-4">
                <div className="text-xl font-black text-slate-300 italic">RELIEF<span className="text-slate-200">CORE</span></div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-tighter">© 2026 Developed for NSS IIT Roorkee Development Track</p>
            </footer>
        </div>
    );
};

// --- PROTECTED ROUTE COMPONENT ---
const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" />;
};

// --- MAIN APP COMPONENT ---
function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/payment-failure" element={<PaymentFailure />} />

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
        </Routes>
    );
}

export default App;