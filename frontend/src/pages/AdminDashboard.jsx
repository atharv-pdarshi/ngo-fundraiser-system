import { useEffect, useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { Users, DollarSign, Download, LogOut, LayoutDashboard } from 'lucide-react';
import { toast } from 'react-toastify';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ totalUsers: 0, totalDonations: 0 });
    const [users, setUsers] = useState([]);
    const [donations, setDonations] = useState([]);
    const [activeTab, setActiveTab] = useState('users'); // 'users' or 'donations'
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) navigate('/login');

                // Parallel API Calls for speed
                const [statsRes, usersRes, donationsRes] = await Promise.all([
                    api.get('/admin/stats', { headers: { 'x-auth-token': token } }),
                    api.get('/admin/users', { headers: { 'x-auth-token': token } }),
                    api.get('/admin/donations', { headers: { 'x-auth-token': token } })
                ]);

                setStats(statsRes.data);
                setUsers(usersRes.data);
                setDonations(donationsRes.data);
            } catch (err) {
                console.error(err);
                if (err.response && err.response.status === 403) {
                    toast.error("Access Denied: Admins Only");
                    navigate('/dashboard'); // Kick non-admins out
                }
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [navigate]);

    // CSV Export Function (Requirement 4.3)
    const exportCSV = () => {
        const headers = ["Name,Email,Phone,Joined At\n"];
        const rows = users.map(u => 
            `${u.name},${u.email},${u.phone},${new Date(u.createdAt).toLocaleDateString()}`
        );
        
        const csvContent = "data:text/csv;charset=utf-8," + headers + rows.join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "ngo_registrations_report.csv");
        document.body.appendChild(link);
        link.click();
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    if (loading) return <div className="p-10">Loading Admin Panel...</div>;

    return (
        <div className="min-h-screen bg-gray-100 font-sans">
            {/* Navbar */}
            <nav className="bg-gray-900 text-white p-4 flex justify-between items-center shadow-lg">
                <div className="flex items-center gap-3">
                    <LayoutDashboard className="text-yellow-400" />
                    <h1 className="text-xl font-bold tracking-wide">Admin Control Center</h1>
                </div>
                <button onClick={handleLogout} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm transition">
                    <LogOut size={16} /> Logout
                </button>
            </nav>

            <div className="container mx-auto p-6">
                {/* Stats & Charts Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Card 1 */}
                    <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-gray-500 text-sm uppercase font-bold mb-1">Total Users</p>
                                <h3 className="text-4xl font-extrabold text-gray-800">{stats.totalUsers}</h3>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-full">
                                <Users className="text-blue-600" size={24} />
                            </div>
                        </div>
                        <p className="text-sm text-gray-400 mt-4">Active registered accounts</p>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-gray-500 text-sm uppercase font-bold mb-1">Total Raised</p>
                                <h3 className="text-4xl font-extrabold text-green-600">₹ {stats.totalDonations.toLocaleString()}</h3>
                            </div>
                            <div className="p-3 bg-green-50 rounded-full">
                                <DollarSign className="text-green-600" size={24} />
                            </div>
                        </div>
                        <p className="text-sm text-gray-400 mt-4">Verified successful funds</p>
                    </div>

                    {/* Card 3: The Chart */}
                    <div className="bg-white p-4 rounded-lg shadow-md flex flex-col justify-center">
                        <p className="text-gray-500 text-xs font-bold uppercase mb-2 text-center">Fund Distribution</p>
                        <div className="h-24">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={[
                                    { name: 'Raised', amount: stats.totalDonations },
                                    { name: 'Target', amount: stats.totalDonations * 1.5 } // Fake target for visuals
                                ]}>
                                    <Bar dataKey="amount" fill="#2563EB" radius={[4, 4, 0, 0]} />
                                    <Tooltip cursor={{ fill: 'transparent' }} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <p className="text-center text-xs text-green-600 font-bold mt-2">
                            Progress: {Math.round((stats.totalDonations / (stats.totalDonations * 1.5 || 1)) * 100)}% of Goal
                        </p>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    {/* Tabs */}
                    <div className="flex border-b">
                        <button 
                            className={`flex-1 p-4 font-bold text-center ${activeTab === 'users' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
                            onClick={() => setActiveTab('users')}
                        >
                            Registered Users
                        </button>
                        <button 
                            className={`flex-1 p-4 font-bold text-center ${activeTab === 'donations' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
                            onClick={() => setActiveTab('donations')}
                        >
                            Donation Records
                        </button>
                    </div>

                    {/* Table Content */}
                    <div className="p-6">
                        {activeTab === 'users' ? (
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold text-gray-700">All Registrations</h3>
                                    <button onClick={exportCSV} className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded hover:bg-black transition text-sm">
                                        <Download size={16} /> Export CSV
                                    </button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                                            <tr>
                                                <th className="p-3">Name</th>
                                                <th className="p-3">Email</th>
                                                <th className="p-3">Phone</th>
                                                <th className="p-3">Joined Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {users.map(u => (
                                                <tr key={u._id} className="hover:bg-gray-50">
                                                    <td className="p-3 font-medium text-gray-800">{u.name}</td>
                                                    <td className="p-3 text-gray-600">{u.email}</td>
                                                    <td className="p-3 text-gray-600">{u.phone}</td>
                                                    <td className="p-3 text-gray-500 text-sm">{new Date(u.createdAt).toLocaleDateString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <h3 className="text-lg font-bold text-gray-700 mb-4">Transaction History</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                                            <tr>
                                                <th className="p-3">Donor</th>
                                                <th className="p-3">Email</th>
                                                <th className="p-3">Amount</th>
                                                <th className="p-3">Status</th>
                                                <th className="p-3">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {donations.map(d => (
                                                <tr key={d._id} className="hover:bg-gray-50">
                                                    <td className="p-3 font-medium text-gray-800">{d.user?.name || 'Unknown'}</td>
                                                    <td className="p-3 text-gray-600 text-sm">{d.user?.email || 'N/A'}</td>
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
                                                    <td className="p-3 text-gray-500 text-sm">{new Date(d.createdAt).toLocaleDateString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;