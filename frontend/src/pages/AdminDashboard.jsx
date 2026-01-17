import { useEffect, useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { Users, DollarSign, Download, LogOut, LayoutDashboard, Search, Filter, Target, TrendingUp } from 'lucide-react';
import { toast } from 'react-toastify';
import { BarChart, Bar, ResponsiveContainer, Tooltip, XAxis } from 'recharts';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ totalUsers: 0, totalDonations: 0 });
    const [users, setUsers] = useState([]);
    const [donations, setDonations] = useState([]);
    const [campaigns, setCampaigns] = useState([]); // NEW
    const [activeTab, setActiveTab] = useState('users'); 
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [minDonation, setMinDonation] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const [statsRes, usersRes, donRes, camRes] = await Promise.all([
                    api.get('/admin/stats', { headers: { 'x-auth-token': token } }),
                    api.get('/admin/users', { headers: { 'x-auth-token': token } }),
                    api.get('/admin/donations', { headers: { 'x-auth-token': token } }),
                    api.get('/campaigns') // Fetch live campaigns
                ]);
                setStats(statsRes.data);
                setUsers(usersRes.data);
                setDonations(donRes.data);
                setCampaigns(camRes.data);
            } catch (err) {
                toast.error("Session Expired or Access Denied");
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [navigate]);

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesAmount = minDonation === '' || user.totalDonated >= parseInt(minDonation);
        return matchesSearch && matchesAmount;
    });

    const exportCSV = () => {
        const headers = ["Name,Email,Phone,Total Contributed,Joined At\n"];
        const rows = users.map(u => `${u.name},${u.email},${u.phone},${u.totalDonated},${new Date(u.createdAt).toLocaleDateString()}`);
        const link = document.createElement("a");
        link.setAttribute("href", encodeURI("data:text/csv;charset=utf-8," + headers + rows.join("\n")));
        link.setAttribute("download", "ngo_analytics_report.csv");
        link.click();
    };

    if (loading) return <div className="h-screen flex items-center justify-center font-bold text-blue-600">Initializing Command Center...</div>;

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            {/* Sidebar-style Nav */}
            <nav className="bg-white border-b sticky top-0 z-50 p-4 px-8 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-2 font-black text-2xl text-slate-800">
                    <div className="bg-blue-600 p-1.5 rounded-lg text-white"><LayoutDashboard size={20}/></div>
                    Admin <span className="text-blue-600">Portal</span>
                </div>
                <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="flex items-center gap-2 font-bold text-slate-400 hover:text-red-600 transition">
                    <LogOut size={18} /> Logout
                </button>
            </nav>

            <div className="container mx-auto p-8 space-y-8">
                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                        <Users className="text-blue-600 mb-2" size={24} />
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Total Donors</p>
                        <h2 className="text-3xl font-black">{stats.totalUsers}</h2>
                    </div>
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                        <TrendingUp className="text-green-600 mb-2" size={24} />
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Revenue</p>
                        <h2 className="text-3xl font-black text-green-600">₹{stats.totalDonations.toLocaleString()}</h2>
                    </div>
                    {/* Visual Chart Card */}
                    <div className="md:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center">
                        <div className="w-full h-24">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={campaigns.map(c => ({ name: c.title.split(' ')[0], raised: c.raisedAmount }))}>
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={10} tick={{ fill: '#94a3b8', fontWeight: 'bold' }} />
                                    <Bar dataKey="raised" fill="#2563EB" radius={[10, 10, 10, 10]} barSize={30} />
                                    <Tooltip cursor={{ fill: 'transparent' }} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* NEW: Campaign Performance Section */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                    <h3 className="text-xl font-black mb-6 flex items-center gap-2"><Target className="text-blue-600" /> Campaign Progress</h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {campaigns.map(c => {
                            const percent = Math.min(100, Math.round((c.raisedAmount / c.targetAmount) * 100));
                            return (
                                <div key={c._id} className="space-y-3">
                                    <div className="flex justify-between items-end">
                                        <h4 className="font-bold text-slate-700 text-sm truncate w-40">{c.title}</h4>
                                        <span className="text-xs font-black text-blue-600">{percent}%</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                                        <div 
                                            className="bg-blue-600 h-full transition-all duration-1000" 
                                            style={{ width: `${percent}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                                        <span>Raised: ₹{c.raisedAmount}</span>
                                        <span>Goal: ₹{c.targetAmount}</span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Data Tables */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="flex bg-slate-50 p-2 m-4 rounded-2xl">
                        <button onClick={() => setActiveTab('users')} className={`flex-1 py-3 rounded-xl font-black text-sm transition ${activeTab === 'users' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}>DONOR REGISTRY</button>
                        <button onClick={() => setActiveTab('donations')} className={`flex-1 py-3 rounded-xl font-black text-sm transition ${activeTab === 'donations' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}>LIVE TRANSACTIONS</button>
                    </div>

                    <div className="p-8 pt-2">
                        {activeTab === 'users' ? (
                            <div className="space-y-6">
                                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                                    <div className="flex gap-2 w-full md:w-auto">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-3 top-3 text-slate-300" size={16} />
                                            <input type="text" placeholder="Search donors..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 p-2.5 bg-slate-50 border-none rounded-xl text-sm w-full md:w-64 focus:ring-2 focus:ring-blue-500" />
                                        </div>
                                        <div className="relative">
                                            <Filter className="absolute left-3 top-3 text-slate-300" size={16} />
                                            <input type="number" placeholder="Min ₹" value={minDonation} onChange={e => setMinDonation(e.target.value)} className="pl-10 p-2.5 bg-slate-50 border-none rounded-xl text-sm w-28 focus:ring-2 focus:ring-blue-500" />
                                        </div>
                                    </div>
                                    <button onClick={exportCSV} className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-black transition"><Download size={16}/> Export Report</button>
                                </div>
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest border-b">
                                            <th className="pb-4">Donor Name</th>
                                            <th className="pb-4">Email Address</th>
                                            <th className="pb-4">Total Gifted</th>
                                            <th className="pb-4">Member Since</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {filteredUsers.map(u => (
                                            <tr key={u._id} className="hover:bg-slate-50 transition">
                                                <td className="py-4 font-bold text-slate-700">{u.name}</td>
                                                <td className="py-4 text-slate-500 text-sm">{u.email}</td>
                                                <td className="py-4 font-black text-blue-600">₹{u.totalDonated.toLocaleString()}</td>
                                                <td className="py-4 text-slate-400 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest border-b">
                                        <th className="pb-4">Donor</th>
                                        <th className="pb-4">Amount</th>
                                        <th className="pb-4">Status</th>
                                        <th className="pb-4">Timestamp</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {donations.map(d => (
                                        <tr key={d._id}>
                                            <td className="py-4 font-bold text-slate-700">{d.user?.name}</td>
                                            <td className="py-4 font-black text-green-600">₹{d.amount}</td>
                                            <td className="py-4">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${d.status === 'success' ? 'bg-green-100 text-green-700' :
                                                        d.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-red-100 text-red-700'
                                                    }`}>
                                                    {d.status}
                                                </span>
                                            </td>
                                            <td className="py-4 text-slate-400 text-xs">{new Date(d.createdAt).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;