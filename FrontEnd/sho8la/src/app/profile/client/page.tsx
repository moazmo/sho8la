'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navbar } from '@/components/features/Navbar';
import { profileUtils } from '@/lib/profile';
import type { ClientProfile } from '@/lib/auth';
import { Edit2, Briefcase, DollarSign, FileText, Save } from 'lucide-react';

function ClientProfileContent() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    bio: '',
  });

  useEffect(() => {
    if (user?.id) {
      const userProfile = profileUtils.getProfile(user.id) as ClientProfile;
      if (userProfile) setProfile(userProfile);
      setFormData({
        name: userProfile?.name || '',
        company: userProfile?.company || '',
        bio: userProfile?.bio || '',
      });
    }
  }, [user?.id]);

  const handleSave = () => {
    if (!user?.id || !profile) return;

    const updated: ClientProfile = {
      ...profile,
      name: formData.name,
      company: formData.company,
      bio: formData.bio,
    };

    profileUtils.saveProfile(user.id, updated);
    setProfile(updated);
    setIsEditing(false);
  };

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Profile Header Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
              <p className="text-gray-500 mt-1">{profile.email}</p>
              {profile.company && <p className="text-gray-600 mt-1">{profile.company}</p>}
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition text-sm font-medium"
            >
              <Edit2 className="w-4 h-4" />
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-600">Jobs Posted</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{profile.jobsPosted || 0}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Briefcase className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-600">Active Projects</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-orange-600" />
                <span className="text-sm text-gray-600">Total Spent</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{profile.totalSpent || 0} EGP</p>
            </div>
          </div>
        </div>

        {/* Edit Form or Display */}
        {isEditing ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Company name..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tell freelancers about your business..."
              />
            </div>

            <button
              onClick={handleSave}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {profile.bio && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">About</h2>
                <p className="text-gray-600 leading-relaxed">{profile.bio}</p>
              </div>
            )}

            {!profile.bio && (
              <div className="bg-white rounded-xl shadow-sm border border-dashed border-gray-300 p-6 text-center">
                <p className="text-gray-500 text-sm">Add a bio to help freelancers understand your business</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ClientProfile() {
  return (
    <ProtectedRoute requiredRole="client">
      <ClientProfileContent />
    </ProtectedRoute>
  );
}
