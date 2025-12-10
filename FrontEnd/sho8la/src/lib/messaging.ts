// Messaging & Proposals data structures and utilities

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  content: string;
  createdAt: number;
  read: boolean;
}

export interface Conversation {
  id: string;
  participantIds: [string, string];
  participantNames: [string, string];
  lastMessage?: string;
  lastMessageTime?: number;
  unreadCount: number;
}

export interface Proposal {
  id: string;
  jobId: string;
  jobTitle: string;
  freelancerId: string;
  freelancerName: string;
  freelancerEmail: string;
  clientId: string;
  bidAmount: number;
  deliveryDays: number;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: number;
}

const MESSAGES_KEY = 'sho8la_messages';
const PROPOSALS_KEY = 'sho8la_proposals';

export const messagingUtils = {
  // Messages
  sendMessage: (senderId: string, senderName: string, receiverId: string, content: string) => {
    if (typeof window === 'undefined') return;
    const messages: Message[] = JSON.parse(localStorage.getItem(MESSAGES_KEY) || '[]');
    const message: Message = {
      id: `msg_${Date.now()}`,
      senderId,
      senderName,
      receiverId,
      content,
      createdAt: Date.now(),
      read: false,
    };
    messages.push(message);
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
    return message;
  },

  getConversation: (userId: string, otherUserId: string): Message[] => {
    if (typeof window === 'undefined') return [];
    const messages: Message[] = JSON.parse(localStorage.getItem(MESSAGES_KEY) || '[]');
    return messages.filter(
      (m) =>
        (m.senderId === userId && m.receiverId === otherUserId) ||
        (m.senderId === otherUserId && m.receiverId === userId)
    ).sort((a, b) => a.createdAt - b.createdAt);
  },

  getConversations: (userId: string): Conversation[] => {
    if (typeof window === 'undefined') return [];
    const messages: Message[] = JSON.parse(localStorage.getItem(MESSAGES_KEY) || '[]');
    const conversations = new Map<string, Conversation>();

    messages.forEach((msg) => {
      if (msg.senderId === userId || msg.receiverId === userId) {
        const otherUserId = msg.senderId === userId ? msg.receiverId : msg.senderId;
        const otherName = msg.senderId === userId ? 'User' : msg.senderName;

        if (!conversations.has(otherUserId)) {
          conversations.set(otherUserId, {
            id: `conv_${userId}_${otherUserId}`,
            participantIds: userId < otherUserId ? [userId, otherUserId] : [otherUserId, userId],
            participantNames: userId < otherUserId ? ['You', otherName] : [otherName, 'You'],
            unreadCount: msg.read ? 0 : 1,
          });
        }
        const conv = conversations.get(otherUserId)!;
        conv.lastMessage = msg.content;
        conv.lastMessageTime = msg.createdAt;
        if (!msg.read && msg.receiverId === userId) {
          conv.unreadCount++;
        }
      }
    });

    return Array.from(conversations.values()).sort((a, b) => (b.lastMessageTime || 0) - (a.lastMessageTime || 0));
  },

  markAsRead: (userId: string, otherUserId: string) => {
    if (typeof window === 'undefined') return;
    const messages: Message[] = JSON.parse(localStorage.getItem(MESSAGES_KEY) || '[]');
    messages.forEach((msg) => {
      if (msg.receiverId === userId && msg.senderId === otherUserId) {
        msg.read = true;
      }
    });
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
  },

  // Proposals
  submitProposal: (
    jobId: string,
    jobTitle: string,
    freelancerId: string,
    freelancerName: string,
    freelancerEmail: string,
    clientId: string,
    bidAmount: number,
    deliveryDays: number,
    message: string
  ) => {
    if (typeof window === 'undefined') return;
    const proposals: Proposal[] = JSON.parse(localStorage.getItem(PROPOSALS_KEY) || '[]');
    const proposal: Proposal = {
      id: `prop_${Date.now()}`,
      jobId,
      jobTitle,
      freelancerId,
      freelancerName,
      freelancerEmail,
      clientId,
      bidAmount,
      deliveryDays,
      message,
      status: 'pending',
      createdAt: Date.now(),
    };
    proposals.push(proposal);
    localStorage.setItem(PROPOSALS_KEY, JSON.stringify(proposals));
    return proposal;
  },

  getJobProposals: (jobId: string): Proposal[] => {
    if (typeof window === 'undefined') return [];
    const proposals: Proposal[] = JSON.parse(localStorage.getItem(PROPOSALS_KEY) || '[]');
    return proposals.filter((p) => p.jobId === jobId).sort((a, b) => b.createdAt - a.createdAt);
  },

  getFreelancerProposals: (freelancerId: string): Proposal[] => {
    if (typeof window === 'undefined') return [];
    const proposals: Proposal[] = JSON.parse(localStorage.getItem(PROPOSALS_KEY) || '[]');
    return proposals.filter((p) => p.freelancerId === freelancerId);
  },

  updateProposalStatus: (proposalId: string, status: 'accepted' | 'rejected') => {
    if (typeof window === 'undefined') return;
    const proposals: Proposal[] = JSON.parse(localStorage.getItem(PROPOSALS_KEY) || '[]');
    const proposal = proposals.find((p) => p.id === proposalId);
    if (proposal) {
      proposal.status = status;
      localStorage.setItem(PROPOSALS_KEY, JSON.stringify(proposals));
    }
  },
};
