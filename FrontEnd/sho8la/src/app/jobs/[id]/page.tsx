'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/features/Navbar';
import { jobsApi, proposalsApi, completionApi } from '@/lib/apiServices';
import { ChevronLeft, Clock, Banknote, ShieldCheck, Send, CheckCircle, XCircle, Package, MessageCircle } from 'lucide-react';

interface Job {
  _id: string;
  title: string;
  description: string;
  budget: number;
  category: string;
  skills: string[];
  status: string;
  freelancerId?: string;
  clientId: { _id: string; name: string; verified?: boolean };
  createdAt: string;
}

interface Proposal {
  _id: string;
  freelancerId: { _id: string; name: string; verified?: boolean };
  bidAmount: number;
  deliveryDays: number;
  coverLetter?: string;
  status: string;
}

interface Completion {
  _id: string;
  deliverables: string;
  status: string;
  submittedAt: string;
}

export default function JobDetailsPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [showSubmitWork, setShowSubmitWork] = useState(false);
  const [form, setForm] = useState({ bidAmount: '', deliveryDays: '', coverLetter: '', deliverables: '' });
  const [submitting, setSubmitting] = useState(false);

  const isOwner = job?.clientId?._id === user?.id;
  const isAssigned = job?.freelancerId === user?.id;
  const hasApplied = proposals.some(p => p.freelancerId?._id === user?.id);

  const loadJob = useCallback(async () => {
    try {
      const data = await jobsApi.getById(params.id as string) as Job;
      setJob(data);
      const [props, comps] = await Promise.all([
        proposalsApi.getForJob(data._id) as Promise<Proposal[]>,
        completionApi.getForJob(data._id).catch(() => []) as Promise<Completion[]>
      ]);
      setProposals(props);
      setCompletions(comps);
    } catch { router.push('/jobs'); }
    setLoading(false);
  }, [params.id, router]);

  useEffect(() => { loadJob(); }, [loadJob]);

  const handleSubmitProposal = async () => {
    if (!form.bidAmount || !form.deliveryDays) return;
    setSubmitting(true);
    try {
      await proposalsApi.submit({ jobId: job!._id, bidAmount: Number(form.bidAmount), deliveryDays: Number(form.deliveryDays), coverLetter: form.coverLetter });
      setShowProposalForm(false);
      loadJob();
    } catch { alert('Failed'); }
    setSubmitting(false);
  };

  const handleSubmitWork = async () => {
    if (!form.deliverables) return;
    setSubmitting(true);
    try {
      await completionApi.submit({ jobId: job!._id, deliverables: form.deliverables });
      setShowSubmitWork(false);
      setForm({ ...form, deliverables: '' });
      loadJob();
    } catch { alert('Failed'); }
    setSubmitting(false);
  };

  const handleProposalAction = async (id: string, action: 'accept' | 'reject') => {
    try {
      if (action === 'accept') await proposalsApi.accept(id);
      else await proposalsApi.reject(id);
      loadJob();
    } catch { alert('Failed'); }
  };

  const handleCompletionAction = async (id: string, action: 'approve' | 'revision') => {
    try {
      if (action === 'approve') await completionApi.approve(id);
      else await completionApi.revision(id, 'Please revise');
      loadJob();
    } catch { alert('Failed'); }
  };

  if (loading) return <div className="min-h-screen bg-gray-50"><Navbar /><div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div></div>;
  if (!job) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />
      <div className="bg-white border-b"><div className="max-w-5xl mx-auto px-4 py-4"><Link href="/jobs" className="text-gray-500 hover:text-blue-600 flex items-center gap-1 text-sm"><ChevronLeft className="w-4 h-4" /> Back</Link></div></div>

      <div className="max-w-5xl mx-auto px-4 mt-8 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border p-6">
            <div className="flex justify-between items-start">
              <div><h1 className="text-2xl font-bold text-gray-900">{job.title}</h1><p className="text-blue-600 mt-1">{job.category}</p></div>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${job.status === 'open' ? 'bg-green-100 text-green-700' : job.status === 'in-progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>{job.status}</span>
            </div>
            <p className="mt-4 text-sm text-gray-500 flex items-center gap-1"><Clock className="w-4 h-4" /> {new Date(job.createdAt).toLocaleDateString()}</p>
          </div>

          <div className="bg-white rounded-xl border p-6"><h2 className="font-bold mb-3">Description</h2><p className="text-gray-600 whitespace-pre-line">{job.description}</p></div>

          {job.skills?.length > 0 && (
            <div className="bg-white rounded-xl border p-6"><h2 className="font-bold mb-3">Skills</h2><div className="flex flex-wrap gap-2">{job.skills.map((s, i) => <span key={i} className="bg-blue-50 text-blue-700 px-3 py-1 rounded text-sm">{s}</span>)}</div></div>
          )}

          {isOwner && proposals.length > 0 && (
            <div className="bg-white rounded-xl border p-6">
              <h2 className="font-bold mb-4">Proposals ({proposals.length})</h2>
              {proposals.map(p => (
                <div key={p._id} className="border rounded-lg p-4 mb-3">
                  <div className="flex justify-between mb-2">
                    <div><p className="font-semibold">{p.freelancerId?.name}</p><p className="text-sm text-gray-500">{p.bidAmount} EGP • {p.deliveryDays}d</p></div>
                    <span className={`px-2 py-1 h-fit rounded text-xs capitalize ${p.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : p.status === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{p.status}</span>
                  </div>
                  {p.status === 'pending' && <div className="flex gap-2 mt-2"><button onClick={() => handleProposalAction(p._id, 'accept')} className="px-3 py-1 bg-green-600 text-white rounded text-sm"><CheckCircle className="w-4 h-4 inline" /> Accept</button><button onClick={() => handleProposalAction(p._id, 'reject')} className="px-3 py-1 bg-red-600 text-white rounded text-sm"><XCircle className="w-4 h-4 inline" /> Reject</button></div>}
                </div>
              ))}
            </div>
          )}

          {(isOwner || isAssigned) && completions.length > 0 && (
            <div className="bg-white rounded-xl border p-6">
              <h2 className="font-bold mb-4">Submitted Work</h2>
              {completions.map(c => (
                <div key={c._id} className="border rounded-lg p-4 mb-3">
                  <p className="text-gray-700 mb-2">{c.deliverables}</p>
                  <div className="flex justify-between items-center">
                    <span className={`px-2 py-1 rounded text-xs capitalize ${c.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : c.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{c.status}</span>
                    {isOwner && c.status === 'pending' && <div className="flex gap-2"><button onClick={() => handleCompletionAction(c._id, 'approve')} className="px-3 py-1 bg-green-600 text-white rounded text-sm">Approve & Pay</button><button onClick={() => handleCompletionAction(c._id, 'revision')} className="px-3 py-1 bg-orange-600 text-white rounded text-sm">Request Revision</button></div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="bg-white rounded-xl border p-6 sticky top-8">
            <p className="text-sm text-gray-500 mb-1">Budget</p>
            <p className="text-2xl font-bold flex items-center gap-2 mb-6"><Banknote className="w-6 h-6 text-green-600" /> {job.budget} EGP</p>

            {user?.role === 'freelancer' && job.status === 'open' && !hasApplied && !showProposalForm && (
              <button onClick={() => setShowProposalForm(true)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2"><Send className="w-5 h-5" /> Apply</button>
            )}

            {hasApplied && job.status === 'open' && <p className="text-center text-green-600 py-3">✓ Applied</p>}

            {isAssigned && job.status === 'in-progress' && !showSubmitWork && (
              <button onClick={() => setShowSubmitWork(true)} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 mb-3"><Package className="w-5 h-5" /> Submit Work</button>
            )}

            {(isOwner || isAssigned) && job.status === 'in-progress' && (
              <Link href={`/messages?convo=job_${job._id}`} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold py-3 rounded-lg flex items-center justify-center gap-2 mb-3"><MessageCircle className="w-5 h-5" /> Message</Link>
            )}

            {showProposalForm && (
              <div className="space-y-3">
                <input type="number" placeholder="Bid (EGP)" value={form.bidAmount} onChange={e => setForm({ ...form, bidAmount: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                <input type="number" placeholder="Days" value={form.deliveryDays} onChange={e => setForm({ ...form, deliveryDays: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                <textarea placeholder="Cover letter" value={form.coverLetter} onChange={e => setForm({ ...form, coverLetter: e.target.value })} className="w-full px-3 py-2 border rounded-lg h-20" />
                <button onClick={handleSubmitProposal} disabled={submitting} className="w-full bg-blue-600 text-white py-2 rounded-lg disabled:bg-gray-400">{submitting ? 'Sending...' : 'Submit'}</button>
                <button onClick={() => setShowProposalForm(false)} className="w-full bg-gray-200 py-2 rounded-lg">Cancel</button>
              </div>
            )}

            {showSubmitWork && (
              <div className="space-y-3">
                <textarea placeholder="Describe your deliverables..." value={form.deliverables} onChange={e => setForm({ ...form, deliverables: e.target.value })} className="w-full px-3 py-2 border rounded-lg h-24" />
                <button onClick={handleSubmitWork} disabled={submitting} className="w-full bg-green-600 text-white py-2 rounded-lg disabled:bg-gray-400">{submitting ? 'Sending...' : 'Submit Work'}</button>
                <button onClick={() => setShowSubmitWork(false)} className="w-full bg-gray-200 py-2 rounded-lg">Cancel</button>
              </div>
            )}

            {isOwner && <p className="text-center text-gray-500 py-3">Your job listing</p>}
            {!user && <Link href="/login" className="w-full block text-center bg-blue-600 text-white font-bold py-3 rounded-lg">Login to Apply</Link>}

            <div className="mt-6 pt-6 border-t"><p className="text-sm font-medium">{job.clientId?.name}</p><p className="text-xs text-gray-500">{job.clientId?.verified && '✓ Verified'}</p></div>
          </div>
        </div>
      </div>
    </div>
  );
}