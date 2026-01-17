import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { User, Mail, Lock, Phone } from 'lucide-react';

const Register = () => {
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', phone: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(formData.name, formData.email, formData.password, formData.phone);
            toast.success('Registration Successful! Please Login.');
            navigate('/login');
        } catch (err) {
            toast.error(err.response?.data?.msg || 'Registration Failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold text-center text-blue-900 mb-6">Create an Account</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    <div className="relative">
                        <User className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input type="text" name="name" placeholder="Full Name" required 
                            className="w-full pl-10 p-2 border rounded focus:outline-blue-500"
                            onChange={handleChange} />
                    </div>

                    <div className="relative">
                        <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input type="email" name="email" placeholder="Email Address" required 
                            className="w-full pl-10 p-2 border rounded focus:outline-blue-500"
                            onChange={handleChange} />
                    </div>

                    <div className="relative">
                        <Phone className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input type="text" name="phone" placeholder="Phone Number" required 
                            className="w-full pl-10 p-2 border rounded focus:outline-blue-500"
                            onChange={handleChange} />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input type="password" name="password" placeholder="Password" required 
                            className="w-full pl-10 p-2 border rounded focus:outline-blue-500"
                            onChange={handleChange} />
                    </div>

                    <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition">
                        Register
                    </button>
                </form>
                <p className="mt-4 text-center text-gray-600">
                    Already have an account? <Link to="/login" className="text-blue-600">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;