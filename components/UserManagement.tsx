
import React, { useState } from 'react';
import Card from './Card';
import { useAuth } from '../contexts/AuthContext';
import { mockUsers } from '../constants';
import { Role } from '../types';
import type { User } from '../types';

const UserManagement: React.FC = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<User[]>(mockUsers);
    const [successMessage, setSuccessMessage] = useState('');

    const handleRoleChange = (userId: string, newRole: Role) => {
        setUsers(prevUsers =>
            prevUsers.map(user =>
                user.userId === userId ? { ...user, role: newRole } : user
            )
        );
        const updatedUser = users.find(u => u.userId === userId);
        if (updatedUser) {
            setSuccessMessage(`Updated ${updatedUser.name}'s role to ${newRole}.`);
            setTimeout(() => setSuccessMessage(''), 3000);
        }
    };

    if (currentUser?.role !== Role.Admin) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200">Access Denied</h1>
                <Card>
                    <p className="text-slate-600 dark:text-slate-400">You do not have permission to view this page. Please contact an administrator.</p>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200">User Management</h1>
                {successMessage && <p className="text-sm text-green-600 dark:text-green-400">{successMessage}</p>}
            </div>
            <Card>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                        <thead className="bg-slate-50 dark:bg-slate-700">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider dark:text-slate-400">User</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider dark:text-slate-400">Email</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider dark:text-slate-400">Role</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200 dark:bg-slate-800 dark:divide-slate-700">
                            {users.map((user) => (
                                <tr key={user.userId}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <img className="h-10 w-10 rounded-full" src={user.avatarUrl} alt={user.name} />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-slate-900 dark:text-slate-200">{user.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-slate-700 dark:text-slate-300">{user.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                        <select
                                            value={user.role}
                                            onChange={(e) => handleRoleChange(user.userId, e.target.value as Role)}
                                            disabled={user.userId === currentUser.userId}
                                            className="block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm text-slate-900 bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 dark:disabled:bg-slate-600 dark:disabled:text-slate-400"
                                            aria-label={`Role for ${user.name}`}
                                        >
                                            {Object.values(Role).map(role => (
                                                <option key={role} value={role} className="capitalize">{role.charAt(0).toUpperCase() + role.slice(1)}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default UserManagement;