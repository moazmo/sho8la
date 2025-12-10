'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navbar } from '@/components/features/Navbar';
import { apiClient } from '@/lib/api';
import { Users, ShieldCheck, DollarSign, Briefcase, UserCheck, Clock } from 'lucide-react';

interface Stats {
    totalUsers: number;
    clients: number;
    freelancers: number;
    students: number;
    verified: number;
    pendingVerifications: number;
}

function AdminDashboardContent() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiClient.get('/users/admin/stats')
            .then((data) => setStats(data as Stats))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const cards = [
        { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'text-blue-500' },
        { label: 'Clients', value: stats?.clients || 0, icon: Briefcase, color: 'text-green-500' },
        { label: 'Freelancers', value: stats?.freelancers || 0, icon: UserCheck, color: 'text-purple-500' },
        { label: 'Students', value: stats?.students || 0, icon: Users, color: 'text-orange-500' },
        { label: 'Verified', value: stats?.verified || 0, icon: ShieldCheck, color: 'text-emerald-500' },
        { label: 'Pending', value: stats?.pendingVerifications || 0, icon: Clock, color: 'text-yellow-500' },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                            {cards.map(({ label, value, icon: Icon, color }) => (
                                <div key={label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                                    <Icon className={`w-6 h-6 ${color} mb-2`} />
                                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                                    <p className="text-xs text-gray-500">{label}</p>
                                </div>
                            ))}
                        </div>

                        <div className="grid md:grid-cols-3 gap-4">
                            <Link href="/admin/verify" className="bg-white rounded-xl p-6 border border-gray-100 hover:border-blue-300 transition group">
                                <ShieldCheck className="w-8 h-8 text-blue-500 mb-3 group-hover:scale-110 transition" />
                                <h3 className="font-semibold text-gray-900 mb-1">Verify Users</h3>
                                <p className="text-sm text-gray-500">Review student ID submissions</p>
                                {stats?.pendingVerifications ? (
                                    <span className="inline-block mt-2 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded">
                                        {stats.pendingVerifications} pending
                                    </span>
                                ) : null}
                            </Link>

                            <Link href="/admin/payouts" className="bg-white rounded-xl p-6 border border-gray-100 hover:border-green-300 transition group">
                                <DollarSign className="w-8 h-8 text-green-500 mb-3 group-hover:scale-110 transition" />
                                <h3 className="font-semibold text-gray-900 mb-1">Manage Payouts</h3>
                                <p className="text-sm text-gray-500">Approve withdrawal requests</p>
                            </Link>

                            <Link href="/admin/users" className="bg-white rounded-xl p-6 border border-gray-100 hover:border-purple-300 transition group">
                                <Users className="w-8 h-8 text-purple-500 mb-3 group-hover:scale-110 transition" />
                                <h3 className="font-semibold text-gray-900 mb-1">Manage Users</h3>
                                <p className="text-sm text-gray-500">View and manage all users</p>
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default function AdminDashboard() {
    return (
        <ProtectedRoute requiredRole="admin">
            <AdminDashboardContent />
        </ProtectedRoute>
    );
}
