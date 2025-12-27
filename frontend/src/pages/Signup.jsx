import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Cog, Eye, EyeOff, Loader2, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'technician',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { register, isLoading } = useAuth();

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setError(''); // Clear error on input change
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.name || !formData.email || !formData.password) {
            setError('Please fill in all required fields');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        // Password complexity validation
        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }
        if (!/[A-Z]/.test(formData.password)) {
            setError('Password must contain at least one uppercase letter');
            return;
        }
        if (!/[a-z]/.test(formData.password)) {
            setError('Password must contain at least one lowercase letter');
            return;
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
            setError('Password must contain at least one special character');
            return;
        }

        const result = await register({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: formData.role,
        });

        if (result.success) {
            navigate('/');
        } else {
            // Show specific error messages based on backend response
            if (result.error?.includes('email') || result.error?.includes('Email')) {
                setError('Email already exists. Please use a different email.');
            } else {
                setError(result.error || 'Registration failed');
            }
        }
    };

    const inputClass = `w-full px-4 py-3 bg-dark-900/50 border border-dark-600/50 rounded-xl text-gray-100
                       focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50
                       placeholder:text-gray-500 transition-all duration-300`;

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-dark-950 via-primary-950 to-dark-950"></div>
            <div className="absolute inset-0">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-500"></div>
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-cyan-500 rounded-2xl shadow-glow mb-4">
                        <Cog className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">GearGuard</h1>
                    <p className="text-gray-400 mt-2">Maintenance Management System</p>
                </div>

                {/* Signup Card */}
                <div className="bg-dark-800/60 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-dark-700/50">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-semibold text-white">Create Account</h2>
                        <p className="text-gray-400 mt-1">Join GearGuard today</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-sm text-rose-400">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                placeholder="John Smith"
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Email address
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                                placeholder="you@company.com"
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Role
                            </label>
                            <select
                                value={formData.role}
                                onChange={(e) => handleChange('role', e.target.value)}
                                className={`${inputClass} cursor-pointer`}
                            >
                                <option value="technician" className="bg-dark-800">Technician</option>
                                <option value="manager" className="bg-dark-800">Manager</option>
                                <option value="admin" className="bg-dark-800">Admin</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={(e) => handleChange('password', e.target.value)}
                                    placeholder="Create a password"
                                    className={`${inputClass} pr-12`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={formData.confirmPassword}
                                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                                    placeholder="Confirm your password"
                                    className={`${inputClass} pr-12`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-300 transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl font-semibold
                                     hover:from-primary-500 hover:to-primary-400 transition-all duration-300
                                     focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2 focus:ring-offset-dark-900
                                     disabled:opacity-50 disabled:cursor-not-allowed shadow-glow-sm hover:shadow-glow
                                     flex items-center justify-center gap-2 mt-6"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Creating account...
                                </>
                            ) : (
                                <>
                                    <UserPlus className="w-5 h-5" />
                                    Create Account
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-400">
                            Already have an account?{' '}
                            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>

                <p className="text-center text-gray-500 text-sm mt-6">
                    © 2024 GearGuard. All rights reserved.
                </p>
            </div>
        </div>
    );
};

export default Signup;
