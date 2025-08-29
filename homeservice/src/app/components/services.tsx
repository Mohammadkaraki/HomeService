import React from 'react';
import Navbar from '../components/Navbar';
import CleaningCard from '../components/CleaningCard';
import Head from 'next/head';

const Services: React.FC = () => {
  // Services data
  const cleaningServices = [
    'House cleaning',
    'Carpet cleaning',
    'Deep cleaning and sanitization',
    'Window cleaning',
    'Pool cleaning and maintenance'
  ];

  return (
    <>
      <Head>
        <title>Cleaning Services</title>
        <meta name="description" content="Our cleaning and maintenance services" />
      </Head>
      
      <Navbar />
      
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Our Cleaning Services</h1>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Generate 12 cleaning cards as shown in the image */}
            {Array(12).fill(0).map((_, i) => (
              <CleaningCard key={i} services={cleaningServices} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Services;