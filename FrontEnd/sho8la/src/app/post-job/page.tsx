'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/features/Navbar';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { jobsApi } from '@/lib/apiServices';
import { UploadCloud, DollarSign, Briefcase, Clock, MapPin } from 'lucide-react';

function PostJobContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Web Development',
    budget: '',
    description: '',
    skills: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setLoading(true);
    try {
      const jobData = {
        title: formData.title,
        description: formData.description,
        budget: Number(formData.budget),
        category: formData.category,
        skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
        clientId: user.id
      };

      await jobsApi.create(jobData);
      alert('Job posted successfully!');
      router.push('/jobs');
    } catch (error) {
      alert('Failed to post job. Please try again.');
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Post a New Job</h1>
          <p className="mt-2 text-gray-500">Describe your project to attract the best talent.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
            <input type="text" name="title" required placeholder="e.g. Build a Restaurant Menu Website"
              className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={formData.title} onChange={handleChange} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              <select name="category" aria-label="Job category"
                className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                value={formData.category} onChange={handleChange}>
                <option>Web Development</option>
                <option>Mobile App</option>
                <option>Graphic Design</option>
                <option>Data Science / AI</option>
                <option>Translation / Writing</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Budget (EGP)</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              <input type="number" name="budget" required placeholder="1000"
                className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.budget} onChange={handleChange} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea name="description" rows={5} required placeholder="Explain what you need..."
              className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={formData.description} onChange={handleChange} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Required Skills (comma separated)</label>
            <input type="text" name="skills" placeholder="React, Python, Logo Design..."
              className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={formData.skills} onChange={handleChange} />
          </div>

          <button type="submit" disabled={loading}
            className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-xl transition-all">
            <UploadCloud className="w-5 h-5" />
            {loading ? 'Posting...' : 'Publish Job'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function PostJobPage() {
  return (
    <ProtectedRoute requiredRole="client">
      <PostJobContent />
    </ProtectedRoute>
  );
}