import { useState } from 'react';
import api from '../api';
import { toast } from 'react-toastify';
import { PlusCircle, Loader } from 'lucide-react';

const ExpenseForm = ({ onExpenseAdded }) => {
    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        category: 'Operational', // Default
        date: new Date().toISOString().split('T')[0],
        description: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await api.post('/expenses', formData, {
                headers: { 'x-auth-token': token }
            });
            toast.success('Expenditure Logged Successfully');
            setFormData({
                title: '',
                amount: '',
                category: 'Operational',
                date: new Date().toISOString().split('T')[0],
                description: ''
            });
            if (onExpenseAdded) onExpenseAdded(); // Refresh parent data
        } catch (err) {
            toast.error(err.response?.data?.msg || 'Failed to log expense');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <h3 className="font-bold text-slate-700 flex items-center gap-2">
                <PlusCircle size={20} className="text-blue-600" /> Log New Expenditure
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Expense Title</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full p-2 rounded-lg border-slate-200 focus:ring-2 focus:ring-blue-500"
                        required
                        placeholder="e.g., Food Distribution Phase 1"
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Amount (₹)</label>
                    <input
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        className="w-full p-2 rounded-lg border-slate-200 focus:ring-2 focus:ring-blue-500"
                        required
                        placeholder="0.00"
                    />
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Category</label>
                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full p-2 rounded-lg border-slate-200 focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                        <option>Operational</option>
                        <option>Logistics</option>
                        <option>Medical</option>
                        <option>Food</option>
                        <option>Education</option>
                        <option>Marketing</option>
                        <option>Other</option>
                    </select>
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Date</label>
                    <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        className="w-full p-2 rounded-lg border-slate-200 focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
            </div>

            <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Description</label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full p-2 rounded-lg border-slate-200 focus:ring-2 focus:ring-blue-500 h-20"
                    placeholder="Details regarding the expense..."
                ></textarea>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-black transition flex items-center justify-center gap-2"
            >
                {loading ? <Loader className="animate-spin" size={18} /> : 'Confirm Expenditure'}
            </button>
        </form>
    );
};

export default ExpenseForm;
