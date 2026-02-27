import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, User, Stethoscope } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'patient', // default
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRoleSelect = (selectedRole) => {
        setFormData({ ...formData, role: selectedRole });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Note: mapping our state to the exact expected properties in backend
            const dataToSubmit = {
                first_name: formData.firstName,
                last_name: formData.lastName,
                email: formData.email,
                password: formData.password,
                role: formData.role
            };

            await register(dataToSubmit);
            // Automatically redirect to login with a neat UX transition
            navigate('/login', { state: { message: 'Registration successful! Please login.' } });
        } catch (err) {
            setError(err.message || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-brand-bg flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="h-16 w-16 bg-brand-accent rounded-full flex items-center justify-center shadow-lg shadow-brand-accent/30">
                        <Activity className="h-8 w-8 text-white" />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-brand-text-main">
                    Join the Platform
                </h2>
                <p className="mt-2 text-center text-sm text-brand-text-muted">
                    Create a new account
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-brand-card py-8 px-4 shadow-2xl shadow-black/50 sm:rounded-xl sm:px-10 border border-brand-border">

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-brand-text-main mb-3 text-center">
                            I am a...
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <div
                                onClick={() => handleRoleSelect('patient')}
                                className={`cursor-pointer border rounded-lg p-4 flex flex-col items-center justify-center transition-all duration-200 ${formData.role === 'patient'
                                    ? 'border-brand-accent bg-brand-accent/10 ring-2 ring-brand-accent/30'
                                    : 'border-brand-border hover:border-brand-accent/50 hover:bg-brand-card-hover'
                                    }`}
                            >
                                <User className={`h-8 w-8 mb-2 ${formData.role === 'patient' ? 'text-brand-accent' : 'text-brand-text-muted'}`} />
                                <span className={`font-medium ${formData.role === 'patient' ? 'text-brand-accent' : 'text-brand-text-muted'}`}>Patient</span>
                            </div>

                            <div
                                onClick={() => handleRoleSelect('doctor')}
                                className={`cursor-pointer border rounded-lg p-4 flex flex-col items-center justify-center transition-all duration-200 ${formData.role === 'doctor'
                                    ? 'border-brand-accent bg-brand-accent/10 ring-2 ring-brand-accent/30'
                                    : 'border-brand-border hover:border-brand-accent/50 hover:bg-brand-card-hover'
                                    }`}
                            >
                                <Stethoscope className={`h-8 w-8 mb-2 ${formData.role === 'doctor' ? 'text-brand-accent' : 'text-brand-text-muted'}`} />
                                <span className={`font-medium ${formData.role === 'doctor' ? 'text-brand-accent' : 'text-brand-text-muted'}`}>Doctor</span>
                            </div>
                        </div>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-900/30 border-l-4 border-red-500 p-4 rounded-md">
                                <p className="text-sm text-red-200">{error}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="firstName" className="block text-sm font-medium text-brand-text-main">First name</label>
                                <div className="mt-1">
                                    <input
                                        id="firstName"
                                        name="firstName"
                                        type="text"
                                        required
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        className="appearance-none block w-full px-3 py-2 bg-brand-bg border border-brand-border rounded-md shadow-sm placeholder-brand-text-muted/50 text-brand-text-main focus:outline-none focus:ring-brand-accent focus:border-brand-accent sm:text-sm transition-colors duration-200"
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="lastName" className="block text-sm font-medium text-brand-text-main">Last name</label>
                                <div className="mt-1">
                                    <input
                                        id="lastName"
                                        name="lastName"
                                        type="text"
                                        required
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        className="appearance-none block w-full px-3 py-2 bg-brand-bg border border-brand-border rounded-md shadow-sm placeholder-brand-text-muted/50 text-brand-text-main focus:outline-none focus:ring-brand-accent focus:border-brand-accent sm:text-sm transition-colors duration-200"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-brand-text-main">Email address</label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="appearance-none block w-full px-3 py-2 bg-brand-bg border border-brand-border rounded-md shadow-sm placeholder-brand-text-muted/50 text-brand-text-main focus:outline-none focus:ring-brand-accent focus:border-brand-accent sm:text-sm transition-colors duration-200"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-brand-text-main">Password</label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="appearance-none block w-full px-3 py-2 bg-brand-bg border border-brand-border rounded-md shadow-sm placeholder-brand-text-muted/50 text-brand-text-main focus:outline-none focus:ring-brand-accent focus:border-brand-accent sm:text-sm transition-colors duration-200"
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-brand-accent/20 shadow-md text-sm font-medium text-white bg-brand-accent hover:bg-brand-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent transition-all duration-200 ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-lg'}`}
                            >
                                {isLoading ? 'Creating account...' : `Sign up as ${formData.role === 'doctor' ? 'Doctor' : 'Patient'}`}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-brand-text-muted">
                            Already have an account?{' '}
                            <Link to="/login" className="font-medium text-brand-accent hover:text-brand-text-main transition-colors">
                                Sign in instead
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
