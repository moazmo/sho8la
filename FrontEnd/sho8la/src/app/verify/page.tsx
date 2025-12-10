'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navbar } from '@/components/features/Navbar';
import { apiClient } from '@/lib/api';
import { Upload, CheckCircle, Clock, AlertCircle, Shield } from 'lucide-react';

interface VerificationData {
  _id: string;
  status: 'pending' | 'verified' | 'rejected' | 'none';
  verificationType?: string;
  university?: string;
  studentId?: string;
  nationalId?: string;
  submittedAt?: string;
  verifiedAt?: string;
  rejectionReason?: string;
}

function VerificationContent() {
  const { user } = useAuth();
  const [verification, setVerification] = useState<VerificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<'student_id' | 'national_id'>('student_id');
  const [university, setUniversity] = useState('Ain Shams');
  const [studentId, setStudentId] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [document, setDocument] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user?.id) {
      apiClient.get(`/verifications/${user.id}`)
        .then((data) => setVerification(data as VerificationData))
        .catch(() => setVerification({ _id: '', status: 'none' }))
        .finally(() => setLoading(false));
    }
  }, [user?.id]);

  const handleSubmit = async () => {
    if (formType === 'student_id' && (!studentId.trim() || !document.trim())) {
      setError('Student ID and document are required');
      return;
    }
    if (formType === 'national_id' && !nationalId.trim()) {
      setError('National ID is required');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const payload = {
        verificationType: formType,
        university: formType === 'student_id' ? university : undefined,
        studentId: formType === 'student_id' ? studentId : undefined,
        nationalId: formType === 'national_id' ? nationalId : undefined,
        documentUrl: document
      };
      await apiClient.post('/verifications', payload);
      // Reload verification status
      const data = await apiClient.get(`/verifications/${user?.id}`) as VerificationData;
      setVerification(data);
      setShowForm(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Submission failed');
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Shield className="w-8 h-8 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-900">ID Verification</h1>
      </div>

      {verification && verification.status !== 'none' ? (
        <div className={`p-6 rounded-xl border-2 ${verification.status === 'verified' ? 'border-green-200 bg-green-50' :
            verification.status === 'rejected' ? 'border-red-200 bg-red-50' :
              'border-yellow-200 bg-yellow-50'
          }`}>
          <div className="flex items-center gap-3 mb-4">
            {verification.status === 'verified' && <CheckCircle className="w-6 h-6 text-green-600" />}
            {verification.status === 'pending' && <Clock className="w-6 h-6 text-yellow-600" />}
            {verification.status === 'rejected' && <AlertCircle className="w-6 h-6 text-red-600" />}
            <h2 className={`text-xl font-bold ${verification.status === 'verified' ? 'text-green-900' :
                verification.status === 'rejected' ? 'text-red-900' :
                  'text-yellow-900'
              }`}>
              {verification.status === 'verified' ? 'Verified ✓' :
                verification.status === 'pending' ? 'Pending Review' :
                  'Rejected'}
            </h2>
          </div>

          <div className="space-y-2 text-sm">
            <p><strong>Type:</strong> {verification.verificationType}</p>
            {verification.university && <p><strong>University:</strong> {verification.university}</p>}
            {verification.studentId && <p><strong>Student ID:</strong> {verification.studentId}</p>}
            {verification.nationalId && <p><strong>National ID:</strong> {verification.nationalId}</p>}
            {verification.submittedAt && <p><strong>Submitted:</strong> {new Date(verification.submittedAt).toLocaleDateString()}</p>}
            {verification.rejectionReason && <p className="text-red-700"><strong>Reason:</strong> {verification.rejectionReason}</p>}
          </div>
        </div>
      ) : !showForm ? (
        <div className="bg-white p-8 rounded-xl border border-gray-100">
          <p className="text-gray-600 mb-6">Verify your ID to unlock:</p>
          <ul className="space-y-2 mb-8 text-sm">
            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-600" /> Trust badge on profile</li>
            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-600" /> Higher job visibility</li>
            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-600" /> Better client confidence</li>
          </ul>
          <button
            onClick={() => setShowForm(true)}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2"
          >
            <Upload className="w-5 h-5" /> Start Verification
          </button>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-xl border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Submit Verification</h2>

          {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Verification Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setFormType('student_id')}
                  className={`p-3 rounded-lg border-2 ${formType === 'student_id' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                >
                  Student ID
                </button>
                <button
                  onClick={() => setFormType('national_id')}
                  className={`p-3 rounded-lg border-2 ${formType === 'national_id' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                >
                  National ID
                </button>
              </div>
            </div>

            {formType === 'student_id' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">University</label>
                  <select
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option>Ain Shams</option>
                    <option>AUC</option>
                    <option>GUC</option>
                    <option>Cairo University</option>
                    <option>Helwan University</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Student ID</label>
                  <input
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="e.g., 20210123456"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </>
            )}

            {formType === 'national_id' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">National ID Number</label>
                <input
                  type="text"
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value)}
                  placeholder="e.g., 29901011234567"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Document URL</label>
              <input
                type="text"
                value={document}
                onChange={(e) => setDocument(e.target.value)}
                placeholder="Paste document URL"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg disabled:bg-gray-400"
              >
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VerificationPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <VerificationContent />
      </div>
    </ProtectedRoute>
  );
}
