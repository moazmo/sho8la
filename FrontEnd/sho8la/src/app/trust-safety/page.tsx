'use client';

import React from 'react';
import { Navbar } from '@/components/features/Navbar';
import { Shield, Lock, Eye, CheckCircle, AlertCircle, Users } from 'lucide-react';

export default function TrustSafety() {
  const policies = [
    {
      icon: Shield,
      title: 'University ID Verification',
      description: 'All users must verify their university ID to build trust and ensure legitimacy on the platform.',
    },
    {
      icon: Lock,
      title: 'Secure Payments',
      description: 'We use encrypted payment processing. Funds are held in escrow until work is completed and approved.',
    },
    {
      icon: Eye,
      title: 'Dispute Resolution',
      description: 'Have a dispute? Our team reviews both sides and makes fair decisions based on evidence and project history.',
    },
    {
      icon: CheckCircle,
      title: 'Verified Badges',
      description: 'Users with verified IDs display trust badges on their profiles. Higher verification = higher visibility.',
    },
    {
      icon: AlertCircle,
      title: 'Report Violations',
      description: 'Found suspicious activity? Report users or projects directly. We investigate all reports within 48 hours.',
    },
    {
      icon: Users,
      title: 'Community Standards',
      description: 'Keep work professional. No discrimination, harassment, or illegal activities. Violators face account suspension.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Trust & Safety</h1>
          <p className="text-lg text-gray-600">Your safety is our priority. Learn how we protect our community.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {policies.map((policy, idx) => {
            const Icon = policy.icon;
            return (
              <div key={idx} className="bg-white p-6 rounded-xl border border-gray-100">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{policy.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{policy.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Report a Problem</h2>
          <p className="text-gray-700 mb-6">
            Found something wrong? Email us at <strong>safety@sho8la.com</strong> with:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li>User ID or project link</li>
            <li>Description of the issue</li>
            <li>Screenshots or evidence</li>
            <li>When it happened</li>
          </ul>
          <p className="text-sm text-gray-500 mt-6">We aim to respond to all reports within 48 hours.</p>
        </div>
      </div>
    </div>
  );
}
