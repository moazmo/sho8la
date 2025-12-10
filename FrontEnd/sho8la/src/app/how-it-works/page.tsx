'use client';

import React from 'react';
import { Navbar } from '@/components/features/Navbar';
import { CheckCircle, Users, Briefcase, DollarSign, Shield, TrendingUp } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      icon: Users,
      title: 'Create Account',
      description: 'Sign up as freelancer or client. Verify your university ID for trust badge.',
    },
    {
      icon: Briefcase,
      title: 'Post or Browse Jobs',
      description: 'Clients post projects. Freelancers browse and submit proposals.',
    },
    {
      icon: CheckCircle,
      title: 'Get Hired',
      description: 'Clients review proposals and accept the best fit for their project.',
    },
    {
      icon: TrendingUp,
      title: 'Complete Work',
      description: 'Freelancer submits work. Client reviews and approves completion.',
    },
    {
      icon: DollarSign,
      title: 'Get Paid',
      description: 'Funds released to wallet. Request withdrawal to your bank account.',
    },
    {
      icon: Shield,
      title: 'Build Reputation',
      description: 'Earn ratings and reviews. Build trust and grow your freelance business.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">How Sho8la Works</h1>
          <p className="text-xl text-gray-600">A simple platform connecting Egyptian students for freelance work</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={idx} className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-2xl font-bold text-gray-300">{idx + 1}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-12 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="mb-8 text-blue-100">Join thousands of Egyptian students earning and learning on Sho8la</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a href="/register?role=freelancer" className="px-8 py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition">
              Find Work
            </a>
            <a href="/register?role=client" className="px-8 py-3 border-2 border-white text-white font-bold rounded-lg hover:bg-blue-800 transition">
              Hire Talent
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
