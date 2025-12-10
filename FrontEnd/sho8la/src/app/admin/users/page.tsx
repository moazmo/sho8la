'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navbar } from '@/components/features/Navbar';
import { apiClient } from '@/lib/api';
import { Trash2, ShieldCheck, User, Filter } from 'lucide-react';

interface UserData {
    _id: string;
    name: string;
    email: string;
    role: string;
    verified: boolean;
    createdAt: string;
}

function UsersManagementContent() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [roleFilter, setRoleFilter] = useState('');

    const loadUsers = useCallback(async () => {
        setLoading(true);
        try {
            const query = roleFilter ? `?role=${roleFilter}` : '';
            const data = await apiClient.get(`/users/admin/all${query}`) as UserData[];
            setUsers(data);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    }, [roleFilter]);

    useEffect(() => { loadUsers(); }, [loadUsers]);

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this user?')) return;
        await apiClient.delete(`/users/admin/${id}`);
        loadUsers();
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                            aria-label="Filter by role"
                        >
                            <option value="">All Roles</option>
                            <option value="client">Clients</option>
                            <option value="freelancer">Freelancers</option>
                            <option value="student">Students</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                                    <th className="px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {users.map((user) => (
                                    <tr key={user._id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                                    <User className="w-4 h-4 text-gray-500" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{user.name}</p>
                                                    <p className="text-xs text-gray-500">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${user.role === 'admin' ? 'bg-red-100 text-red-700' :
                                                    user.role === 'client' ? 'bg-blue-100 text-blue-700' :
                                                        user.role === 'freelancer' ? 'bg-purple-100 text-purple-700' :
                                                            'bg-gray-100 text-gray-700'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {user.verified ? (
                                                <span className="flex items-center gap-1 text-green-600 text-xs">
                                                    <ShieldCheck className="w-3 h-3" /> Verified
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 text-xs">Unverified</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-500">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3">
                                            {user.role !== 'admin' && (
                                                <button
                                                    onClick={() => handleDelete(user._id)}
                                                    className="p-1 hover:bg-red-100 rounded text-red-500"
                                                    aria-label="Delete user"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {users.length === 0 && (
                            <p className="text-center py-8 text-gray-500">No users found</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function UsersManagement() {
    return (
        <ProtectedRoute requiredRole="admin">
            <UsersManagementContent />
        </ProtectedRoute>
    );
}
