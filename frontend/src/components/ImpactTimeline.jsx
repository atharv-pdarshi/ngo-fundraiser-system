import { useEffect, useState } from 'react';
import api from '../api';
import { Clock, CheckCircle2, ShoppingBag } from 'lucide-react';

const ImpactTimeline = () => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/expenses')
            .then(res => setExpenses(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="text-slate-400 text-sm animate-pulse">Loading impact data...</div>;

    if (expenses.length === 0) return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 text-center space-y-2">
            <Clock className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-slate-500 font-medium">No expenses logged yet.</p>
        </div>
    );

    return (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 h-full">
            <h3 className="font-black text-xl mb-6 flex items-center gap-2 text-slate-800">
                <ShoppingBag className="text-blue-600" /> Impact Timeline
            </h3>

            <div className="relative border-l-2 border-slate-100 ml-3 space-y-8">
                {expenses.map((expense, index) => (
                    <div key={expense._id} className="ml-6 relative">
                        <span className="absolute -left-[31px] top-1 bg-blue-100 text-blue-600 p-1.5 rounded-full border-4 border-white">
                            <CheckCircle2 size={14} />
                        </span>

                        <div className="bg-slate-50 p-4 rounded-2xl hover:bg-slate-100 transition duration-300">
                            <div className="flex justify-between items-start mb-1">
                                <h4 className="font-bold text-slate-800 text-sm">{expense.title}</h4>
                                <span className="text-xs font-black text-red-500">- ₹{expense.amount.toLocaleString()}</span>
                            </div>
                            <p className="text-xs text-slate-500 mb-2">{expense.description}</p>
                            <div className="flex items-center gap-3">
                                <span className="bg-white px-2 py-1 rounded-md text-[10px] font-bold text-slate-400 uppercase border border-slate-200">
                                    {expense.category}
                                </span>
                                <span className="text-[10px] font-medium text-slate-400">
                                    {new Date(expense.date).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ImpactTimeline;
