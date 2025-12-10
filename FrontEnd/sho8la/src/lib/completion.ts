export interface JobCompletion {
  id: string;
  proposalId: string;
  freelancerId: string;
  clientId: string;
  jobTitle: string;
  submittedAt: number;
  deliverables: string;
  status: 'pending' | 'approved' | 'rejected';
  clientFeedback?: string;
  completedAt?: number;
}

const COMPLETION_KEY = 'sho8la_completions';
const PROPOSALS_KEY = 'sho8la_proposals';

export const completionUtils = {
  submitCompletion(proposalId: string, freelancerId: string, clientId: string, jobTitle: string, deliverables: string) {
    const completion: JobCompletion = {
      id: `comp_${Date.now()}`,
      proposalId,
      freelancerId,
      clientId,
      jobTitle,
      submittedAt: Date.now(),
      deliverables,
      status: 'pending',
    };
    const completions = JSON.parse(localStorage.getItem(COMPLETION_KEY) || '[]');
    completions.push(completion);
    localStorage.setItem(COMPLETION_KEY, JSON.stringify(completions));
    return completion;
  },

  getFreelancerCompletions(freelancerId: string) {
    const completions: JobCompletion[] = JSON.parse(localStorage.getItem(COMPLETION_KEY) || '[]');
    return completions.filter((c) => c.freelancerId === freelancerId);
  },

  getClientPendingCompletions(clientId: string) {
    const completions: JobCompletion[] = JSON.parse(localStorage.getItem(COMPLETION_KEY) || '[]');
    return completions.filter((c) => c.clientId === clientId && c.status === 'pending');
  },

  approveCompletion(completionId: string, clientId: string) {
    const completions: JobCompletion[] = JSON.parse(localStorage.getItem(COMPLETION_KEY) || '[]');
    const completion = completions.find((c) => c.id === completionId && c.clientId === clientId);
    if (!completion) return null;

    completion.status = 'approved';
    completion.completedAt = Date.now();
    localStorage.setItem(COMPLETION_KEY, JSON.stringify(completions));

    // Release funds to freelancer wallet
    const wallets: Record<string, number> = JSON.parse(localStorage.getItem('sho8la_wallets') || '{}');
    if (!wallets[completion.freelancerId]) wallets[completion.freelancerId] = 0;
    
    const proposals: { id: string; bidAmount: number }[] = JSON.parse(localStorage.getItem(PROPOSALS_KEY) || '[]');
    const proposal = proposals.find((p) => p.id === completion.proposalId);
    if (proposal) {
      wallets[completion.freelancerId] += proposal.bidAmount;
      localStorage.setItem('sho8la_wallets', JSON.stringify(wallets));
    }

    return completion;
  },

  rejectCompletion(completionId: string, clientId: string, feedback: string) {
    const completions: JobCompletion[] = JSON.parse(localStorage.getItem(COMPLETION_KEY) || '[]');
    const completion = completions.find((c) => c.id === completionId && c.clientId === clientId);
    if (!completion) return null;

    completion.status = 'rejected';
    completion.clientFeedback = feedback;
    completion.completedAt = Date.now();
    localStorage.setItem(COMPLETION_KEY, JSON.stringify(completions));
    return completion;
  },

  getCompletion(completionId: string) {
    const completions: JobCompletion[] = JSON.parse(localStorage.getItem(COMPLETION_KEY) || '[]');
    return completions.find((c) => c.id === completionId);
  },
};
