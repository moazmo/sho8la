import { apiClient } from './api';

export const jobsApi = {
  getAll: async (filters?: { category?: string; status?: string; search?: string }) => {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    return apiClient.get(`/jobs?${params.toString()}`);
  },

  getById: async (jobId: string) => {
    return apiClient.get(`/jobs/${jobId}`);
  },

  create: async (data: {
    title: string;
    description: string;
    budget: number;
    category: string;
    skills?: string[];
  }) => {
    return apiClient.post('/jobs', data);
  },

  update: async (jobId: string, data: any) => {
    return apiClient.put(`/jobs/${jobId}`, data);
  },

  delete: async (jobId: string) => {
    return apiClient.delete(`/jobs/${jobId}`);
  },
};

export const completionApi = {
  submit: async (data: { jobId: string; deliverables: string; attachments?: string[] }) => {
    return apiClient.post('/completion/submit', data);
  },
  getForJob: async (jobId: string) => {
    return apiClient.get(`/completion/job/${jobId}`);
  },
  approve: async (completionId: string) => {
    return apiClient.post(`/completion/${completionId}/approve`, {});
  },
  revision: async (completionId: string, feedback: string) => {
    return apiClient.post(`/completion/${completionId}/revision`, { feedback });
  },
};

export const chatApi = {
  getConversations: async (userId: string) => {
    return apiClient.get(`/messages/user/${userId}`);
  },
  getMessages: async (conversationId: string) => {
    return apiClient.get(`/messages/${conversationId}`);
  },
  send: async (conversationId: string, receiverId: string, text: string) => {
    return apiClient.post('/messages', { conversationId, receiverId, text });
  },
};

export const proposalsApi = {
  getForJob: async (jobId: string) => {
    return apiClient.get(`/proposals/job/${jobId}`);
  },

  getMy: async () => {
    return apiClient.get('/proposals/my');
  },

  getUserProposals: async (userId: string) => {
    return apiClient.get(`/proposals/user/${userId}`);
  },

  submit: async (data: {
    jobId: string;
    bidAmount: number;
    deliveryDays: number;
    coverLetter?: string;
  }) => {
    return apiClient.post('/proposals', data);
  },

  accept: async (proposalId: string) => {
    return apiClient.put(`/proposals/${proposalId}/accept`, {});
  },

  reject: async (proposalId: string) => {
    return apiClient.put(`/proposals/${proposalId}/reject`, {});
  },
};

export const reviewsApi = {
  getUserReviews: async (userId: string) => {
    return apiClient.get(`/reviews/user/${userId}`);
  },

  getJobReviews: async (jobId: string) => {
    return apiClient.get(`/reviews/job/${jobId}`);
  },

  create: async (data: {
    jobId: string;
    revieweeId: string;
    rating: number;
    comment?: string;
  }) => {
    return apiClient.post('/reviews', data);
  },
};

export const messagesApi = {
  getConversation: async (conversationId: string) => {
    return apiClient.get(`/messages/${conversationId}`);
  },

  getUserConversations: async (userId: string) => {
    return apiClient.get(`/messages/user/${userId}`);
  },

  send: async (data: {
    conversationId: string;
    receiverId: string;
    text: string;
  }) => {
    return apiClient.post('/messages', data);
  },

  markAsRead: async (messageId: string) => {
    return apiClient.put(`/messages/${messageId}/read`, {});
  },
};

export const verificationsApi = {
  getStatus: async (userId: string) => {
    return apiClient.get(`/verifications/${userId}`);
  },

  submit: async (data: {
    university: string;
    studentId: string;
    documentUrl?: string;
  }) => {
    return apiClient.post('/verifications', data);
  },

  approve: async (verificationId: string) => {
    return apiClient.put(`/verifications/${verificationId}/approve`, {});
  },

  reject: async (verificationId: string, rejectionReason: string) => {
    return apiClient.put(`/verifications/${verificationId}/reject`, {
      rejectionReason,
    });
  },
};

export const paymentsApi = {
  getUserPayments: async (userId: string) => {
    return apiClient.get(`/payments/user/${userId}`);
  },

  getPayment: async (paymentId: string) => {
    return apiClient.get(`/payments/${paymentId}`);
  },

  create: async (data: {
    jobId: string;
    freelancerId: string;
    amount: number;
    method?: string;
  }) => {
    return apiClient.post('/payments', data);
  },

  complete: async (paymentId: string) => {
    return apiClient.put(`/payments/${paymentId}/complete`, {});
  },

  refund: async (paymentId: string) => {
    return apiClient.put(`/payments/${paymentId}/refund`, {});
  },
};

export const walletsApi = {
  getBalance: async (userId: string) => {
    return apiClient.get(`/wallets/${userId}`);
  },

  getTransactions: async (userId: string, limit = 50, skip = 0) => {
    return apiClient.get(`/wallets/${userId}/transactions?limit=${limit}&skip=${skip}`);
  },

  deposit: async (userId: string, data: { amount: number; method?: string }) => {
    return apiClient.post(`/wallets/${userId}/deposit`, data);
  },

  withdraw: async (userId: string, data: { amount: number; bankAccount: string }) => {
    return apiClient.post(`/wallets/${userId}/withdraw`, data);
  },
};

// Current user's wallet (uses auth token)
export const walletApi = {
  getWallet: async () => {
    return apiClient.get('/wallets/me');
  },
  withdraw: async (amount: number) => {
    return apiClient.post('/wallets/me/withdraw', { amount });
  },
  deposit: async (amount: number) => {
    return apiClient.post('/wallets/me/deposit', { amount });
  },
};



