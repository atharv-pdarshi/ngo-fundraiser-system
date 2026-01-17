import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { CheckCircle } from 'lucide-react';

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('Verifying...');

    useEffect(() => {
        const verify = async () => {
            const sessionId = searchParams.get('session_id');
            const donationId = searchParams.get('donation_id');
            const campaignId = searchParams.get('campaign_id');
            const token = localStorage.getItem('token');

            if (!sessionId || !donationId) {
                setStatus('Invalid Payment Data');
                return;
            }

            try {
                await api.post('/donations/verify-payment', 
                    { session_id: sessionId, donation_id: donationId, campaign_id: campaignId },
                    { headers: { 'x-auth-token': token } }
                );
                setStatus('Payment Successful!');
                // Redirect to dashboard after 2 seconds
                setTimeout(() => navigate('/dashboard'), 3000);
            } catch (err) {
                setStatus('Verification Failed. Please contact support.');
            }
        };

        verify();
    }, []);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-green-50">
            <CheckCircle size={80} className="text-green-600 mb-4" />
            <h1 className="text-3xl font-bold text-gray-800">{status}</h1>
            <p className="text-gray-600 mt-2">Redirecting to dashboard...</p>
        </div>
    );
};

export default PaymentSuccess;