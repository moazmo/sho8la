'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { paymobApi } from '@/lib/paymobApi';
import { Navbar } from '@/components/features/Navbar';
import { CreditCard, Smartphone, CheckCircle, ExternalLink } from 'lucide-react';

interface AcceptedProposal {
  _id: string;
  jobId: { _id: string; title: string; budget: number };
  freelancerId: { _id: string; name: string };
  bidAmount: number;
  deliveryDays: number;
  status: string;
}

function PaymentContent() {
  const { user } = useAuth();
  const [proposals, setProposals] = useState<AcceptedProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [method, setMethod] = useState<'card' | 'wallet'>('card');

  const loadProposals = useCallback(async () => {
    try {
      // In real app, fetch accepted proposals for client's jobs
      setProposals([]);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user?.id) loadProposals();
  }, [user?.id, loadProposals]);

  const handlePayment = async (proposal: AcceptedProposal) => {
    if (!user?.id) return;
    setProcessing(proposal._id);

    try {
      const result = await paymobApi.initiatePayment(
        proposal.jobId._id,
        proposal.freelancerId._id,
        proposal.bidAmount,
        method
      ) as { paymentUrl: string };

      setPaymentUrl(result.paymentUrl);
    } catch (err) {
      console.error('Payment error:', err);
      alert('Payment initiation failed');
    }
    setProcessing(null);
  };

  if (paymentUrl) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Complete Your Payment</h2>
            <p className="text-gray-600 mb-6">Click below to securely complete payment via Paymob</p>
            <a
              href={paymentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition"
            >
              <ExternalLink className="w-5 h-5" />
              Pay Now
            </a>
            <button
              onClick={() => setPaymentUrl(null)}
              className="block mx-auto mt-4 text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment</h1>
        <p className="text-gray-500 mb-8">Securely pay freelancers via Paymob</p>

        {/* Payment Method Selection */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <h3 className="font-semibold text-gray-900 mb-4">Select Payment Method</h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setMethod('card')}
              className={`p-4 rounded-lg border-2 flex items-center gap-3 transition ${method === 'card' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
            >
              <CreditCard className={`w-6 h-6 ${method === 'card' ? 'text-blue-600' : 'text-gray-400'}`} />
              <div className="text-left">
                <p className="font-semibold text-gray-900">Card Payment</p>
                <p className="text-xs text-gray-500">Visa, Mastercard</p>
              </div>
            </button>
            <button
              onClick={() => setMethod('wallet')}
              className={`p-4 rounded-lg border-2 flex items-center gap-3 transition ${method === 'wallet' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
            >
              <Smartphone className={`w-6 h-6 ${method === 'wallet' ? 'text-blue-600' : 'text-gray-400'}`} />
              <div className="text-left">
                <p className="font-semibold text-gray-900">Mobile Wallet</p>
                <p className="text-xs text-gray-500">Vodafone Cash, Orange</p>
              </div>
            </button>
          </div>
        </div>

        {/* Accepted Proposals */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : proposals.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <CreditCard className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p className="text-gray-500">No pending payments</p>
            <p className="text-sm text-gray-400 mt-2">Accept a proposal to initiate payment</p>
          </div>
        ) : (
          <div className="space-y-4">
            {proposals.map((p) => (
              <div key={p._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900">{p.jobId.title}</h3>
                    <p className="text-sm text-gray-500">Freelancer: {p.freelancerId.name}</p>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{p.bidAmount} EGP</span>
                </div>
                <button
                  onClick={() => handlePayment(p)}
                  disabled={processing === p._id}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
                >
                  {processing === p._id ? 'Processing...' : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      Pay {p.bidAmount} EGP
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <ProtectedRoute requiredRole="client">
      <PaymentContent />
    </ProtectedRoute>
  );
}
