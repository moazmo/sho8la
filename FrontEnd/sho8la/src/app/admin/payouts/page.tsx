'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/features/Navbar';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { withdrawalUtils, type Withdrawal } from '@/lib/withdrawal';
import { CheckCircle, XCircle, Clock, AlertCircle, DollarSign } from 'lucide-react';

function PayoutManagementContent() {
  const [pendingWithdrawals, setPendingWithdrawals] = useState<Withdrawal[]>([]);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState<string | null>(null);

  useEffect(() => {
    setPendingWithdrawals(withdrawalUtils.getPendingWithdrawals());
  }, []);

  const handleApprove = (withdrawalId: string) => {
    withdrawalUtils.approvePayout(withdrawalId, notes);
    setPendingWithdrawals(withdrawalUtils.getPendingWithdrawals());
    setSelectedWithdrawal(null);
    setNotes('');
  };

  const handleReject = (withdrawalId: string) => {
    withdrawalUtils.rejectWithdrawal(withdrawalId, rejectReason);
    setPendingWithdrawals(withdrawalUtils.getPendingWithdrawals());
    setShowRejectForm(null);
    setRejectReason('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <DollarSign className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Payout Management</h1>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Pending Withdrawal Requests ({pendingWithdrawals.length})</h2>

          {pendingWithdrawals.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p className="text-gray-500">No pending withdrawal requests</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingWithdrawals.map((wd) => (
                <div key={wd.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <p className="font-bold text-lg text-gray-900">{wd.amount.toLocaleString()} EGP</p>
                      <p className="text-sm text-gray-600">{wd.freelancerName}</p>
                      <p className="text-xs text-gray-500">{wd.method.replace('_', ' ')}</p>
                    </div>
                    <p className="text-xs text-gray-400">{new Date(wd.requestedAt).toLocaleDateString()}</p>
                  </div>

                  {wd.bankDetails && (
                    <p className="text-xs text-gray-600 mb-3 p-2 bg-gray-50 rounded">
                      <strong>Details:</strong> {wd.bankDetails}
                    </p>
                  )}

                  {selectedWithdrawal === wd.id ? (
                    <div className="mt-4 space-y-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add notes (optional)..."
                        className="w-full px-3 py-2 border border-blue-300 rounded text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(wd.id)}
                          className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded transition"
                        >
                          Approve Payout
                        </button>
                        <button
                          onClick={() => setSelectedWithdrawal(null)}
                          className="flex-1 px-3 py-2 bg-gray-300 hover:bg-gray-400 text-gray-900 text-sm font-semibold rounded transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : showRejectForm === wd.id ? (
                    <div className="mt-4 space-y-3 p-3 bg-red-50 rounded-lg border border-red-200">
                      <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Reason for rejection..."
                        className="w-full px-3 py-2 border border-red-300 rounded text-sm focus:ring-2 focus:ring-red-600 outline-none"
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReject(wd.id)}
                          className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded transition"
                        >
                          Confirm Rejection
                        </button>
                        <button
                          onClick={() => setShowRejectForm(null)}
                          className="flex-1 px-3 py-2 bg-gray-300 hover:bg-gray-400 text-gray-900 text-sm font-semibold rounded transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedWithdrawal(wd.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-100 hover:bg-green-200 text-green-700 text-sm font-semibold rounded transition"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => setShowRejectForm(wd.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 text-sm font-semibold rounded transition"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PayoutManagement() {
  return (
    <ProtectedRoute requiredRole="admin">
      <PayoutManagementContent />
    </ProtectedRoute>
  );
}
