import React, { useState } from 'react';
import Card from './Card';
import { useTheme } from '../services/ThemeContext';

const Settings: React.FC = () => {
    const { theme, toggleTheme } = useTheme();
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [pushNotifications, setPushNotifications] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleSaveChanges = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setTimeout(() => {
            console.log('Saved preferences:', { isDarkMode: theme === 'dark', emailNotifications, pushNotifications });
            setIsSaving(false);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        }, 1500);
    };
    
    const Toggle: React.FC<{ checked: boolean; onChange: () => void }> = ({ checked, onChange }) => (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={onChange}
            className={`${checked ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
        >
            <span
                aria-hidden="true"
                className={`${checked ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
            />
        </button>
    );

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200">Settings</h1>
            
            <form onSubmit={handleSaveChanges}>
                <div className="space-y-6">
                    <Card title="Preferences">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h4 className="font-medium text-slate-800 dark:text-slate-200">Dark Mode</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Enable a darker theme for the application.</p>
                                </div>
                                <Toggle checked={theme === 'dark'} onChange={toggleTheme} />
                            </div>
                            <div className="border-t border-slate-200 dark:border-slate-700"></div>
                            <div className="flex justify-between items-center">
                                <div>
                                    <h4 className="font-medium text-slate-800 dark:text-slate-200">Email Notifications</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Receive summaries and alerts via email.</p>
                                </div>
                                <Toggle checked={emailNotifications} onChange={() => setEmailNotifications(prev => !prev)} />
                            </div>
                            <div className="border-t border-slate-200 dark:border-slate-700"></div>
                            <div className="flex justify-between items-center">
                                <div>
                                    <h4 className="font-medium text-slate-800 dark:text-slate-200">Push Notifications</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Get notified directly in your browser.</p>
                                </div>
                                <Toggle checked={pushNotifications} onChange={() => setPushNotifications(prev => !prev)} />
                            </div>
                        </div>
                    </Card>

                    <div className="flex items-center justify-end gap-4">
                        {showSuccess && <p className="text-sm text-green-600 dark:text-green-400">Preferences saved successfully!</p>}
                        <button type="submit" disabled={isSaving} className="bg-slate-800 text-white font-semibold py-2 px-6 rounded-lg hover:bg-slate-700 transition-colors disabled:bg-slate-400 dark:bg-indigo-600 dark:hover:bg-indigo-500 dark:disabled:bg-slate-500">
                            {isSaving ? 'Saving...' : 'Save Preferences'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default Settings;