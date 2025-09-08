
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { WalletIcon } from '../../icons/IconComponents';

interface SignUpProps {
    setAuthView: (view: 'login' | 'signup') => void;
}

const SignUp: React.FC<SignUpProps> = ({ setAuthView }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth(); // We'll just use login to simulate a successful signup

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        setError('');
        setIsLoading(true);
        try {
            // In a real app, you'd call a signup API endpoint.
            // Here, we just log in the user immediately.
            await login(email, password);
        } catch (err) {
            setError('Failed to sign up. Please try again.');
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
                        Create your HouseholdOS account
                    </h2>
                    <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
                        Or{' '}
                        <button onClick={() => setAuthView('login')} className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                           sign in to an existing account
                        </button>
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4 rounded-md shadow-sm bg-white p-8 border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Full Name
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                autoComplete="name"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
                            />
                        </div>
                        <div>
                            <label htmlFor="email-address-signup" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Email address
                            </label>
                            <input
                                id="email-address-signup"
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
                            <label htmlFor="password-signup" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Password
                            </label>
                            <input
                                id="password-signup"
                                name="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
                            />
                        </div>
                        <div>
                            <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Confirm Password
                            </label>
                            <input
                                id="confirm-password"
                                name="confirm-password"
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
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
                            {isLoading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SignUp;
