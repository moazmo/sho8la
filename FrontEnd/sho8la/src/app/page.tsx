'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, CheckCircle, ShieldCheck, Zap, GraduationCap } from 'lucide-react';
import JobCard from '../components/features/JobCard';
import { Navbar } from '../components/features/Navbar';
import jobsData from '../data/jobs.json';
import { useAuth } from '@/contexts/AuthContext';

export default function LandingPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    // Only redirect once immediately after login/register
    if (user && !hasRedirected) {
      const referrer = document.referrer;
      if (referrer.includes('/login') || referrer.includes('/register')) {
        setHasRedirected(true);
        router.push(user.role === 'client' ? '/dashboard/client' : '/dashboard/freelancer');
      }
    }
  }, [user, hasRedirected, router]);

  const featuredJobs = jobsData.slice(0, 3);

  return (
    <div className="min-h-screen bg-white">
      
      {/* 1. NAVBAR */}
      <Navbar />

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden bg-gray-50 pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-8 animate-fade-in-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            #1 Freelance Platform for Egyptian Students
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-6 leading-tight">
            Hire Top <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Student Talent</span> <br />
            in Egypt Securely.
          </h1>
          
          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Connect with verified CS students from Cairo University, Ain Shams, and more. 
            Pay locally via <span className="font-semibold text-gray-700">InstaPay</span> and <span className="font-semibold text-gray-700">Vodafone Cash</span>.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/post-job" className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white text-lg font-bold py-4 px-8 rounded-xl hover:bg-blue-700 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1">
              Post a Job for Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/jobs" className="inline-flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-200 text-lg font-bold py-4 px-8 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
              I Want to Work
            </Link>
          </div>

          {/* Social Proof Logos (Text Placeholder) */}
          <div className="mt-16 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-400 font-medium uppercase tracking-widest mb-6">Trusted by Students From</p>
            <div className="flex justify-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
              {/* You would use <img> here for real logos */}
              <span className="text-xl font-black text-gray-400">Cairo University</span>
              <span className="text-xl font-black text-gray-400">Ain Shams</span>
              <span className="text-xl font-black text-gray-400">AUC</span>
              <span className="text-xl font-black text-gray-400">GUC</span>
              <span className="text-xl font-black text-gray-400">FCAI</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. VALUE PROPOSITION */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12">
            
            {/* Feature 1 */}
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Escrow Protection</h3>
              <p className="text-gray-600 leading-relaxed">
                We hold the money until the work is done. Clients feel safe paying, and students know the money exists.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Local Payments</h3>
              <p className="text-gray-600 leading-relaxed">
                Forget PayPal issues. Pay and get paid using the methods you actually use: InstaPay, Fawry, and Wallets.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-6">
                <GraduationCap className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Verified Students</h3>
              <p className="text-gray-600 leading-relaxed">
                We check university IDs. Hire ambitious juniors who are eager to build their portfolio for fair rates.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 4. FEATURED JOBS PREVIEW */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Latest Opportunities</h2>
              <p className="mt-2 text-gray-500">Fresh projects added today.</p>
            </div>
            <Link href="/jobs" className="text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-1">
              View all jobs <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </div>
      </section>

      {/* 5. CTA / FOOTER */}
      <footer className="bg-gray-900 text-white py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <h2 className="text-2xl font-bold mb-4">Sho8la.</h2>
            <p className="text-gray-400 max-w-sm">
              The first freelance marketplace dedicated to Egyptian Computer Science students and local businesses.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-gray-300">For Clients</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link href="/post-job">Post a Job</Link></li>
              <li><Link href="/how-it-works">How to Hire</Link></li>
              <li><Link href="/trust-safety">Trust & Safety</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-gray-300">For Students</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link href="/jobs">Browse Jobs</Link></li>
              <li><Link href="/profile">Create Profile</Link></li>
              <li><Link href="/verify">Verify ID</Link></li>
              <li><Link href="/how-it-works">How It Works</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-4">Resources</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link href="/help">Help & FAQ</Link></li>
              <li><Link href="/trust-safety">Trust & Safety</Link></li>
              <li><Link href="/admin/verify">Verify Submissions</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
          © 2025 Sho8la Inc. Made with ❤️ in Egypt.
        </div>
      </footer>

    </div>
  );
}