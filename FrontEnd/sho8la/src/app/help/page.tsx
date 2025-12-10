'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/features/Navbar';
import { HelpCircle, ChevronDown } from 'lucide-react';

export default function Help() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const faqs = [
    {
      category: 'Getting Started',
      items: [
        {
          q: 'How do I create an account?',
          a: 'Click "Get Started" on the homepage, choose your role (freelancer or client), and fill in your details. Your account is created instantly!',
        },
        {
          q: 'Is it free to join?',
          a: 'Yes, creating an account is completely free. We only take a small commission when you complete payments.',
        },
        {
          q: 'Why do I need to verify my university ID?',
          a: 'University ID verification ensures all users are real students, building trust in the community and protecting everyone.',
        },
      ],
    },
    {
      category: 'For Freelancers',
      items: [
        {
          q: 'How do I find jobs?',
          a: 'Go to "Find Work" to browse available jobs. You can filter by category, budget, and deadline. Click a job to submit a proposal.',
        },
        {
          q: 'How do proposals work?',
          a: 'Submit a proposal with your bid amount, delivery time, and cover letter. Clients review proposals and choose the best one.',
        },
        {
          q: 'When do I get paid?',
          a: 'After you submit your completed work, the client reviews it. Once approved, funds go to your wallet. You can withdraw anytime.',
        },
        {
          q: 'How do I withdraw money?',
          a: 'Go to "Withdraw" and request a withdrawal. Choose bank transfer or mobile wallet. Admin approval takes 1-2 business days.',
        },
      ],
    },
    {
      category: 'For Clients',
      items: [
        {
          q: 'How do I post a job?',
          a: 'Go to "Hire Talent", click "Post a Job", describe your project, set the budget, and publish. Freelancers will start submitting proposals!',
        },
        {
          q: 'How much does it cost?',
          a: 'Posting a job is free. We only charge when you approve a freelancer\'s work - a small percentage of the project amount.',
        },
        {
          q: 'How do I choose the right freelancer?',
          a: 'Review their proposals, ratings, completed jobs, and verified status. Message them with questions before hiring.',
        },
        {
          q: 'What if I\'m not satisfied with the work?',
          a: 'Reject the work submission with feedback. The freelancer can revise and resubmit. If issues persist, contact support.',
        },
      ],
    },
    {
      category: 'Payments & Disputes',
      items: [
        {
          q: 'Is my payment secure?',
          a: 'Yes. We use encrypted payment processing and hold funds in escrow until work is approved.',
        },
        {
          q: 'What payment methods do you accept?',
          a: 'InstaPay and Vodafone Cash. More methods coming soon!',
        },
        {
          q: 'What happens if there\'s a dispute?',
          a: 'Our team investigates both sides, reviews evidence, and makes a fair decision. Most disputes are resolved within 5 business days.',
        },
      ],
    },
    {
      category: 'Account & Safety',
      items: [
        {
          q: 'How do I update my profile?',
          a: 'Go to your dashboard, click "Profile", and edit your information. Changes are saved immediately.',
        },
        {
          q: 'Can I change my account type?',
          a: 'Currently, you can\'t switch roles. Create a new account if you want to work as both freelancer and client.',
        },
        {
          q: 'What do I do if my account is hacked?',
          a: 'Change your password immediately. If you\'re locked out, email support@sho8la.com to recover your account.',
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <HelpCircle className="w-12 h-12 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Help & FAQ</h1>
          <p className="text-lg text-gray-600">Find answers to common questions about Sho8la</p>
        </div>

        <div className="space-y-8">
          {faqs.map((section, sectionIdx) => (
            <div key={sectionIdx}>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-600">{section.category}</h2>
              <div className="space-y-2">
                {section.items.map((item, itemIdx) => {
                  const globalIdx = sectionIdx * 100 + itemIdx;
                  return (
                    <div key={itemIdx} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                      <button
                        onClick={() => setOpenIdx(openIdx === globalIdx ? null : globalIdx)}
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
                      >
                        <h3 className="text-left font-semibold text-gray-900">{item.q}</h3>
                        <ChevronDown className={`w-5 h-5 text-gray-400 transition ${openIdx === globalIdx ? 'rotate-180' : ''}`} />
                      </button>
                      {openIdx === globalIdx && (
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                          <p className="text-gray-700 leading-relaxed">{item.a}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-blue-50 border border-blue-200 rounded-xl p-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Didn&apos;t find your answer?</h2>
          <p className="text-gray-700 mb-4">Email us at support@sho8la.com and we&apos;ll help you out!</p>
        </div>
      </div>
    </div>
  );
}
