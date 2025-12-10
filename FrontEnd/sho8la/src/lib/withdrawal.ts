export interface Withdrawal {
  id: string;
  freelancerId: string;
  freelancerName: string;
  amount: number;
  method: 'bank_transfer' | 'mobile_wallet';
  bankDetails?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  requestedAt: number;
  processedAt?: number;
  adminNotes?: string;
}

export interface Payout {
  id: string;
  withdrawalId: string;
  freelancerId: string;
  amount: number;
  method: string;
  processedAt: number;
}

const WITHDRAWAL_KEY = 'sho8la_withdrawals';
const PAYOUT_KEY = 'sho8la_payouts';

export const withdrawalUtils = {
  requestWithdrawal(freelancerId: string, freelancerName: string, amount: number, method: 'bank_transfer' | 'mobile_wallet', bankDetails?: string) {
    if (amount <= 0) throw new Error('Amount must be greater than 0');
    
    const wallets: Record<string, { balance: number }> = JSON.parse(localStorage.getItem('sho8la_wallets') || '{}');
    if ((wallets[freelancerId]?.balance || 0) < amount) throw new Error('Insufficient balance');

    const withdrawal: Withdrawal = {
      id: `wd_${Date.now()}`,
      freelancerId,
      freelancerName,
      amount,
      method,
      bankDetails,
      status: 'pending',
      requestedAt: Date.now(),
    };

    const withdrawals: Withdrawal[] = JSON.parse(localStorage.getItem(WITHDRAWAL_KEY) || '[]');
    withdrawals.push(withdrawal);
    localStorage.setItem(WITHDRAWAL_KEY, JSON.stringify(withdrawals));

    // Deduct from wallet immediately (funds on hold)
    wallets[freelancerId] = { balance: (wallets[freelancerId]?.balance || 0) - amount };
    localStorage.setItem('sho8la_wallets', JSON.stringify(wallets));

    return withdrawal;
  },

  getFreelancerWithdrawals(freelancerId: string) {
    const withdrawals: Withdrawal[] = JSON.parse(localStorage.getItem(WITHDRAWAL_KEY) || '[]');
    return withdrawals.filter((w) => w.freelancerId === freelancerId).sort((a, b) => b.requestedAt - a.requestedAt);
  },

  getPendingWithdrawals() {
    const withdrawals: Withdrawal[] = JSON.parse(localStorage.getItem(WITHDRAWAL_KEY) || '[]');
    return withdrawals.filter((w) => w.status === 'pending').sort((a, b) => b.requestedAt - a.requestedAt);
  },

  approvePayout(withdrawalId: string, notes?: string) {
    const withdrawals: Withdrawal[] = JSON.parse(localStorage.getItem(WITHDRAWAL_KEY) || '[]');
    const withdrawal = withdrawals.find((w) => w.id === withdrawalId);
    if (!withdrawal) return null;

    withdrawal.status = 'approved';
    withdrawal.processedAt = Date.now();
    withdrawal.adminNotes = notes;
    localStorage.setItem(WITHDRAWAL_KEY, JSON.stringify(withdrawals));

    // Create payout record
    const payout: Payout = {
      id: `payout_${Date.now()}`,
      withdrawalId,
      freelancerId: withdrawal.freelancerId,
      amount: withdrawal.amount,
      method: withdrawal.method,
      processedAt: Date.now(),
    };
    const payouts: Payout[] = JSON.parse(localStorage.getItem(PAYOUT_KEY) || '[]');
    payouts.push(payout);
    localStorage.setItem(PAYOUT_KEY, JSON.stringify(payouts));

    return withdrawal;
  },

  rejectWithdrawal(withdrawalId: string, reason: string) {
    const withdrawals: Withdrawal[] = JSON.parse(localStorage.getItem(WITHDRAWAL_KEY) || '[]');
    const withdrawal = withdrawals.find((w) => w.id === withdrawalId);
    if (!withdrawal) return null;

    withdrawal.status = 'rejected';
    withdrawal.processedAt = Date.now();
    withdrawal.adminNotes = reason;
    localStorage.setItem(WITHDRAWAL_KEY, JSON.stringify(withdrawals));

    // Return funds to wallet
    const wallets: Record<string, { balance: number }> = JSON.parse(localStorage.getItem('sho8la_wallets') || '{}');
    wallets[withdrawal.freelancerId] = { balance: (wallets[withdrawal.freelancerId]?.balance || 0) + withdrawal.amount };
    localStorage.setItem('sho8la_wallets', JSON.stringify(wallets));

    return withdrawal;
  },

  getPayouts() {
    return JSON.parse(localStorage.getItem(PAYOUT_KEY) || '[]') as Payout[];
  },
};
