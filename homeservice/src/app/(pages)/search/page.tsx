"use client"
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/app/components/Navbar';
import { providers as providersApi } from '@/app/utils/api';

interface Provider {
  _id: string;
  fullName: string;
  location: string;
  bio: string;
  phoneNumber: string;
  email: string;
  services: any[];
  isVerified: boolean;
  isActive: boolean;
}

const SearchPage = () => {
  const searchParams = useSearchParams();
  const query = searchParams.get('query') || '';
  
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        setLoading(true);
        if (!query) {
          setProviders([]);
          return;
        }
        
        // Create a filter URL with the search parameter
        const searchUrl = `/providers?search=${encodeURIComponent(query)}`;
        console.log('Search URL:', searchUrl);
        
        // Use getByFilter instead of getAll to pass search parameters
        const response = await providersApi.getByFilter(searchUrl);
        console.log('Search results response:', response);
        
        if (response && response.data) {
          // Check if backend returns the standard format with success, count and data properties
          if (response.data.success && response.data.data) {
            setProviders(response.data.data);
            console.log('Search results loaded (standard format):', response.data.data.length);
          }
          // Fallback to direct array if not in standard format
          else if (Array.isArray(response.data)) {
            setProviders(response.data);
          }
          // Other possible formats
          else if (response.data.providers && Array.isArray(response.data.providers)) {
            setProviders(response.data.providers);
          }
          else if (response.data.results && Array.isArray(response.data.results)) {
            setProviders(response.data.results);
          }
          else {
            console.warn('Search results response is not in expected format');
            console.warn('Response structure:', Object.keys(response.data));
            setProviders([]);
            setError('Provider data format is unexpected. Check console for details.');
          }
        } else {
          console.warn('Search results response missing data property');
          setProviders([]);
          setError('No search results found');
        }
      } catch (err) {
        console.error('Error fetching search results:', err);
        setError('Failed to load search results. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          {query ? `Search Results for "${query}"` : 'Search Results'}
        </h1>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 mb-6">
            <p>{error}</p>
          </div>
        ) : providers.length > 0 ? (
          <div className="grid gap-6">
            {providers.map((provider) => (
              <div 
                key={provider._id} 
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <Link href={`/provider/${provider._id}`} className="block p-6">
                  <div className="flex flex-col md:flex-row md:items-center">
                    <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
                      <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-xl font-semibold">
                        {provider.fullName.charAt(0)}
                      </div>
                    </div>
                    
                    <div className="flex-grow">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                        <h2 className="text-xl font-semibold text-gray-800">{provider.fullName}</h2>
                        <div className="flex items-center mt-2 md:mt-0">
                          {provider.isVerified && (
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center mr-2">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Verified
                            </span>
                          )}
                          {provider.services?.length > 0 && (
                            <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                              {provider.services.length} Service{provider.services.length !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-500 mb-2">
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {provider.location}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-3 line-clamp-2">{provider.bio}</p>
                      
                      <div className="flex justify-end">
                        <span className="inline-flex items-center text-sm font-medium text-emerald-600 hover:text-emerald-700">
                          View Profile
                          <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No results found</h3>
            <p className="mt-1 text-gray-500">
              {query 
                ? `No service providers matching "${query}" were found.` 
                : 'Please enter a search term to find service providers.'}
            </p>
            <div className="mt-6">
              <Link href="/" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700">
                Back to Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage; 