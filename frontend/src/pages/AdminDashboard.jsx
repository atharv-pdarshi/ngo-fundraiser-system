import { useEffect, useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { Users, DollarSign, Download, LogOut, LayoutDashboard, Search, Filter } from 'lucide-react';
import { toast } from 'react-toastify';
import { BarChart, Bar, ResponsiveContainer, Tooltip } from 'recharts';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ totalUsers: 0, totalDonations: 0 });
    const [users, setUsers] = useState([]);
    const [donations, setDonations] = useState([]);
    const [activeTab, setActiveTab] = useState('users'); 
    const [loading, setLoading] = useState(true);
    
    // FILTERS STATE
    const [searchTerm, setSearchTerm] = useState('');
    const [minDonation, setMinDonation] = useState(''); // NEW: Amount Filter

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) navigate('/login');

                const [statsRes, usersRes, donationsRes] = await Promise.all([
                    api.get('/admin/stats', { headers: { 'x-auth-token': token } }),
                    api.get('/admin/users', { headers: { 'x-auth-token': token } }),
                    api.get('/admin/donations', { headers: { 'x-auth-token': token } })
                ]);

                setStats(statsRes.data);
                setUsers(usersRes.data);
                setDonations(donationsRes.data);
            } catch (err) {
                if (err.response && err.response.status === 403) {
                    toast.error("Access Denied");
                    navigate('/dashboard');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [navigate]);

    const exportCSV = () => {
        const headers = ["Name,Email,Phone,Total Contributed,Joined At\n"];
        const rows = users.map(u => 
            `${u.name},${u.email},${u.phone},${u.totalDonated},${new Date(u.createdAt).toLocaleDateString()}`
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

    // ADVANCED FILTER LOGIC
    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesAmount = minDonation === '' || user.totalDonated >= parseInt(minDonation);
        
        return matchesSearch && matchesAmount;
    });

    if (loading) return <div className="p-10">Loading Admin Panel...</div>;

    return (
        <div className="min-h-screen bg-gray-100 font-sans">
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
                {/* Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-gray-500 text-sm uppercase font-bold mb-1">Total Users</p>
                                <h3 className="text-4xl font-extrabold text-gray-800">{stats.totalUsers}</h3>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-full"><Users className="text-blue-600" size={24} /></div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-gray-500 text-sm uppercase font-bold mb-1">Total Raised</p>
                                <h3 className="text-4xl font-extrabold text-green-600">₹ {stats.totalDonations.toLocaleString()}</h3>
                            </div>
                            <div className="p-3 bg-green-50 rounded-full"><DollarSign className="text-green-600" size={24} /></div>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-md">
                         <div className="h-24">
                             <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={[{ name: 'Raised', amount: stats.totalDonations }, { name: 'Goal', amount: stats.totalDonations * 1.5 }]}>
                                    <Bar dataKey="amount" fill="#2563EB" radius={[4, 4, 0, 0]} />
                                    <Tooltip cursor={{fill: 'transparent'}} />
                                </BarChart>
                             </ResponsiveContainer>
                         </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="flex border-b">
                        <button onClick={() => setActiveTab('users')}
                            className={`flex-1 p-4 font-bold text-center ${activeTab === 'users' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}>
                            Registered Users
                        </button>
                        <button onClick={() => setActiveTab('donations')}
                            className={`flex-1 p-4 font-bold text-center ${activeTab === 'donations' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}>
                            Donation Records
                        </button>
                    </div>

                    <div className="p-6">
                        {activeTab === 'users' ? (
                            <div>
                                <div className="flex flex-col xl:flex-row justify-between items-center mb-6 gap-4">
                                    <h3 className="text-lg font-bold text-gray-700">User Registry</h3>
                                    
                                    <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                                        {/* Name Search */}
                                        <div className="relative">
                                            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                            <input type="text" placeholder="Search User..." 
                                                className="pl-10 p-2 border rounded-lg bg-gray-50 focus:outline-blue-500 w-full md:w-64"
                                                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                                        </div>

                                        {/* NEW: Amount Filter */}
                                        <div className="relative">
                                            <Filter className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                            <input type="number" placeholder="Min Donation ₹" 
                                                className="pl-10 p-2 border rounded-lg bg-gray-50 focus:outline-blue-500 w-full md:w-40"
                                                value={minDonation} onChange={(e) => setMinDonation(e.target.value)} />
                                        </div>
                                    </div>

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
                                                <th className="p-3">Total Contributed</th>
                                                <th className="p-3">Joined Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {filteredUsers.map(u => (
                                                <tr key={u._id} className="hover:bg-gray-50">
                                                    <td className="p-3 font-medium text-gray-800">{u.name}</td>
                                                    <td className="p-3 text-gray-600">{u.email}</td>
                                                    {/* NEW: Green Badge if they donated */}
                                                    <td className="p-3">
                                                        {u.totalDonated > 0 ? (
                                                            <span className="text-green-700 font-bold bg-green-100 px-2 py-1 rounded text-xs">
                                                                ₹ {u.totalDonated.toLocaleString()}
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-400 text-sm">₹ 0</span>
                                                        )}
                                                    </td>
                                                    <td className="p-3 text-gray-500 text-sm">{new Date(u.createdAt).toLocaleDateString()}</td>
                                                </tr>
                                            ))}
                                            {filteredUsers.length === 0 && (
                                                <tr><td colSpan="4" className="p-4 text-center text-gray-400">No matching users found.</td></tr>
                                            )}
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
                                                        <span className={`px-2 py-1 rounded text-xs font-bold ${d.status === 'success' ? 'bg-green-100 text-green-700' : d.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
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