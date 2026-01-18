import { useNavigate } from 'react-router-dom';
import { XCircle, RefreshCcw, Home } from 'lucide-react';

const PaymentFailure = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 p-6 font-sans">
            <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center space-y-6">
                <div className="flex justify-center">
                    <div className="bg-red-100 p-4 rounded-full">
                        <XCircle size={60} className="text-red-600" />
                    </div>
                </div>

                <h1 className="text-3xl font-black text-slate-800">Payment Unsuccessful</h1>

                <p className="text-slate-500 font-medium">
                    We couldn't process your donation. This might be due to a network issue, insufficient funds, or a cancelled transaction.
                </p>

                <div className="space-y-3 pt-4">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full bg-red-600 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-700 transition shadow-lg shadow-red-200"
                    >
                        <RefreshCcw size={18} /> Try Again
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full bg-slate-100 text-slate-600 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition"
                    >
                        <Home size={18} /> Return Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentFailure;
