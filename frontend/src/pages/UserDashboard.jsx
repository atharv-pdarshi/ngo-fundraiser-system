import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { LogOut, CreditCard, History, User } from 'lucide-react';
import { toast } from 'react-toastify';

const UserDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [donations, setDonations] = useState([]);
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(true);

    // Fetch Donation History on Load
    useEffect(() => {
        const fetchDonations = async () => {
            try {
                const token = localStorage.getItem('token');
                // We pass the token explicitly to be safe
                const res = await api.get('/donations/my-history', {
                    headers: { 'x-auth-token': token }
                });
                setDonations(res.data);
            } catch (err) {
                console.error(err);
                // If error, maybe token expired
            } finally {
                setLoading(false);
            }
        };
        fetchDonations();
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleDonate = async (e) => {
        e.preventDefault();
        if (!amount || amount <= 0) return toast.error('Please enter a valid amount');

        try {
            const token = localStorage.getItem('token');
            await api.post('/donations/create', 
                { amount },
                { headers: { 'x-auth-token': token } }
            );
            toast.success('Donation Initiated! (Status: Pending)');
            setAmount('');
            // Refresh list
            const res = await api.get('/donations/my-history', { headers: { 'x-auth-token': token } });
            setDonations(res.data);
        } catch (err) {
            toast.error('Donation Failed');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <nav className="bg-blue-900 text-white p-4 shadow-md flex justify-between items-center">
                <h1 className="text-xl font-bold flex items-center gap-2">
                    <User size={24} /> Welcome, {user?.name}
                </h1>
                <button onClick={handleLogout} className="flex items-center gap-2 bg-red-500 px-4 py-2 rounded hover:bg-red-600 transition">
                    <LogOut size={18} /> Logout
                </button>
            </nav>

            <div className="container mx-auto p-6 grid md:grid-cols-3 gap-6">
                
                {/* Section 1: Donate Form */}
                <div className="bg-white p-6 rounded-lg shadow-md h-fit">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <CreditCard className="text-blue-600" /> Make a Donation
                    </h2>
                    <p className="text-gray-600 mb-4 text-sm">Support the cause. Your contribution matters.</p>
                    <form onSubmit={handleDonate} className="space-y-4">
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">Amount (INR)</label>
                            <input 
                                type="number" 
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full p-2 border rounded focus:outline-blue-500"
                                placeholder="e.g. 500"
                            />
                        </div>
                        <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition font-bold">
                            Donate Now
                        </button>
                    </form>
                </div>

                {/* Section 2: Donation History */}
                <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <History className="text-blue-600" /> Donation History
                    </h2>
                    
                    {loading ? (
                        <p>Loading...</p>
                    ) : donations.length === 0 ? (
                        <p className="text-gray-500">No donations yet. Be the first to contribute!</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-100 border-b">
                                        <th className="p-3">Date</th>
                                        <th className="p-3">Amount</th>
                                        <th className="p-3">Status</th>
                                        <th className="p-3">ID</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {donations.map((d) => (
                                        <tr key={d._id} className="border-b hover:bg-gray-50">
                                            <td className="p-3">{new Date(d.createdAt).toLocaleDateString()}</td>
                                            <td className="p-3 font-bold">₹{d.amount}</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${
                                                    d.status === 'success' ? 'bg-green-100 text-green-700' :
                                                    d.status === 'failed' ? 'bg-red-100 text-red-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                    {d.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="p-3 text-xs text-gray-400 font-mono">
                                                {d._id.slice(-6)}...
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;