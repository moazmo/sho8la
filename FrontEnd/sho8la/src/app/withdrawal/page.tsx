'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navbar } from '@/components/features/Navbar';
import { withdrawalUtils, type Withdrawal } from '@/lib/withdrawal';
import { DollarSign, Wallet, TrendingDown, CheckCircle, Clock, AlertCircle } from 'lucide-react';

function WithdrawalContent() {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'bank_transfer' | 'mobile_wallet'>('bank_transfer');
  const [bankDetails, setBankDetails] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user?.id) {
      const wallets: Record<string, { balance: number }> = JSON.parse(localStorage.getItem('sho8la_wallets') || '{}');
      const walletData = wallets[user.id];
      setBalance(walletData?.balance || 0);
      setWithdrawals(withdrawalUtils.getFreelancerWithdrawals(user.id));
    }
  }, [user?.id]);

  const handleRequest = () => {
    try {
      setError('');
      setSuccess('');
      const withdrawAmount = parseFloat(amount);
      
      if (!amount || withdrawAmount <= 0) throw new Error('Enter valid amount');
      if (withdrawAmount > balance) throw new Error('Insufficient balance');
      if (method === 'bank_transfer' && !bankDetails.trim()) throw new Error('Enter bank details');

      if (user?.id) {
        withdrawalUtils.requestWithdrawal(user.id, user.name, withdrawAmount, method, bankDetails);
        setSuccess('Withdrawal request submitted!');
        setAmount('');
        setBankDetails('');
        setWithdrawals(withdrawalUtils.getFreelancerWithdrawals(user.id));
        const wallets: Record<string, { balance: number }> = JSON.parse(localStorage.getItem('sho8la_wallets') || '{}');
        const walletData = wallets[user.id];
        setBalance(walletData?.balance || 0);
        setShowForm(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Wallet & Withdrawals</h1>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 text-white mb-8 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm font-semibold">Available Balance</p>
            <p className="text-4xl font-bold mt-2">{balance.toLocaleString()} EGP</p>
          </div>
          <Wallet className="w-16 h-16 opacity-50" />
        </div>
      </div>

      {/* Request Withdrawal Button */}
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full mb-8 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
        >
          <TrendingDown className="w-5 h-5" />
          Request Withdrawal
        </button>
      ) : (
        <div className="bg-white p-6 rounded-xl border border-gray-100 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Request Withdrawal</h2>
          
          {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}
          {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm">{success}</div>}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Amount (EGP)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">Available: {balance.toLocaleString()} EGP</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Withdrawal Method</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as 'bank_transfer' | 'mobile_wallet')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
              >
                <option value="bank_transfer">Bank Transfer</option>
                <option value="mobile_wallet">Mobile Wallet (Vodafone Cash)</option>
              </select>
            </div>

            {method === 'bank_transfer' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Bank Details</label>
                <textarea
                  value={bankDetails}
                  onChange={(e) => setBankDetails(e.target.value)}
                  placeholder="IBAN / Account Number..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                  rows={3}
                />
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleRequest}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition"
              >
                Submit Request
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Withdrawal History */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Withdrawal History</h2>
        {withdrawals.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-gray-100 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p className="text-gray-500">No withdrawal requests yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {withdrawals.map((wd) => (
              <div key={wd.id} className="bg-white p-4 rounded-lg border border-gray-100 flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{wd.amount.toLocaleString()} EGP</p>
                  <p className="text-xs text-gray-500">{wd.method.replace('_', ' ')}</p>
                  <p className="text-xs text-gray-400">{new Date(wd.requestedAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  {wd.status === 'pending' && <Clock className="w-5 h-5 text-yellow-500" />}
                  {wd.status === 'approved' && <CheckCircle className="w-5 h-5 text-green-500" />}
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${
                    wd.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    wd.status === 'approved' ? 'bg-green-100 text-green-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {wd.status.charAt(0).toUpperCase() + wd.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function WithdrawalPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <WithdrawalContent />
      </div>
    </ProtectedRoute>
  );
}
