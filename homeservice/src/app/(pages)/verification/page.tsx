"use client"
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';

const Verification = () => {
  const router = useRouter();
  const [verificationCode, setVerificationCode] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVerificationCode(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Verification code submitted:', verificationCode);
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-gray-50">
      <Head>
        <title>Verification | HomeService</title>
        <meta name="description" content="Verify your account" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="w-full max-w-md">
        <div className="w-full bg-white rounded-lg shadow-md p-6 md:p-8 flex flex-col items-center">
          <h1 className="text-4xl font-bold text-black mb-8">HomeService</h1>
          
          <h2 className="text-2xl font-medium mb-6">Verification Code</h2>
          
          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <input
              type="text"
              placeholder="Enter Here ..."
              value={verificationCode}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
            
            <button 
              type="submit" 
              className="w-full py-3 bg-green-700 text-white font-semibold rounded-md hover:bg-green-800 transition duration-200"
            >
              Submit
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default Verification;