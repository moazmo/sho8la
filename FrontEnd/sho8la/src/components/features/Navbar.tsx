'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => { setIsLoaded(true); }, []);

  const handleLogout = () => { logout(); router.push('/'); };

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'client') return '/dashboard/client';
    return '/dashboard/freelancer';
  };

  if (!isLoaded) {
    return (
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="text-2xl font-bold text-blue-600 tracking-tight">
            Sho8la<span className="text-orange-500">.</span>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-blue-600 tracking-tight hover:opacity-80 transition">
          Sho8la<span className="text-orange-500">.</span>
        </Link>

        <div className="hidden md:flex gap-6 text-sm font-medium text-gray-600">
          {/* Public links */}
          <Link href="/jobs" className="hover:text-blue-600 transition">Find Work</Link>

          {/* Client only */}
          {user?.role === 'client' && (
            <Link href="/post-job" className="hover:text-blue-600 transition">Post Job</Link>
          )}

          {/* Logged in users */}
          {user && (
            <>
              <Link href="/messages" className="hover:text-blue-600 transition">Messages</Link>
              <Link href="/wallet" className="hover:text-blue-600 transition">Wallet</Link>
            </>
          )}

          {/* Freelancer only */}
          {user?.role === 'freelancer' && (
            <Link href="/proposals" className="hover:text-blue-600 transition">My Proposals</Link>
          )}

          {/* Admin only */}
          {user?.role === 'admin' && (
            <Link href="/admin" className="hover:text-blue-600 transition text-red-600">Admin</Link>
          )}
        </div>

        <div className="flex gap-4 items-center">
          {user ? (
            <>
              <span className="text-sm text-gray-600 hidden sm:inline">
                {user.name} <span className="text-xs text-gray-400">({user.role})</span>
              </span>
              <Link href={getDashboardLink()} className="text-sm font-medium text-gray-600 hover:text-gray-900 py-2 px-3 rounded transition">
                Dashboard
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900 py-2 px-3">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 py-2">Log In</Link>
              <Link href="/register" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2 px-4 rounded-lg transition-all shadow-md hover:shadow-lg">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
