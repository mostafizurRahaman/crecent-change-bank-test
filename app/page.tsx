'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import Link from 'next/link';

export default function Home() {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      if (user.hasProfile) {
        router.push('/dashboard');
      } else {
        router.push('/profile/create');
      }
    }
  }, [user, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center min-h-screen py-12">
          <div className="text-center">
            <h1 className="text-5xl font-extrabold text-gray-900 sm:text-6xl">
              Stripe Payment Integration
            </h1>
            <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
              Secure, PCI-compliant payment method management using Stripe Elements
            </p>

            <div className="mt-8 bg-white rounded-lg shadow-xl p-8 max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                ✅ Secure Implementation Features
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="font-semibold text-gray-900">No Card Storage</p>
                    <p className="text-sm text-gray-600">Card details never touch your server</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="font-semibold text-gray-900">Stripe Elements</p>
                    <p className="text-sm text-gray-600">Secure card input directly from Stripe</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="font-semibold text-gray-900">PCI Compliant</p>
                    <p className="text-sm text-gray-600">Bank-level security standards</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="font-semibold text-gray-900">3D Secure Ready</p>
                    <p className="text-sm text-gray-600">Support for SCA authentication</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/sign-up"
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg"
              >
                Get Started
              </Link>
              <Link
                href="/auth/sign-in"
                className="inline-flex items-center justify-center px-8 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 shadow-lg"
              >
                Sign In
              </Link>
            </div>

            <div className="mt-12 text-sm text-gray-600">
              <p className="font-semibold mb-2">Complete User Flow:</p>
              <div className="flex flex-wrap justify-center gap-2">
                <span className="px-3 py-1 bg-white rounded-full shadow">1. Sign Up</span>
                <span className="text-gray-400">→</span>
                <span className="px-3 py-1 bg-white rounded-full shadow">2. Verify OTP</span>
                <span className="text-gray-400">→</span>
                <span className="px-3 py-1 bg-white rounded-full shadow">3. Sign In</span>
                <span className="text-gray-400">→</span>
                <span className="px-3 py-1 bg-white rounded-full shadow">4. Create Profile</span>
                <span className="text-gray-400">→</span>
                <span className="px-3 py-1 bg-white rounded-full shadow">5. Add Payment Method</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
