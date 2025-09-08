
import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { mockUser } from '../constants';
import type { User, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true); // To simulate initial auth check

    // Simulate checking for an existing session on component mount
    useEffect(() => {
        // In a real app, you might check localStorage for a token here.
        // For now, we'll just start logged out.
        setLoading(false);
    }, []);

    const login = async (email: string, password: string): Promise<void> => {
        // In a real app, this would be an API call.
        // We'll simulate a successful login with a short delay.
        console.log(`Attempting to log in with ${email} and ${password}`);
        return new Promise(resolve => {
            setTimeout(() => {
                setUser(mockUser);
                resolve();
            }, 1000);
        });
    };

    const logout = () => {
        setUser(null);
    };

    const value = { user, login, logout };

    // Don't render children until we've checked for auth, to prevent flicker
    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-slate-100 dark:bg-slate-900">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-slate-800 dark:border-slate-300"></div>
            </div>
        );
    }
    
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
