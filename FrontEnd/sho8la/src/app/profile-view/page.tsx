'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { profileUtils } from '@/lib/profile';
import { reviewUtils } from '@/lib/review';
import { Navbar } from '@/components/features/Navbar';
import { Star, Mail, Briefcase, Award } from 'lucide-react';
import type { FreelancerProfile, ClientProfile } from '@/lib/auth';

function ProfileContent() {
  const searchParams = useSearchParams();
  const userId = searchParams.get('id');
  const [profile, setProfile] = useState<FreelancerProfile | ClientProfile | null>(null);
  const [rating, setRating] = useState({ average: 0, count: 0 });

  useEffect(() => {
    if (userId) {
      const userProfile = profileUtils.getProfile(userId);
      if (userProfile) {
        setProfile(userProfile);
        const userRating = reviewUtils.getUserRating(userId);
        setRating({ average: userRating.average, count: userRating.count });
      }
    }
  }, [userId]);

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i <= Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-gray-500">Profile not found</p>
        </div>
      </div>
    );
  }

  const isFreelancer = profile.role === 'freelancer';
  const freelancerProfile = profile as FreelancerProfile;
  const clientProfile = profile as ClientProfile;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
              <p className="text-gray-600 mt-2 flex items-center gap-1">
                <Mail className="w-4 h-4" />
                {profile.email}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Rating</p>
              <p className="text-2xl font-bold text-gray-900">{rating.average.toFixed(1)}</p>
              <div className="mt-1">{renderStars(rating.average)}</div>
              <p className="text-xs text-gray-500 mt-1">({rating.count} reviews)</p>
            </div>
          </div>

          {profile.bio && (
            <p className="text-gray-600 mt-4 text-sm">{profile.bio}</p>
          )}
        </div>

        {/* Freelancer Details */}
        {isFreelancer && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Skills */}
            {freelancerProfile.skills && freelancerProfile.skills.length > 0 && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                  Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {freelancerProfile.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-green-600" />
                Statistics
              </h2>
              <div className="space-y-3">
                {freelancerProfile.hourlyRate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hourly Rate</span>
                    <span className="font-semibold text-gray-900">${freelancerProfile.hourlyRate}/hr</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Completed Jobs</span>
                  <span className="font-semibold text-gray-900">{freelancerProfile.completedJobs || 0}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Client Details */}
        {!isFreelancer && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-600" />
              Client Information
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {clientProfile.company && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Company</p>
                  <p className="font-semibold text-gray-900">{clientProfile.company}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500 mb-1">Jobs Posted</p>
                <p className="font-semibold text-gray-900">{clientProfile.jobsPosted || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Spent</p>
                <p className="font-semibold text-gray-900">${clientProfile.totalSpent || 0}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function UserProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>}>
      <ProfileContent />
    </Suspense>
  );
}
