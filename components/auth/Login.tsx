
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { WalletIcon } from '../../icons/IconComponents';

interface LoginProps {
    setAuthView: (view: 'login' | 'signup') => void;
}

const Login: React.FC<LoginProps> = ({ setAuthView }) => {
    const [email, setEmail] = useState('alex.doe@example.com');
    const [password, setPassword] = useState('password123');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await login(email, password);
            // No need to redirect, App.tsx will handle the re-render
        } catch (err) {
            setError('Failed to log in. Please check your credentials.');
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col justify-center items-center bg-slate-100 py-12 px-4 sm:px-6 lg:px-8 dark:bg-slate-900">
            <div className="w-full max-w-md space-y-8">
                <div>
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-lg bg-slate-800 dark:bg-indigo-600">
                        <WalletIcon className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                        Sign in to HouseholdOS
                    </h2>
                    <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
                        Or{' '}
                        <button onClick={() => setAuthView('signup')} className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                            create a new account
                        </button>
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4 rounded-md shadow-sm bg-white p-8 border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                        <div>
                            <label htmlFor="email-address" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Email address
                            </label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
                            />
                        </div>
                        <div>
                            <label htmlFor="password"className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
                            />
                        </div>
                         {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative flex w-full justify-center rounded-md border border-transparent bg-slate-800 py-3 px-4 text-sm font-semibold text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-slate-400 dark:bg-indigo-600 dark:hover:bg-indigo-500 dark:disabled:bg-slate-500"
                        >
                            {isLoading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
