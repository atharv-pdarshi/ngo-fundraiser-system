import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { LogOut, CreditCard, History, User, Mail, Award, Download } from 'lucide-react';
import { toast } from 'react-toastify';
import { jsPDF } from "jspdf";

const UserDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [donations, setDonations] = useState([]);
    const [campaigns, setCampaigns] = useState([]);
    const [selectedCampaign, setSelectedCampaign] = useState('');
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const [donRes, camRes] = await Promise.all([
                    api.get('/donations/my-history', { headers: { 'x-auth-token': token } }),
                    api.get('/campaigns')
                ]);
                setDonations(donRes.data);
                setCampaigns(camRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // 🏆 PDF GENERATION LOGIC
    const downloadCertificate = (donation) => {
        const doc = new jsPDF({ orientation: 'landscape' });
        
        // Design Border
        doc.setLineWidth(5);
        doc.setDrawColor(30, 58, 138); // Dark Blue
        doc.rect(5, 5, 287, 200);

        // Header
        doc.setFontSize(40);
        doc.setTextColor(30, 58, 138);
        doc.text("CERTIFICATE OF APPRECIATION", 148, 50, { align: "center" });

        doc.setFontSize(20);
        doc.setTextColor(100);
        doc.text("This certificate is proudly presented to", 148, 75, { align: "center" });

        // User Name
        doc.setFontSize(35);
        doc.setTextColor(0);
        doc.text(user.name.toUpperCase(), 148, 100, { align: "center" });

        // Description
        doc.setFontSize(16);
        doc.setTextColor(100);
        doc.text(`In recognition of the generous donation of INR ${donation.amount}`, 148, 125, { align: "center" });
        doc.text(`towards "${donation.campaign?.title || 'Our General Cause'}"`, 148, 135, { align: "center" });

        // Footer
        doc.setFontSize(14);
        doc.text(`Date: ${new Date(donation.createdAt).toLocaleDateString()}`, 50, 170);
        doc.text(`Verification ID: ${donation.paymentId?.slice(-10) || 'NSS-OFFICIAL'}`, 240, 170, { align: "right" });

        doc.setFontSize(12);
        doc.text("Authorized by NSS Relief Fund", 148, 190, { align: "center" });

        doc.save(`${user.name}_Donation_Certificate.pdf`);
        toast.info("Generating your certificate...");
    };

    const handleDonate = async (e) => {
        e.preventDefault();
        if (!amount || !selectedCampaign) return toast.error('Select campaign and enter amount');

        try {
            const token = localStorage.getItem('token');
            const res = await api.post('/donations/create-checkout-session', 
                { amount, campaignId: selectedCampaign },
                { headers: { 'x-auth-token': token } }
            );
            if (res.data.url) window.location.href = res.data.url;
        } catch (err) {
            toast.error('Payment Failed');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* Header */}
            <nav className="bg-white border-b p-4 flex justify-between items-center px-8 sticky top-0 z-50">
                <div className="flex items-center gap-2 text-blue-900 font-bold text-xl">
                    <Award className="text-blue-600" /> Donor Portal
                </div>
                <button onClick={() => { logout(); navigate('/login'); }} className="text-gray-500 hover:text-red-600 flex items-center gap-2 font-medium">
                    <LogOut size={18} /> Logout
                </button>
            </nav>

            <div className="container mx-auto p-8 grid lg:grid-cols-4 gap-8">
                {/* Left: User Profile */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 text-blue-600 font-bold text-2xl">
                        {user?.name[0]}
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">{user?.name}</h2>
                    <p className="text-slate-400 text-sm mb-6 flex items-center gap-1"><Mail size={14}/> {user?.email}</p>
                    <div className="bg-blue-50 p-4 rounded-xl">
                        <p className="text-blue-900 text-xs font-bold uppercase tracking-wider">Total Impact</p>
                        <p className="text-2xl font-black text-blue-600">₹ {donations.filter(d => d.status === 'success').reduce((acc, curr) => acc + curr.amount, 0)}</p>
                    </div>
                </div>

                {/* Middle: Donation Form */}
                <div className="lg:col-span-3 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                    <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                        <CreditCard className="text-blue-600" /> Choose a Cause & Support
                    </h2>

                    <form onSubmit={handleDonate} className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <label className="block text-sm font-bold text-slate-700">Select Campaign</label>
                            <div className="grid gap-3">
                                {campaigns.map(c => (
                                    <div 
                                        key={c._id} 
                                        onClick={() => setSelectedCampaign(c._id)}
                                        className={`p-4 border-2 rounded-xl cursor-pointer transition flex items-center gap-4 ${selectedCampaign === c._id ? 'border-blue-600 bg-blue-50' : 'border-slate-100 hover:border-slate-200'}`}
                                    >
                                        <img src={c.imageUrl} className="w-12 h-12 rounded-lg object-cover" alt="" />
                                        <div>
                                            <p className="font-bold text-slate-800 text-sm">{c.title}</p>
                                            <p className="text-xs text-slate-400">Target: ₹{c.targetAmount.toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-4">Amount to Donate</label>
                                <div className="grid grid-cols-3 gap-2 mb-4">
                                    {[500, 1000, 2000].map(v => (
                                        <button key={v} type="button" onClick={() => setAmount(v)} className={`py-2 rounded-lg font-bold border ${amount == v ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200'}`}>₹{v}</button>
                                    ))}
                                </div>
                                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full p-4 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-bold text-lg" placeholder="Enter custom amount" />
                            </div>
                            <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg shadow-xl hover:bg-blue-700 transition transform hover:-translate-y-1">
                                Proceed to Payment
                            </button>
                        </div>
                    </form>
                </div>

                {/* Bottom: History with PDF Download */}
                <div className="lg:col-span-4 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                    <h2 className="text-2xl font-bold text-slate-800 mb-6">Recent Contributions</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-slate-400 text-xs uppercase tracking-widest border-b">
                                    <th className="pb-4">Campaign</th>
                                    <th className="pb-4">Amount</th>
                                    <th className="pb-4">Status</th>
                                    <th className="pb-4">Certificate</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {donations.map(d => (
                                    <tr key={d._id} className="group">
                                        <td className="py-4 font-bold text-slate-700">{d.campaign?.title || 'General Fund'}</td>
                                        <td className="py-4 font-black text-blue-600">₹{d.amount}</td>
                                        <td className="py-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${d.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {d.status}
                                            </span>
                                        </td>
                                        <td className="py-4">
                                            {d.status === 'success' ? (
                                                <button 
                                                    onClick={() => downloadCertificate(d)}
                                                    className="flex items-center gap-2 text-blue-600 font-bold text-sm hover:underline"
                                                >
                                                    <Download size={16} /> Certificate
                                                </button>
                                            ) : <span className="text-slate-300 text-xs italic">Awaiting Payment</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;