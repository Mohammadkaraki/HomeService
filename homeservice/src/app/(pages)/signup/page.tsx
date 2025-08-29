"use client"
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Head from 'next/head';

const AccountTypeSelection = () => {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<'customer' | 'provider' | null>(null);

  const handleContinue = () => {
    if (selectedType === 'customer') {
      router.push('/signup/customer');
    } else if (selectedType === 'provider') {
      router.push('/signup/provider');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Head>
        <title>Sign Up | Home Services</title>
        <meta name="description" content="Create your Home Services account" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-emerald-600">Home Services</h1>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Create an account</h2>
          <p className="mt-2 text-sm text-gray-600">Select account type to continue</p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <div className="space-y-4">
              {/* Account type selection */}
              <div 
                className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedType === 'customer' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300 hover:border-emerald-300'}`}
                onClick={() => setSelectedType('customer')}
              >
                <div className="flex items-center">
                  <div className={`w-5 h-5 rounded-full border ${selectedType === 'customer' ? 'border-emerald-500 bg-emerald-500' : 'border-gray-400'} flex items-center justify-center`}>
                    {selectedType === 'customer' && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-gray-900">Customer</h3>
                    <p className="text-sm text-gray-500">I want to book services</p>
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-500 pl-8">Create an account to book home services, track your appointments, and leave reviews.</p>
              </div>

              <div 
                className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedType === 'provider' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300 hover:border-emerald-300'}`}
                onClick={() => setSelectedType('provider')}
              >
                <div className="flex items-center">
                  <div className={`w-5 h-5 rounded-full border ${selectedType === 'provider' ? 'border-emerald-500 bg-emerald-500' : 'border-gray-400'} flex items-center justify-center`}>
                    {selectedType === 'provider' && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-gray-900">Service Provider</h3>
                    <p className="text-sm text-gray-500">I want to offer services</p>
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-500 pl-8">Create a provider account to offer your services, manage your bookings, and grow your business.</p>
              </div>
            </div>

            <div>
              <button
                onClick={handleContinue}
                disabled={!selectedType}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>

            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/login" className="font-medium text-emerald-600 hover:text-emerald-500">
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountTypeSelection;