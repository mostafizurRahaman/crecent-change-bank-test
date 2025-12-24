'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { paymentMethodApi } from '@/lib/api';
import { getStripe } from '@/lib/stripe';
import Layout from '@/components/Layout';
import {
  PaymentElement,
  Elements,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

function CheckoutForm({ clientSecret }: { clientSecret: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Confirm the SetupIntent with card details
      const { error: stripeError, setupIntent } = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-method/success`,
        },
        redirect: 'if_required',
      });

      if (stripeError) {
        setError(stripeError.message || 'Payment setup failed');
        setLoading(false);
        return;
      }

      if (setupIntent?.status === 'succeeded' && setupIntent.payment_method) {
        // Save payment method to backend
        await paymentMethodApi.savePaymentMethod({
          stripePaymentMethodId: setupIntent.payment_method as string,
          isDefault: true,
        });

        setSuccess(true);
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save payment method');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 p-4">
          <p className="text-sm text-green-800">
            ✅ Payment method added successfully! Redirecting to dashboard...
          </p>
        </div>
      )}

      <div className="bg-white border border-gray-300 rounded-lg p-4">
        <PaymentElement />
      </div>

      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={() => router.push('/dashboard')}
          className="text-sm text-gray-600 hover:text-gray-900"
          disabled={loading}
        >
          Skip for now
        </button>
        <button
          type="submit"
          disabled={!stripe || loading || success}
          className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Add Payment Method'}
        </button>
      </div>
    </form>
  );
}

export default function AddPaymentMethodPage() {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/auth/sign-in');
      return;
    }

    const initializeSetupIntent = async () => {
      try {
        const response = await paymentMethodApi.createSetupIntent();
        const clientSecretValue = response.data.data?.client_secret || response.data.clientSecret;
        setClientSecret(clientSecretValue);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to initialize payment setup');
      } finally {
        setLoading(false);
      }
    };

    initializeSetupIntent();
  }, [user, router]);

  if (!user) {
    return null;
  }

  const stripePromise = getStripe();

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Add Payment Method
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Step 4 of 4: Securely add your payment card using Stripe
            </p>

            <div className="mt-4 bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">Secure Payment Processing</h3>
                  <div className="mt-2 text-sm text-green-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Your card details are handled directly by Stripe</li>
                      <li>We never store your raw card information</li>
                      <li>PCI DSS compliant and bank-level security</li>
                      <li>Supports 3D Secure authentication</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-4 rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {loading ? (
              <div className="mt-6 text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <p className="mt-2 text-sm text-gray-600">Initializing secure payment...</p>
              </div>
            ) : clientSecret ? (
              <div className="mt-6">
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    appearance: {
                      theme: 'stripe',
                      variables: {
                        colorPrimary: '#4f46e5',
                      },
                    },
                  }}
                >
                  <CheckoutForm clientSecret={clientSecret} />
                </Elements>
              </div>
            ) : (
              <div className="mt-6 text-center text-red-600">
                Failed to initialize payment. Please try again.
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Test Cards (Development Only)</h4>
          <div className="text-xs text-gray-600 space-y-1">
            <p><strong>Success:</strong> 4242 4242 4242 4242</p>
            <p><strong>3D Secure Required:</strong> 4000 0025 0000 3155</p>
            <p><strong>Declined:</strong> 4000 0000 0000 9995</p>
            <p className="mt-2">Any future expiry date, any 3-digit CVC, any postal code</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
