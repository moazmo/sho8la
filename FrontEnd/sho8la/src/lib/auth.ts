export type UserRole = 'client' | 'freelancer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  verified?: boolean;
  avatar?: string;
  bio?: string;
  createdAt: number;
}

export interface FreelancerProfile extends User {
  role: 'freelancer';
  skills?: string[];
  hourlyRate?: number;
  portfolioUrl?: string;
  universityId?: string;
  rating?: number;
  completedJobs?: number;
}

export interface ClientProfile extends User {
  role: 'client';
  company?: string;
  jobsPosted?: number;
  totalSpent?: number;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const STORAGE_KEY = 'sho8la_auth';

export const authUtils = {
  saveAuth: (user: User, token: string) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, token }));
  },

  getAuth: () => {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  },

  clearAuth: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
  },

  generateToken: (userId: string) => {
    // Simple mock token - replace with actual JWT in production
    return `token_${userId}_${Date.now()}`;
  },
};
