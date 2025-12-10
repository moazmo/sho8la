'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navbar } from '@/components/features/Navbar';
import { walletApi } from '@/lib/apiServices';
import { apiClient } from '@/lib/api';
import { TrendingUp, TrendingDown, Plus, ArrowUpRight, ArrowDownLeft, ExternalLink, Loader2 } from 'lucide-react';

interface Transaction {
  type: 'earning' | 'withdrawal' | 'deposit' | 'payment';
  amount: number;
  description: string;
  createdAt: string;
}

interface WalletData {
  balance: number;
  totalEarned: number;
  totalSpent: number;
  transactions: Transaction[];
}

function WalletContent() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<WalletData>({ balance: 0, totalEarned: 0, totalSpent: 0, transactions: [] });
  const [loading, setLoading] = useState(true);
  const [showAction, setShowAction] = useState<'deposit' | 'withdraw' | 'pending' | null>(null);
  const [amount, setAmount] = useState('');
  const [processing, setProcessing] = useState(false);

  const loadWallet = useCallback(async () => {
    try {
      const data = await walletApi.getWallet() as WalletData;
      setWallet(data);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user?.id) loadWallet();
  }, [user?.id, loadWallet]);

  const handleDeposit = async () => {
    if (!amount || Number(amount) <= 0) return;
    setProcessing(true);
    try {
      const res = await apiClient.post<{ paymentUrl: string }>('/paymob/deposit', { amount: Number(amount) });
      window.open(res.paymentUrl, '_blank');
      setShowAction('pending');
    } catch {
      alert('Failed to initiate payment');
    }
    setProcessing(false);
  };

  const handleWithdraw = async () => {
    if (!amount || Number(amount) <= 0) return;
    setProcessing(true);
    try {
      await walletApi.withdraw(Number(amount));
      await loadWallet();
      setAmount('');
      setShowAction(null);
    } catch {
      alert('Withdrawal failed');
    }
    setProcessing(false);
  };

  const confirmDeposit = async () => {
    try {
      await apiClient.post('/paymob/deposit/confirm', { amount: Number(amount) });
    } catch { /* ignore */ }
    await loadWallet();
    setAmount('');
    setShowAction(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Wallet</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-2">Balance</p>
            <p className="text-3xl font-bold text-gray-900">{wallet.balance} EGP</p>
            <div className="mt-4 flex gap-2">
              <button onClick={() => setShowAction('deposit')} className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-lg flex items-center justify-center gap-1">
                <Plus className="w-4 h-4" /> Add
              </button>
              <button onClick={() => setShowAction('withdraw')} className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg">
                Withdraw
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-2">Total Earned</p>
            <p className="text-3xl font-bold text-green-600">{wallet.totalEarned} EGP</p>
            <TrendingUp className="mt-2 w-8 h-8 text-green-200" />
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-2">Total Spent</p>
            <p className="text-3xl font-bold text-red-600">{wallet.totalSpent} EGP</p>
            <TrendingDown className="mt-2 w-8 h-8 text-red-200" />
          </div>
        </div>

        {/* Deposit Form */}
        {showAction === 'deposit' && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Add Funds via Paymob</h2>
            <div className="flex gap-4">
              <input
                type="number"
                placeholder="Amount (EGP)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
              />
              <button onClick={handleDeposit} disabled={processing} className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg disabled:bg-gray-400 flex items-center gap-2">
                {processing && <Loader2 className="w-4 h-4 animate-spin" />}
                Pay Now
              </button>
              <button onClick={() => setShowAction(null)} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg">Cancel</button>
            </div>
          </div>
        )}

        {/* Pending Payment */}
        {showAction === 'pending' && (
          <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-xl mb-8">
            <p className="font-medium text-yellow-800 flex items-center gap-2 mb-4">
              <ExternalLink className="w-5 h-5" /> Complete payment in the new tab
            </p>
            <div className="flex gap-4">
              <button onClick={confirmDeposit} className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg">
                ✓ I completed payment
              </button>
              <button onClick={() => setShowAction(null)} className="text-gray-500 hover:text-gray-700">Cancel</button>
            </div>
          </div>
        )}

        {/* Withdraw Form */}
        {showAction === 'withdraw' && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Withdraw Funds</h2>
            <div className="flex gap-4">
              <input
                type="number"
                placeholder="Amount (EGP)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
              />
              <button onClick={handleWithdraw} disabled={processing} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg disabled:bg-gray-400">
                {processing ? 'Processing...' : 'Confirm'}
              </button>
              <button onClick={() => setShowAction(null)} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg">Cancel</button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Transactions</h2>
          </div>
          {wallet.transactions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No transactions yet</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {wallet.transactions.map((tx, idx) => (
                <div key={idx} className="p-4 flex justify-between items-center hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    {tx.type === 'earning' || tx.type === 'deposit' ? (
                      <ArrowDownLeft className="w-5 h-5 text-green-500" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5 text-red-500" />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{tx.description}</p>
                      <p className="text-xs text-gray-500">{new Date(tx.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <p className={`font-bold ${tx.type === 'earning' || tx.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.type === 'earning' || tx.type === 'deposit' ? '+' : '-'}{tx.amount} EGP
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function WalletPage() {
  return (
    <ProtectedRoute>
      <WalletContent />
    </ProtectedRoute>
  );
}
