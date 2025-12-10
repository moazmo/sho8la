import { apiClient } from './api';

export const paymobApi = {
    initiatePayment: async (jobId: string, freelancerId: string, amount: number, method = 'card') => {
        return apiClient.post('/paymob/initiate', { jobId, freelancerId, amount, method });
    },

    getEscrow: async (escrowId: string) => {
        return apiClient.get(`/paymob/${escrowId}`);
    },

    getJobEscrows: async (jobId: string) => {
        return apiClient.get(`/paymob/job/${jobId}`);
    },

    releasePayment: async (escrowId: string) => {
        return apiClient.post(`/paymob/release/${escrowId}`, {});
    }
};

export interface EscrowData {
    _id: string;
    jobId: string;
    clientId: string;
    freelancerId: string;
    amount: number;
    platformFee: number;
    status: 'pending' | 'held' | 'released' | 'refunded';
    paymobOrderId?: string;
    createdAt: string;
}
