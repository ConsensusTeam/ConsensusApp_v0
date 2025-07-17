'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PremiumPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const premiumFeatures = [
    {
      title: 'Create Custom Questions',
      description: 'Create and share your own questions with the community'
    },
    {
      title: 'Advanced Statistics',
      description: 'Get detailed insights and analytics for all questions'
    },
    {
      title: 'Early Access',
      description: 'Be the first to answer new questions'
    },
    {
      title: 'Premium Badge',
      description: 'Show your support with a premium member badge'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8">
        Premium Features
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {premiumFeatures.map((feature, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow p-6 border border-gray-200"
          >
            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-gray-600">{feature.description}</p>
          </div>
        ))}
      </div>

      <div className="text-center">
        <p className="text-gray-600 mb-6">
          Premium features are currently available by request. Please contact an administrator to enable premium access for your account.
        </p>

        <div className="space-y-4">
          <Link
            href="/contact"
            className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
          >
            Contact Administrator
          </Link>
          <div>
            <Link
              href="/"
              className="text-gray-500 hover:text-gray-700"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 