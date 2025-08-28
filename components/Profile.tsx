
import React, { useState } from 'react';
import Card from './Card';
import { useAuth } from '../contexts/AuthContext';

const Profile: React.FC = () => {
    const { user } = useAuth();
    const [name, setName] = useState(user.name);
    const [email, setEmail] = useState(user.email);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatarUrl);
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveChanges = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        // Simulate API call
        setTimeout(() => {
            console.log('Saved changes:', { name, email, avatar: avatarPreview });
            setIsSaving(false);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        }, 1500);
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200">My Profile</h1>
            <Card>
                <form onSubmit={handleSaveChanges} className="space-y-8">
                    <div className="flex items-center space-x-6">
                        <img src={avatarPreview || 'https://picsum.photos/seed/placeholder/100/100'} alt="User Avatar" className="w-24 h-24 rounded-full object-cover" />
                        <div>
                            <label htmlFor="avatar-upload" className="cursor-pointer bg-slate-800 text-white font-semibold py-2 px-4 rounded-lg hover:bg-slate-700 transition-colors dark:bg-indigo-600 dark:hover:bg-indigo-500">
                                Upload new photo
                            </label>
                            <input type="file" id="avatar-upload" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                            <p className="text-xs text-slate-500 mt-2 dark:text-slate-400">Recommended size: 200x200px. JPG, PNG, or GIF.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1 dark:text-slate-300">Full Name</label>
                            <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"/>
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1 dark:text-slate-300">Email Address</label>
                            <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"/>
                        </div>
                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-slate-700 mb-1 dark:text-slate-300">Role</label>
                            <input type="text" id="role" value={user.role.charAt(0).toUpperCase() + user.role.slice(1)} disabled className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-md shadow-sm cursor-not-allowed text-slate-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-400"/>
                        </div>
                    </div>
                    
                    <div className="border-t border-slate-200 pt-6 flex items-center justify-end gap-4 dark:border-slate-700">
                         {showSuccess && <p className="text-sm text-green-600 dark:text-green-400">Changes saved successfully!</p>}
                        <button type="submit" disabled={isSaving} className="bg-slate-800 text-white font-semibold py-2 px-6 rounded-lg hover:bg-slate-700 transition-colors disabled:bg-slate-400 dark:bg-indigo-600 dark:hover:bg-indigo-500 dark:disabled:bg-slate-500">
                           {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default Profile;