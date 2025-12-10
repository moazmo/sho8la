'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { Navbar } from '@/components/features/Navbar';
import { CreditCard, Smartphone, Loader2, CheckCircle, XCircle, ExternalLink } from 'lucide-react';

export default function PaymentTestPage() {
    const { user } = useAuth();
    const [amount, setAmount] = useState('');
    const [method, setMethod] = useState<'card' | 'wallet'>('card');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
    const [error, setError] = useState('');

    const handleDeposit = async () => {
        if (!amount || parseFloat(amount) <= 0) return setError('Enter a valid amount');

        setLoading(true);
        setError('');

        try {
            const res = await apiClient.post<{ paymentUrl: string }>('/paymob/deposit', {
                amount: parseFloat(amount),
                method
            });
            window.open(res.paymentUrl, '_blank');
            setStatus('pending');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Payment failed');
            setStatus('error');
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-xl shadow text-center">
                    <p className="text-gray-600">Please login to test payments</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-xl mx-auto mt-12 p-8">
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">💳 Payment Test</h1>
                    <p className="text-gray-500 mb-6">Test Paymob integration (sandbox mode)</p>

                    {/* Amount */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Amount (EGP)</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="100"
                            disabled={status === 'pending'}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        />
                    </div>

                    {/* Method */}
                    <div className="mb-6 grid grid-cols-2 gap-4">
                        {(['card', 'wallet'] as const).map((m) => (
                            <button
                                key={m}
                                onClick={() => setMethod(m)}
                                disabled={status === 'pending'}
                                className={`p-4 rounded-xl border-2 flex items-center gap-3 transition ${method === m ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                                    }`}
                            >
                                {m === 'card' ? <CreditCard /> : <Smartphone />}
                                <span className="font-medium capitalize">{m}</span>
                            </button>
                        ))}
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700">
                            <XCircle className="w-5 h-5" /> {error}
                        </div>
                    )}

                    {/* Idle: Pay Button */}
                    {status === 'idle' && (
                        <button
                            onClick={handleDeposit}
                            disabled={loading || !amount}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold py-4 rounded-xl transition flex items-center justify-center gap-2"
                        >
                            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                            {loading ? 'Processing...' : `Pay ${amount || '0'} EGP`}
                        </button>
                    )}

                    {/* Pending: Waiting for payment */}
                    {status === 'pending' && (
                        <div className="text-center">
                            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                                <p className="font-medium text-yellow-800 flex items-center justify-center gap-2">
                                    <ExternalLink className="w-5 h-5" /> Complete payment in the new tab
                                </p>
                            </div>
                            <button
                                onClick={() => setStatus('success')}
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 rounded-xl"
                            >
                                ✓ I completed the payment
                            </button>
                            <button
                                onClick={() => setStatus('idle')}
                                className="mt-2 text-gray-500 hover:text-gray-700 text-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    )}

                    {/* Success */}
                    {status === 'success' && (
                        <div className="p-6 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                            <div>
                                <p className="font-semibold text-green-800">Payment Complete!</p>
                                <p className="text-green-600 text-sm">Check your wallet for the updated balance</p>
                            </div>
                        </div>
                    )}

                    {/* Test Card */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-xl text-sm text-gray-600">
                        <p className="font-medium mb-1">🧪 Test Card:</p>
                        <p>Number: <code className="bg-gray-200 px-2 py-1 rounded">4987654321098769</code></p>
                        <p>Expiry: Any future | CVV: Any 3 digits</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
