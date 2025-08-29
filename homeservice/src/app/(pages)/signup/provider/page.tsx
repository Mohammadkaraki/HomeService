"use client"
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const ProviderSignupRedirect = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the provider register page
    router.push('/provider/register');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to provider registration...</p>
      </div>
    </div>
  );
};

export default ProviderSignupRedirect; 