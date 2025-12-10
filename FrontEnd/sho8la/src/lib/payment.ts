// Payment system for Sho8la
// Supports InstaPay and Vodafone Cash (Egyptian payment methods)

export interface Payment {
  id: string;
  proposalId: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  amount: number;
  method: 'instapaY' | 'vodafone-cash';
  status: 'pending' | 'completed' | 'failed';
  referenceNumber: string;
  createdAt: number;
  completedAt?: number;
}

export interface Wallet {
  userId: string;
  balance: number;
  totalEarned: number;
  totalSpent: number;
  transactionHistory: Payment[];
}

const PAYMENTS_KEY = 'sho8la_payments';
const WALLETS_KEY = 'sho8la_wallets';

export const paymentUtils = {
  // Wallet management
  getWallet: (userId: string): Wallet => {
    if (typeof window === 'undefined') return { userId, balance: 0, totalEarned: 0, totalSpent: 0, transactionHistory: [] };
    const wallets: Record<string, any> = JSON.parse(localStorage.getItem(WALLETS_KEY) || '{}');
    const wallet = wallets[userId];
    
    // Handle legacy format { balance: number }
    if (wallet && typeof wallet.balance === 'number' && !wallet.userId) {
      return { userId, balance: wallet.balance, totalEarned: 0, totalSpent: 0, transactionHistory: [] };
    }
    
    return wallet || { userId, balance: 0, totalEarned: 0, totalSpent: 0, transactionHistory: [] };
  },

  saveWallet: (wallet: Wallet) => {
    if (typeof window === 'undefined') return;
    const wallets: Record<string, Wallet> = JSON.parse(localStorage.getItem(WALLETS_KEY) || '{}');
    wallets[wallet.userId] = wallet;
    localStorage.setItem(WALLETS_KEY, JSON.stringify(wallets));
  },

  // Payment processing
  initiatePayment: (
    proposalId: string,
    fromUserId: string,
    fromUserName: string,
    toUserId: string,
    toUserName: string,
    amount: number,
    method: 'instapaY' | 'vodafone-cash'
  ): Payment => {
    if (typeof window === 'undefined') return {} as Payment;

    const payment: Payment = {
      id: `pay_${Date.now()}`,
      proposalId,
      fromUserId,
      fromUserName,
      toUserId,
      toUserName,
      amount,
      method,
      status: 'pending',
      referenceNumber: `REF${Date.now().toString().slice(-8)}`,
      createdAt: Date.now(),
    };

    const payments: Payment[] = JSON.parse(localStorage.getItem(PAYMENTS_KEY) || '[]');
    payments.push(payment);
    localStorage.setItem(PAYMENTS_KEY, JSON.stringify(payments));

    return payment;
  },

  completePayment: (paymentId: string) => {
    if (typeof window === 'undefined') return;
    const payments: Payment[] = JSON.parse(localStorage.getItem(PAYMENTS_KEY) || '[]');
    const payment = payments.find((p) => p.id === paymentId);

    if (payment) {
      payment.status = 'completed';
      payment.completedAt = Date.now();

      // Update wallets
      const fromWallet = paymentUtils.getWallet(payment.fromUserId);
      const toWallet = paymentUtils.getWallet(payment.toUserId);

      fromWallet.balance -= payment.amount;
      fromWallet.totalSpent += payment.amount;
      fromWallet.transactionHistory.push(payment);

      toWallet.balance += payment.amount;
      toWallet.totalEarned += payment.amount;
      toWallet.transactionHistory.push(payment);

      paymentUtils.saveWallet(fromWallet);
      paymentUtils.saveWallet(toWallet);
      localStorage.setItem(PAYMENTS_KEY, JSON.stringify(payments));
    }
  },

  failPayment: (paymentId: string) => {
    if (typeof window === 'undefined') return;
    const payments: Payment[] = JSON.parse(localStorage.getItem(PAYMENTS_KEY) || '[]');
    const payment = payments.find((p) => p.id === paymentId);
    if (payment) {
      payment.status = 'failed';
      localStorage.setItem(PAYMENTS_KEY, JSON.stringify(payments));
    }
  },

  getPaymentsByUser: (userId: string): Payment[] => {
    if (typeof window === 'undefined') return [];
    const payments: Payment[] = JSON.parse(localStorage.getItem(PAYMENTS_KEY) || '[]');
    return payments.filter((p) => p.fromUserId === userId || p.toUserId === userId);
  },

  getPaymentByProposal: (proposalId: string): Payment | undefined => {
    if (typeof window === 'undefined') return undefined;
    const payments: Payment[] = JSON.parse(localStorage.getItem(PAYMENTS_KEY) || '[]');
    return payments.find((p) => p.proposalId === proposalId);
  },

  addFunds: (userId: string, amount: number) => {
    if (typeof window === 'undefined') return;
    const wallet = paymentUtils.getWallet(userId);
    wallet.balance += amount;
    paymentUtils.saveWallet(wallet);
  },
};
