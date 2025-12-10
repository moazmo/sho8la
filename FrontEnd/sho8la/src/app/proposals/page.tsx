'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navbar } from '@/components/features/Navbar';
import { proposalsApi, jobsApi } from '@/lib/apiServices';
import { Briefcase, DollarSign, Calendar, CheckCircle, XCircle, Eye } from 'lucide-react';

interface Proposal {
  _id: string;
  jobId: { _id: string; title: string; budget: number; status: string; clientId?: string | { _id: string } };
  freelancerId?: { _id: string; name: string };
  bidAmount: number;
  deliveryDays: number;
  coverLetter?: string;
  status: string;
  createdAt: string;
}

function ProposalsContent() {
  const { user } = useAuth();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProposals = useCallback(async () => {
    if (!user?.id) return;
    try {
      if (user.role === 'freelancer') {
        const data = await proposalsApi.getMy() as Proposal[];
        setProposals(data);
      } else {
        // Client: get proposals for their jobs
        const jobs = await jobsApi.getAll() as { _id: string; clientId?: string | { _id: string } }[];
        const myJobIds = jobs
          .filter(j => (typeof j.clientId === 'string' ? j.clientId : j.clientId?._id) === user.id)
          .map(j => j._id);

        const allProposals: Proposal[] = [];
        for (const jobId of myJobIds) {
          const jobProposals = await proposalsApi.getForJob(jobId) as Proposal[];
          allProposals.push(...jobProposals.map(p => ({ ...p, jobId: { _id: jobId, title: '', budget: 0, status: '' } })));
        }
        setProposals(allProposals);
      }
    } catch (err) {
      console.error('Failed to load proposals:', err);
    }
    setLoading(false);
  }, [user?.id, user?.role]);

  useEffect(() => { loadProposals(); }, [loadProposals]);

  const handleAccept = async (id: string) => {
    try {
      await proposalsApi.accept(id);
      loadProposals();
    } catch (err) {
      alert('Failed to accept proposal');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await proposalsApi.reject(id);
      loadProposals();
    } catch (err) {
      alert('Failed to reject proposal');
    }
  };

  const statusStyles: Record<string, string> = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'accepted': 'bg-green-100 text-green-800',
    'rejected': 'bg-red-100 text-red-800',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {user?.role === 'freelancer' ? 'My Proposals' : 'Received Proposals'}
        </h1>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : proposals.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-gray-100 text-center">
            <Briefcase className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 mb-4">No proposals yet</p>
            {user?.role === 'freelancer' && (
              <Link href="/jobs" className="text-blue-600 hover:underline">Browse jobs to submit proposals</Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {proposals.map((p) => (
              <div key={p._id} className="bg-white p-6 rounded-xl border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900">{p.jobId?.title || 'Job'}</h3>
                    {user?.role === 'client' && p.freelancerId && (
                      <p className="text-sm text-gray-500">by {p.freelancerId.name}</p>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusStyles[p.status]}`}>
                    {p.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 py-4 border-y border-gray-100 mb-4">
                  <div>
                    <p className="text-xs text-gray-500">Bid</p>
                    <p className="font-bold flex items-center gap-1"><DollarSign className="w-4 h-4" />{p.bidAmount} EGP</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Delivery</p>
                    <p className="font-bold flex items-center gap-1"><Calendar className="w-4 h-4" />{p.deliveryDays} days</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Submitted</p>
                    <p className="font-bold">{new Date(p.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {p.coverLetter && <p className="text-sm text-gray-600 mb-4">{p.coverLetter}</p>}

                <div className="flex gap-2">
                  {p.jobId?._id && (
                    <Link href={`/jobs/${p.jobId._id}`} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm flex items-center gap-1">
                      <Eye className="w-4 h-4" /> View Job
                    </Link>
                  )}
                  {user?.role === 'client' && p.status === 'pending' && (
                    <>
                      <button onClick={() => handleAccept(p._id)} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" /> Accept
                      </button>
                      <button onClick={() => handleReject(p._id)} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm flex items-center gap-1">
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProposalsPage() {
  return (
    <ProtectedRoute>
      <ProposalsContent />
    </ProtectedRoute>
  );
}
