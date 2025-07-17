'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/Button';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

const plans = [
  {
    id: 'monthly',
    name: 'Monthly Plan',
    price: 9.99,
    features: [
      'Create custom questions',
      'Access detailed statistics',
      'Comment on questions',
      'Priority support'
    ]
  },
  {
    id: 'yearly',
    name: 'Yearly Plan',
    price: 99.99,
    features: [
      'All Monthly Plan features',
      '2 months free',
      'Early access to new features',
      'Custom analytics dashboard'
    ]
  }
];

export default function PremiumPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<string>('monthly');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubscribe = async (planId: string) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3001/api/subscriptions/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          planId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { sessionId } = await response.json();
      const stripe = await stripePromise;
      
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      const { error } = await stripe.redirectToCheckout({ sessionId });
      
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error starting subscription:', error);
      setError('Failed to start subscription process');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Upgrade to Premium
            </h1>
            <p className="mt-4 text-xl text-gray-600">
              Get access to exclusive features and enhance your experience
            </p>
          </div>

          {error && (
            <div className="mt-8 max-w-md mx-auto bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`bg-white rounded-lg shadow-lg overflow-hidden ${
                  selectedPlan === plan.id ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <div className="px-6 py-8">
                  <h3 className="text-2xl font-semibold text-gray-900">
                    {plan.name}
                  </h3>
                  <p className="mt-4 text-3xl font-bold text-gray-900">
                    ${plan.price}
                    <span className="text-base font-medium text-gray-500">
                      {plan.id === 'monthly' ? '/mo' : '/year'}
                    </span>
                  </p>
                  <ul className="mt-6 space-y-4">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center">
                        <svg
                          className="h-5 w-5 text-green-500"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="ml-3 text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="mt-8 w-full"
                    onClick={() => handleSubscribe(plan.id)}
                    isLoading={isLoading && selectedPlan === plan.id}
                    disabled={isLoading}
                  >
                    {isLoading && selectedPlan === plan.id
                      ? 'Processing...'
                      : 'Subscribe Now'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 