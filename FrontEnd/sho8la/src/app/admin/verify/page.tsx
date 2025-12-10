'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/features/Navbar';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { apiClient } from '@/lib/api';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface Verification {
  _id: string;
  userId: { _id: string; name: string; email: string; role: string };
  verificationType: string;
  university?: string;
  studentId?: string;
  nationalId?: string;
  documentUrl?: string;
  submittedAt: string;
}

function AdminVerificationsContent() {
  const [pending, setPending] = useState<Verification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showReject, setShowReject] = useState<string | null>(null);

  const loadPending = async () => {
    try {
      const data = await apiClient.get('/verifications/admin/pending') as Verification[];
      setPending(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => { loadPending(); }, []);

  const handleApprove = async (id: string) => {
    try {
      await apiClient.put(`/verifications/${id}/approve`, {});
      loadPending();
      setSelectedId(null);
    } catch (err) {
      alert('Failed to approve');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await apiClient.put(`/verifications/${id}/reject`, { rejectionReason: rejectReason });
      loadPending();
      setShowReject(null);
      setRejectReason('');
    } catch (err) {
      alert('Failed to reject');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      </div>
    );
  }

  if (pending.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Verify Submissions</h1>
          <div className="bg-white p-8 rounded-xl border border-gray-100 text-center">
            <Clock className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p className="text-gray-500">No pending verifications</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Verify ID Submissions ({pending.length})</h1>

        <div className="space-y-4">
          {pending.map((v) => (
            <div key={v._id} className="bg-white p-6 rounded-xl border border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500">Name</p>
                  <p className="font-semibold text-gray-900">{v.userId?.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Type</p>
                  <p className="font-semibold text-gray-900">{v.verificationType}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">{v.verificationType === 'student_id' ? 'University' : 'National ID'}</p>
                  <p className="font-semibold text-gray-900">{v.university || v.nationalId}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Submitted</p>
                  <p className="font-semibold text-gray-900">{new Date(v.submittedAt).toLocaleDateString()}</p>
                </div>
              </div>

              {selectedId === v._id ? (
                <div className="mt-4 space-y-3 p-4 bg-gray-50 rounded-lg">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(v._id)}
                      className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" /> Approve
                    </button>
                    <button
                      onClick={() => setShowReject(v._id)}
                      className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  </div>
                </div>
              ) : showReject === v._id ? (
                <div className="mt-4 space-y-3 p-4 bg-red-50 rounded-lg border border-red-200">
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Why are you rejecting this?"
                    className="w-full px-3 py-2 border border-red-300 rounded text-sm"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReject(v._id)}
                      className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg"
                    >
                      Send Rejection
                    </button>
                    <button
                      onClick={() => setShowReject(null)}
                      className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-900 text-sm font-semibold rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setSelectedId(v._id)}
                  className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm font-semibold rounded-lg"
                >
                  Review
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AdminVerifications() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminVerificationsContent />
    </ProtectedRoute>
  );
}
