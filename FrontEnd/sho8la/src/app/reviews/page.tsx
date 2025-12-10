'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { reviewUtils, type Review } from '@/lib/review';
import { Navbar } from '@/components/features/Navbar';
import { Star, Send } from 'lucide-react';

function ReviewsContent() {
  const { user } = useAuth();
  const [userRating, setUserRating] = useState<{ average: number; count: number; reviews: Review[] }>({
    average: 0,
    count: 0,
    reviews: [],
  });
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [formData, setFormData] = useState({
    jobId: '',
    proposalId: '',
    toUserId: '',
    toUserName: '',
    rating: 5,
    comment: '',
  });

  useEffect(() => {
    if (user?.id) {
      const rating = reviewUtils.getUserRating(user.id);
      setUserRating(rating);
    }
  }, [user?.id]);

  const handleSubmitReview = () => {
    if (!formData.jobId || !formData.toUserId || !formData.comment.trim() || !user?.id) return;

    reviewUtils.submitReview(
      formData.jobId,
      formData.proposalId,
      user.id,
      user.name,
      formData.toUserId,
      formData.toUserName,
      formData.rating,
      formData.comment
    );

    setUserRating(reviewUtils.getUserRating(user.id));
    setFormData({ jobId: '', proposalId: '', toUserId: '', toUserName: '', rating: 5, comment: '' });
    setShowSubmitForm(false);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Reviews & Ratings</h1>

        {/* User Rating Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Your Rating</h2>
          <div className="flex items-center gap-6">
            <div>
              <p className="text-4xl font-bold text-gray-900">{userRating.average.toFixed(1)}</p>
              <p className="text-sm text-gray-500 mt-1">out of 5</p>
            </div>
            <div>
              {renderStars(Math.round(userRating.average))}
              <p className="text-sm text-gray-600 mt-2">
                Based on <span className="font-semibold">{userRating.count}</span> reviews
              </p>
            </div>
            <div className="ml-auto">
              <button
                onClick={() => setShowSubmitForm(!showSubmitForm)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition"
              >
                Leave a Review
              </button>
            </div>
          </div>
        </div>

        {/* Submit Review Form */}
        {showSubmitForm && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Submit a Review</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Job ID</label>
                  <input
                    type="text"
                    placeholder="Job ID"
                    value={formData.jobId}
                    onChange={(e) => setFormData({ ...formData, jobId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Freelancer Name</label>
                  <input
                    type="text"
                    placeholder="Freelancer name"
                    value={formData.toUserName}
                    onChange={(e) => setFormData({ ...formData, toUserName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Freelancer ID</label>
                <input
                  type="text"
                  placeholder="Freelancer ID"
                  value={formData.toUserId}
                  onChange={(e) => setFormData({ ...formData, toUserId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <button
                      key={i}
                      onClick={() => setFormData({ ...formData, rating: i })}
                      className={`p-2 rounded-lg transition ${
                        formData.rating >= i
                          ? 'bg-yellow-100'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                      title={`${i} stars`}
                      aria-label={`${i} stars`}
                    >
                      <Star
                        className={`w-6 h-6 ${
                          i <= formData.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Comment</label>
                <textarea
                  placeholder="Share your experience..."
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none h-24 resize-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSubmitReview}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Submit Review
                </button>
                <button
                  onClick={() => setShowSubmitForm(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reviews List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Received Reviews</h2>
          </div>

          {userRating.reviews.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p className="text-sm">No reviews yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {userRating.reviews.map((review) => (
                <div key={review.id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {review.fromUserName}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {renderStars(review.rating)}
                  </div>
                  <p className="text-gray-600 text-sm">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ReviewsPage() {
  return (
    <ProtectedRoute requiredRole={undefined}>
      <ReviewsContent />
    </ProtectedRoute>
  );
}
