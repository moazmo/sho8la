'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navbar } from '@/components/features/Navbar';
import { Briefcase, DollarSign, TrendingUp, Award, ShieldCheck, Eye } from 'lucide-react';
import { proposalsApi, walletApi } from '@/lib/apiServices';

interface Proposal {
  _id: string;
  jobId: { _id: string; title: string; budget: number; status: string };
  bidAmount: number;
  status: string;
  createdAt: string;
}

interface Wallet {
  balance: number;
  totalEarned: number;
}

function FreelancerDashboardContent() {
  const { user } = useAuth();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [wallet, setWallet] = useState<Wallet>({ balance: 0, totalEarned: 0 });
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [proposalsData, walletData] = await Promise.all([
        proposalsApi.getMy() as Promise<Proposal[]>,
        walletApi.getWallet().catch(() => ({ balance: 0, totalEarned: 0, totalSpent: 0, transactions: [] }))
      ]);
      setProposals(proposalsData || []);
      setWallet(walletData as Wallet);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user?.id, loadData]);

  const acceptedProposals = proposals.filter(p => p.status === 'accepted').length;
  const pendingProposals = proposals.filter(p => p.status === 'pending').length;

  const statusStyles: Record<string, string> = {
    'pending': 'bg-yellow-100 text-yellow-700',
    'accepted': 'bg-green-100 text-green-700',
    'rejected': 'bg-red-100 text-red-700',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Freelancer Dashboard</h1>
          <p className="text-gray-500 mt-1 flex items-center gap-2">
            Welcome, {user?.name}
            {user?.verified && <ShieldCheck className="w-4 h-4 text-green-500" />}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Link href="/jobs" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition shadow-md text-center">
            Browse Jobs
          </Link>
          <Link href="/wallet" className="bg-white border border-gray-200 hover:border-gray-300 text-gray-900 font-semibold py-4 px-6 rounded-xl transition text-center">
            View Wallet
          </Link>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">Pending Proposals</p>
                <p className="text-2xl font-bold text-gray-900">{pendingProposals}</p>
              </div>
              <Briefcase className="w-8 h-8 text-blue-100" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">Accepted</p>
                <p className="text-2xl font-bold text-green-600">{acceptedProposals}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-100" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">Wallet Balance</p>
                <p className="text-2xl font-bold text-gray-900">{wallet.balance} EGP</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-100" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">Total Earned</p>
                <p className="text-2xl font-bold text-gray-900">{wallet.totalEarned} EGP</p>
              </div>
              <Award className="w-8 h-8 text-yellow-100" />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : proposals.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">My Proposals</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {proposals.slice(0, 5).map((proposal) => (
                <div key={proposal._id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{proposal.jobId?.title || 'Job'}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="text-gray-900 font-medium">{proposal.bidAmount} EGP</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${statusStyles[proposal.status] || 'bg-gray-100'}`}>
                        {proposal.status}
                      </span>
                    </div>
                  </div>
                  {proposal.jobId?._id && (
                    <Link href={`/jobs/${proposal.jobId._id}`} className="p-2 hover:bg-gray-100 rounded-lg">
                      <Eye className="w-4 h-4 text-gray-600" />
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No proposals yet</h3>
            <p className="text-gray-500 mb-6">Browse jobs and submit proposals to get started</p>
            <Link href="/jobs" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg">
              Browse Jobs
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function FreelancerDashboard() {
  return (
    <ProtectedRoute requiredRole="freelancer">
      <FreelancerDashboardContent />
    </ProtectedRoute>
  );
}
