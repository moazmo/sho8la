import React from 'react';
import { Shield, Award, Briefcase } from 'lucide-react';

interface TrustBadgesProps {
  isVerified: boolean;
  completedJobs?: number;
  rating?: number;
}

export function TrustBadges({ isVerified, completedJobs = 0, rating = 0 }: TrustBadgesProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {isVerified && (
        <div className="flex items-center gap-1 px-3 py-1 bg-green-100 border border-green-300 rounded-full">
          <Shield className="w-4 h-4 text-green-600" />
          <span className="text-xs font-semibold text-green-700">Verified</span>
        </div>
      )}
      {completedJobs >= 5 && (
        <div className="flex items-center gap-1 px-3 py-1 bg-blue-100 border border-blue-300 rounded-full">
          <Briefcase className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-semibold text-blue-700">Pro ({completedJobs} jobs)</span>
        </div>
      )}
      {rating >= 4.5 && (
        <div className="flex items-center gap-1 px-3 py-1 bg-yellow-100 border border-yellow-300 rounded-full">
          <Award className="w-4 h-4 text-yellow-600" />
          <span className="text-xs font-semibold text-yellow-700">Top Rated</span>
        </div>
      )}
    </div>
  );
}
