import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const data = await login(email, password);
            if (data.user.role === 'doctor') {
                navigate('/doctor/dashboard');
            } else {
                navigate('/patient/dashboard');
            }
        } catch (err) {
            setError(err.message || 'Failed to login');
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
                    Sign in to your account
                </h2>
                <p className="mt-2 text-center text-sm text-brand-text-muted">
                    Welcome back to the Healthcare Platform
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-brand-card py-8 px-4 shadow-2xl shadow-black/50 sm:rounded-xl sm:px-10 border border-brand-border">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-900/30 border-l-4 border-red-500 p-4 mb-4 rounded-md">
                                <div className="flex">
                                    <div className="ml-3">
                                        <p className="text-sm text-red-200">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-brand-text-main">
                                Email address
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 bg-brand-bg border border-brand-border rounded-md shadow-sm placeholder-brand-text-muted/50 text-brand-text-main focus:outline-none focus:ring-brand-accent focus:border-brand-accent sm:text-sm transition-colors duration-200"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-brand-text-main">
                                Password
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 bg-brand-bg border border-brand-border rounded-md shadow-sm placeholder-brand-text-muted/50 text-brand-text-main focus:outline-none focus:ring-brand-accent focus:border-brand-accent sm:text-sm transition-colors duration-200"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-brand-accent/20 shadow-md text-sm font-medium text-white bg-brand-accent hover:bg-brand-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent transition-all duration-200 ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-lg'}`}
                            >
                                {isLoading ? 'Signing in...' : 'Sign in'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-brand-border" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-brand-card text-brand-text-muted">
                                    Don't have an account?
                                </span>
                            </div>
                        </div>

                        <div className="mt-6">
                            <Link
                                to="/register"
                                className="w-full flex justify-center py-2.5 px-4 border border-brand-border rounded-md shadow-sm text-sm font-medium text-brand-text-main bg-brand-bg hover:bg-brand-card-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent transition-all duration-200 hover:shadow-md"
                            >
                                Create new account
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
