'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navbar } from '@/components/features/Navbar';
import { completionUtils, type JobCompletion } from '@/lib/completion';
import { CheckCircle, XCircle, FileCheck, AlertCircle } from 'lucide-react';

function CompletionContent() {
  const { user } = useAuth();
  const [completions, setCompletions] = useState<JobCompletion[]>([]);
  const [selectedTab, setSelectedTab] = useState<'submitted' | 'pending' | 'approved'>('pending');
  const [feedback, setFeedback] = useState('');
  const [showRejectForm, setShowRejectForm] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      const data = user.role === 'freelancer' 
        ? completionUtils.getFreelancerCompletions(user.id)
        : completionUtils.getClientPendingCompletions(user.id);
      setCompletions(data);
    }
  }, [user?.id, user?.role]);

  const handleApprove = (completionId: string) => {
    if (user?.id) {
      completionUtils.approveCompletion(completionId, user.id);
      setCompletions(completionUtils.getClientPendingCompletions(user.id));
    }
  };

  const handleReject = (completionId: string, fb: string) => {
    if (user?.id) {
      completionUtils.rejectCompletion(completionId, user.id, fb);
      setCompletions(completionUtils.getClientPendingCompletions(user.id));
      setShowRejectForm(null);
      setFeedback('');
    }
  };

  const filteredCompletions = completions.filter((c) => c.status === (selectedTab === 'submitted' ? 'pending' : selectedTab));

  if (user?.role === 'freelancer') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Job Completions</h1>
        
        {completions.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-gray-100 text-center">
            <FileCheck className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p className="text-gray-500">No completions yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {completions.map((comp) => (
              <div key={comp.id} className="bg-white p-6 rounded-xl border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{comp.jobTitle}</h3>
                    <p className="text-sm text-gray-500">Submitted {new Date(comp.submittedAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    comp.status === 'approved' ? 'bg-green-100 text-green-700' : 
                    comp.status === 'rejected' ? 'bg-red-100 text-red-700' : 
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {comp.status.charAt(0).toUpperCase() + comp.status.slice(1)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-4">{comp.deliverables}</p>
                {comp.clientFeedback && (
                  <p className="text-sm text-red-600 italic">Feedback: {comp.clientFeedback}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Review Job Completions</h1>
      
      <div className="flex gap-4 mb-8">
        {(['pending', 'approved'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              selectedTab === tab
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)} ({filteredCompletions.length})
          </button>
        ))}
      </div>

      {filteredCompletions.length === 0 ? (
        <div className="bg-white p-8 rounded-xl border border-gray-100 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-2 text-gray-400" />
          <p className="text-gray-500">No {selectedTab} completions</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCompletions.map((comp) => (
            <div key={comp.id} className="bg-white p-6 rounded-xl border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">{comp.jobTitle}</h3>
                  <p className="text-sm text-gray-500">Submitted {new Date(comp.submittedAt).toLocaleDateString()}</p>
                </div>
                {selectedTab === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(comp.id)}
                      className="flex items-center gap-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => setShowRejectForm(comp.id)}
                      className="flex items-center gap-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-4">{comp.deliverables}</p>

              {showRejectForm === comp.id && (
                <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Feedback</label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Explain what needs to be fixed..."
                    className="w-full px-4 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-600 outline-none mb-3"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReject(comp.id, feedback)}
                      className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition"
                    >
                      Send Rejection
                    </button>
                    <button
                      onClick={() => setShowRejectForm(null)}
                      className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold rounded-lg transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CompletionPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <CompletionContent />
      </div>
    </ProtectedRoute>
  );
}
