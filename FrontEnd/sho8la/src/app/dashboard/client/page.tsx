'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navbar } from '@/components/features/Navbar';
import { FileText, Eye, ShieldCheck } from 'lucide-react';
import { jobsApi, proposalsApi } from '@/lib/apiServices';

interface Job {
  _id: string;
  title: string;
  budget: number;
  status: string;
  clientId?: string | { _id: string };
  createdAt: string;
}

interface Proposal {
  _id: string;
  jobId: string;
}

function ClientDashboardContent() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [proposalCounts, setProposalCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    try {
      const allJobs = await jobsApi.getAll() as Job[];
      const myJobs = allJobs.filter((j) => {
        const clientId = typeof j.clientId === 'string' ? j.clientId : j.clientId?._id;
        return clientId === user.id;
      });
      setJobs(myJobs);

      const counts: Record<string, number> = {};
      for (const job of myJobs) {
        try {
          const proposals = await proposalsApi.getForJob(job._id) as Proposal[];
          counts[job._id] = proposals.length;
        } catch {
          counts[job._id] = 0;
        }
      }
      setProposalCounts(counts);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    }
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const activeJobs = jobs.filter(j => j.status === 'open').length;
  const totalProposals = Object.values(proposalCounts).reduce((sum, c) => sum + c, 0);
  const totalBudget = jobs.reduce((sum, j) => sum + j.budget, 0);

  const statusStyles: Record<string, string> = {
    'open': 'bg-green-100 text-green-700',
    'in-progress': 'bg-blue-100 text-blue-700',
    'completed': 'bg-gray-100 text-gray-700',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Client Dashboard</h1>
            <p className="text-gray-500 mt-1 flex items-center gap-2">
              Welcome, {user?.name}
              {user?.verified && <ShieldCheck className="w-4 h-4 text-green-500" />}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Link href="/post-job" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition shadow-md text-center">
            + Post a New Job
          </Link>
          <Link href="/jobs" className="bg-white border border-gray-200 hover:border-gray-300 text-gray-900 font-semibold py-4 px-6 rounded-xl transition text-center">
            Browse Freelancers
          </Link>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <p className="text-gray-500 text-sm mb-1">Active Jobs</p>
            <p className="text-2xl font-bold text-gray-900">{activeJobs}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <p className="text-gray-500 text-sm mb-1">Total Proposals</p>
            <p className="text-2xl font-bold text-gray-900">{totalProposals}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <p className="text-gray-500 text-sm mb-1">Total Jobs</p>
            <p className="text-2xl font-bold text-gray-900">{jobs.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <p className="text-gray-500 text-sm mb-1">Total Budget</p>
            <p className="text-2xl font-bold text-gray-900">{totalBudget} EGP</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : jobs.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Your Jobs</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {jobs.map((job) => (
                <div key={job._id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{job.title}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="text-gray-900 font-medium">{job.budget} EGP</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${statusStyles[job.status] || 'bg-gray-100'}`}>
                        {job.status}
                      </span>
                      <span>{proposalCounts[job._id] || 0} proposals</span>
                    </div>
                  </div>
                  <Link href={`/jobs/${job._id}`} className="p-2 hover:bg-gray-100 rounded-lg">
                    <Eye className="w-4 h-4 text-gray-600" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs yet</h3>
            <p className="text-gray-500 mb-6">Post your first job to start finding freelancers</p>
            <Link href="/post-job" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg">
              Post a Job
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ClientDashboard() {
  return (
    <ProtectedRoute requiredRole="client">
      <ClientDashboardContent />
    </ProtectedRoute>
  );
}
