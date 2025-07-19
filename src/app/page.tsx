'use client'

import Link from "next/link";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-xl text-gray-600 dark:text-gray-300">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-16">
          <header className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Beyblade Tracker
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
              Track your collection, manage tournament stats, and analyze your performance with the ultimate Beyblade companion app.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/signup"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Get Started
              </Link>
              <Link
                href="/login"
                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Sign In
              </Link>
            </div>
          </header>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="text-center bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="text-blue-600 dark:text-blue-400 text-4xl mb-2">📦</div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Collection Management</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">Track all your Beyblade parts and inventory</p>
            </div>
            <div className="text-center bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="text-purple-600 dark:text-purple-400 text-4xl mb-2">⚡</div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Combo Builder</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">Create and manage winning combinations</p>
            </div>
            <div className="text-center bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="text-green-600 dark:text-green-400 text-4xl mb-2">🏆</div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Tournament Tracking</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">Record results and analyze performance</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation currentPage="home" />
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-16">
          <header className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Beyblade Tracker
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Track your collection, manage tournament stats, and analyze your performance with the ultimate Beyblade companion app.
            </p>
          </header>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Collection Management Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                  Collection Manager
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Track your Beyblade parts including blades, assist blades, ratchets, and bits. Know exactly what you have and what you need.
                </p>
                <Link
                  href="/collection"
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Manage Collection
                </Link>
              </div>
            </div>

            {/* Combo Builder Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                  Combo Builder
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Create and manage your Beyblade combinations. Build winning combos from your parts for tournaments.
                </p>
                <Link
                  href="/combos"
                  className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Build Combos
                </Link>
              </div>
            </div>

            {/* Tournament Tracker Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                  Tournament Tracker
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Record tournament results, track combo performance, and see which combinations work best for you.
                </p>
                <Link
                  href="/tournaments"
                  className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Track Tournaments
                </Link>
              </div>
            </div>
          </div>

          <div className="text-center mt-16">
            <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-8">
              Key Features
            </h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-blue-600 dark:text-blue-400 text-4xl mb-2">⚡</div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Part Tracking</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">Keep count of all your Beyblade parts</p>
              </div>
              <div className="text-center">
                <div className="text-green-600 dark:text-green-400 text-4xl mb-2">🏆</div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Performance Analytics</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">See which combos perform best</p>
              </div>
              <div className="text-center">
                <div className="text-purple-600 dark:text-purple-400 text-4xl mb-2">📊</div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Leaderboards</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">Rank your top performing combos</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
