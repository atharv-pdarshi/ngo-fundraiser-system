import { useEffect, useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { Users, DollarSign, Download, LogOut, LayoutDashboard, Search, Filter, Target, TrendingUp, Wallet, ArrowDownRight } from 'lucide-react';
import { toast } from 'react-toastify';
import { BarChart, Bar, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import ExpenseForm from '../components/ExpenseForm';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ totalUsers: 0, totalDonations: 0 });
    const [users, setUsers] = useState([]);
    const [donations, setDonations] = useState([]);
    const [campaigns, setCampaigns] = useState([]);
    const [expenses, setExpenses] = useState([]); // NEW
    const [activeTab, setActiveTab] = useState('users');
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [minDonation, setMinDonation] = useState('');

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [statsRes, usersRes, donRes, camRes, expRes] = await Promise.all([
                api.get('/admin/stats', { headers: { 'x-auth-token': token } }),
                api.get('/admin/users', { headers: { 'x-auth-token': token } }),
                api.get('/admin/donations', { headers: { 'x-auth-token': token } }),
                api.get('/campaigns'),
                api.get('/expenses')
            ]);
            setStats(statsRes.data);
            setUsers(usersRes.data);
            setDonations(donRes.data);
            setCampaigns(camRes.data);
            setExpenses(expRes.data);
        } catch (err) {
            toast.error("Session Expired or Access Denied");
            navigate('/login');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [navigate]);

    const refreshExpenses = () => {
        api.get('/expenses').then(res => setExpenses(res.data));
    };

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

    const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const fundsRemaining = stats.totalDonations - totalSpent;

    if (loading) return <div className="h-screen flex items-center justify-center font-bold text-blue-600">Initializing Command Center...</div>;

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            {/* Sidebar-style Nav */}
            <nav className="bg-white border-b sticky top-0 z-50 p-4 px-8 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-2 font-black text-2xl text-slate-800">
                    <div className="bg-blue-600 p-1.5 rounded-lg text-white"><LayoutDashboard size={20} /></div>
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
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Total Collected</p>
                        <h2 className="text-3xl font-black text-green-600">₹{stats.totalDonations.toLocaleString()}</h2>
                    </div>

                    {/* NEW STATS FOR FINANCE */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                        <ArrowDownRight className="text-red-500 mb-2" size={24} />
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Total Spent</p>
                        <h2 className="text-3xl font-black text-red-500">₹{totalSpent.toLocaleString()}</h2>
                    </div>
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                        <Wallet className="text-blue-900 mb-2" size={24} />
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Funds Remaining</p>
                        <h2 className={`text-3xl font-black ${fundsRemaining < 0 ? 'text-red-600' : 'text-blue-900'}`}>₹{fundsRemaining.toLocaleString()}</h2>
                    </div>
                </div>

                {/* Campaign Progress - Only show if not expenses tab to save space or keep it? Checking existing layout */}

                {/* Data Tables */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="flex bg-slate-50 p-2 m-4 rounded-2xl flex-wrap gap-2">
                        <button onClick={() => setActiveTab('users')} className={`flex-1 py-3 px-4 rounded-xl font-black text-sm transition whitespace-nowrap ${activeTab === 'users' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}>DONOR REGISTRY</button>
                        <button onClick={() => setActiveTab('donations')} className={`flex-1 py-3 px-4 rounded-xl font-black text-sm transition whitespace-nowrap ${activeTab === 'donations' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}>TRANSACTIONS</button>
                        <button onClick={() => setActiveTab('expenses')} className={`flex-1 py-3 px-4 rounded-xl font-black text-sm transition whitespace-nowrap ${activeTab === 'expenses' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}>EXPENSE LOG</button>
                    </div>

                    <div className="p-8 pt-2">
                        {activeTab === 'users' && (
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
                                    <button onClick={exportCSV} className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-black transition"><Download size={16} /> Export Report</button>
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
                        )}

                        {activeTab === 'donations' && (
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

                        {activeTab === 'expenses' && (
                            <div className="grid lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-1">
                                    <ExpenseForm onExpenseAdded={refreshExpenses} />
                                </div>
                                <div className="lg:col-span-2 space-y-4">
                                    <h3 className="font-bold text-slate-700">Recent Expenditure Log</h3>
                                    <div className="bg-slate-50 rounded-2xl p-4 overflow-hidden">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest border-b">
                                                    <th className="pb-2">Title</th>
                                                    <th className="pb-2">Category</th>
                                                    <th className="pb-2">Amount</th>
                                                    <th className="pb-2">Date</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-200">
                                                {expenses.map(e => (
                                                    <tr key={e._id}>
                                                        <td className="py-3 font-bold text-slate-700 text-sm">{e.title}</td>
                                                        <td className="py-3 text-xs text-slate-500">{e.category}</td>
                                                        <td className="py-3 font-black text-red-500 text-sm">- ₹{e.amount.toLocaleString()}</td>
                                                        <td className="py-3 text-slate-400 text-[10px]">{new Date(e.date).toLocaleDateString()}</td>
                                                    </tr>
                                                ))}
                                                {expenses.length === 0 && (
                                                    <tr>
                                                        <td colSpan="4" className="text-center py-8 text-slate-400 text-xs">No expenses logged yet.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
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