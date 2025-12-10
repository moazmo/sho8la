import { User, FreelancerProfile, ClientProfile } from './auth';

const PROFILE_STORAGE_KEY = 'sho8la_profile';

export const profileUtils = {
  getProfile: (userId: string): (FreelancerProfile | ClientProfile | null) => {
    if (typeof window === 'undefined') return null;
    const profiles = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!profiles) return null;
    const allProfiles = JSON.parse(profiles);
    return allProfiles[userId] || null;
  },

  saveProfile: (userId: string, profile: FreelancerProfile | ClientProfile) => {
    if (typeof window === 'undefined') return;
    const profiles = localStorage.getItem(PROFILE_STORAGE_KEY);
    const allProfiles = profiles ? JSON.parse(profiles) : {};
    allProfiles[userId] = profile;
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(allProfiles));
  },

  createFreelancerProfile: (user: User): FreelancerProfile => ({
    ...user,
    role: 'freelancer',
    skills: [],
    hourlyRate: 0,
    rating: 5,
    completedJobs: 0,
  }),

  createClientProfile: (user: User): ClientProfile => ({
    ...user,
    role: 'client',
    company: '',
    jobsPosted: 0,
    totalSpent: 0,
  }),
};
