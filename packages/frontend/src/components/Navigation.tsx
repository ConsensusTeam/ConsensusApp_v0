'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Navigation() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-blue-600">
                Consensus
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/"
                className="inline-flex items-center px-1 pt-1 text-gray-900"
              >
                Today's Question
              </Link>
              <Link
                href="/stats"
                className="inline-flex items-center px-1 pt-1 text-gray-500 hover:text-gray-900"
              >
                Statistics
              </Link>
              {user?.isPremium && (
                <>
                  <Link
                    href="/questions/create"
                    className="inline-flex items-center px-1 pt-1 text-gray-500 hover:text-gray-900"
                  >
                    Create Question
                  </Link>
                  <Link
                    href="/my-questions"
                    className="inline-flex items-center px-1 pt-1 text-gray-500 hover:text-gray-900"
                  >
                    My Questions
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                {user.isAdmin && (
                  <Link
                    href="/admin/questions"
                    className="text-gray-500 hover:text-gray-900"
                  >
                    Admin Dashboard
                  </Link>
                )}
                {!user.isPremium && (
                  <Link
                    href="/premium"
                    className="text-blue-500 hover:text-blue-700"
                  >
                    Upgrade to Premium
                  </Link>
                )}
                {user.isPremium && (
                  <span className="text-yellow-500">★ Premium</span>
                )}
                <span className="text-gray-500">{user.name}</span>
                <button
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-gray-900"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-x-4">
                <Link
                  href="/login"
                  className="text-gray-500 hover:text-gray-900"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 