"use client"
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import DateSelectionModal from './DateSelectionModal';
import { providers, reviews } from '../utils/api';

interface Provider {
  _id: string;
  fullName: string;
  bio: string;
  location: string;
  profileImage?: string;
  isVerified: boolean;
  isActive: boolean;
  isElite: boolean;
  averageRating: number;
  totalReviews: number;
  totalCompletedTasks: number;
  services: Array<{
    category: string | { _id: string; name: string };
    subcategories: Array<string | { _id: string; name: string }>;
    hourlyRate: number;
  }>;
  availability: {
    monday: { start: string; end: string; isAvailable: boolean };
    tuesday: { start: string; end: string; isAvailable: boolean };
    wednesday: { start: string; end: string; isAvailable: boolean };
    thursday: { start: string; end: string; isAvailable: boolean };
    friday: { start: string; end: string; isAvailable: boolean };
    saturday: { start: string; end: string; isAvailable: boolean };
    sunday: { start: string; end: string; isAvailable: boolean };
  };
}

interface Review {
  _id: string;
  rating: number;
  comment: string;
  user: {
    fullName: string;
    image?: string;
  };
  createdAt: string;
}

interface ServiceListingProps {
  provider: Provider;
}

const ServiceListing: React.FC<ServiceListingProps> = ({ provider }) => {
  const router = useRouter();
  const [showDateModal, setShowDateModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [providerReviews, setProviderReviews] = useState<Review[]>([]);
  const [showFullBio, setShowFullBio] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

  // Truncate bio if it's too long
  const bioPreviewLength = 150;
  const isBioLong = provider.bio.length > bioPreviewLength;
  const truncatedBio = isBioLong && !showFullBio 
    ? `${provider.bio.substring(0, bioPreviewLength)}...` 
    : provider.bio;

  const toggleBio = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowFullBio(!showFullBio);
  };

  const toggleReviews = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowAllReviews(!showAllReviews);
  };

  // Use provider's totalReviews count instead of the fetched reviews length
  const reviewCountToDisplay = provider.totalReviews;

  // Only display the show more button if we have multiple reviews
  const hasMultipleReviews = providerReviews.length > 1;
  
  // Update the useEffect for fetching reviews to explicitly log what's happening
  useEffect(() => {
    const fetchProviderReviews = async () => {
      try {
        setLoading(true);
        console.log('Fetching reviews for provider ID:', provider._id);
        const reviewsResponse = await reviews.getByProviderId(provider._id);
        
        console.log('Reviews API response:', reviewsResponse);
        // Check the exact format of the response
        console.log('Response data type:', typeof reviewsResponse.data);
        console.log('Response data full:', JSON.stringify(reviewsResponse.data, null, 2));
        
        if (reviewsResponse && reviewsResponse.data) {
          // Check if data is already an array
          if (Array.isArray(reviewsResponse.data)) {
            setProviderReviews(reviewsResponse.data);
            console.log('Reviews loaded (array):', reviewsResponse.data.length);
          } 
          // Check if data contains a reviews property that is an array
          else if (reviewsResponse.data.reviews && Array.isArray(reviewsResponse.data.reviews)) {
            setProviderReviews(reviewsResponse.data.reviews);
            console.log('Reviews loaded (data.reviews):', reviewsResponse.data.reviews.length);
          }
          // Check if data is an object with a results property
          else if (reviewsResponse.data.results && Array.isArray(reviewsResponse.data.results)) {
            setProviderReviews(reviewsResponse.data.results);
            console.log('Reviews loaded (data.results):', reviewsResponse.data.results.length);
          }
          // No recognizable array format
          else {
            console.warn('Reviews response data is not in expected format');
            console.warn('Response structure:', Object.keys(reviewsResponse.data));
            setProviderReviews([]);
          }
        } else {
          console.log('No reviews returned from API');
          setProviderReviews([]);
        }
      } catch (err: any) {
        console.error('Error fetching provider reviews:', err);
        console.error('Error details:', JSON.stringify(err, null, 2));
        
        // TEMPORARY: Use sample reviews for testing when API isn't working
        if (err.message && (err.message.includes('Network Error') || err.code === 'ECONNREFUSED')) {
          console.log('Using temporary sample reviews due to connection error');
          const tempReviews = [
            {
              _id: `temp_review_${provider._id}_1`,
              rating: 5,
              comment: "Excellent service! Very professional and completed the job quickly.",
              user: {
                fullName: "Sarah Johnson",
                image: "default-avatar.jpg"
              },
              createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              _id: `temp_review_${provider._id}_2`,
              rating: 4,
              comment: "Great work, would hire again. Very knowledgeable and helpful throughout the process.",
              user: {
                fullName: "Michael Brown",
                image: "default-avatar.jpg"
              },
              createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              _id: `temp_review_${provider._id}_3`,
              rating: 5,
              comment: "Prompt, courteous, and did an amazing job. I'm very satisfied with the service.",
              user: {
                fullName: "Jennifer Davis",
                image: "default-avatar.jpg"
              },
              createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString()
            }
          ];
          setProviderReviews(tempReviews);
        } else {
          // For other errors, just set empty array
          setProviderReviews([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProviderReviews();
  }, [provider._id]);

  const handleDateConfirm = (date: Date, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
    setShowDateModal(false);
    
    // Get the service data to pass to userdetails
    if (provider) {
      // Navigate to the userdetails page
      router.push('/userdetails');
    }
  };

  // Helper function to extract service details
  const getServiceDetails = () => {
    if (!provider?.services || provider.services.length === 0) {
      return undefined;
    }

    const service = provider.services[0];
    
    // Extract category ID
    let categoryId: string | undefined;
    if (service.category) {
      // If it's an object with _id and name (populated)
      if (typeof service.category === 'object' && service.category._id) {
        categoryId = service.category._id;
      } else {
        // If it's just the ID
        categoryId = service.category as string;
      }
    }
    
    // Extract subcategory ID
    let subcategoryId: string | undefined = undefined;
    if (service.subcategories && service.subcategories.length > 0) {
      const subcat = service.subcategories[0];
      subcategoryId = typeof subcat === 'object' && subcat._id ? subcat._id : subcat as string;
    }

    return {
      hourlyRate: service.hourlyRate,
      categoryId,
      subcategoryId
    };
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 mb-6 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex flex-col md:flex-row">
        {/* Provider Profile Section */}
        <div className="md:w-1/4 p-4 flex flex-col items-center bg-gray-50">
          <div className="relative w-32 h-32 rounded-full overflow-hidden mb-4 border-2 border-emerald-100 shadow-md">
            <Image 
              src={provider.profileImage ? `/uploads/providers/${provider.profileImage}` : '/images/default-provider.jpg'} 
              alt={provider.fullName} 
              layout="fill" 
              objectFit="cover" 
              className="rounded-full"
            />
          </div>
          <div className="w-full flex flex-col justify-between">
            <div className="mb-4">
              {provider.isVerified && (
                <div className="mb-2 flex items-center justify-center bg-emerald-50 py-1 px-2 rounded-full">
                  <svg className="w-4 h-4 text-emerald-600 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                  <span className="text-sm font-medium text-emerald-700">Verified Provider</span>
                </div>
              )}
              {provider.isElite && (
                <div className="flex items-center justify-center bg-blue-50 py-1 px-2 rounded-full">
                  <svg className="w-4 h-4 text-blue-600 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span className="text-sm font-medium text-blue-700">Elite Provider</span>
                </div>
              )}
            </div>
            
            <button 
              onClick={() => setShowDateModal(true)}
              className="w-full py-2.5 px-4 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50 shadow-sm font-medium"
            >
              Select & Continue
            </button>
            
            <p className="text-xs text-gray-600 mt-3 text-center">
              You can chat with your provider, adjust dates, add tasks, and more after booking.
            </p>
          </div>
        </div>

        {/* Provider Details Section */}
        <div className="md:w-3/4 p-5 border-b md:border-b-0 md:border-l border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-xl text-gray-800">{provider.fullName}</h3>
            <div className="text-right">
              <span className="text-2xl font-bold text-emerald-700">${provider.services[0]?.hourlyRate || 0}</span>
              <span className="text-gray-600 font-medium">/hr</span>
            </div>
          </div>
          
          <div className="flex items-center mb-3">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <span key={i}>★</span>
              ))}
            </div>
            <span className="text-sm ml-2 font-medium">{provider.averageRating.toFixed(1)} ({provider.totalReviews} reviews)</span>
          </div>
          
          <div className="flex space-x-4 mb-4">
            <div className="bg-emerald-50 px-3 py-1 rounded-full">
              <p className="text-sm font-medium text-emerald-800">{provider.totalCompletedTasks} Completed Tasks</p>
            </div>
            <div className="bg-gray-100 px-3 py-1 rounded-full">
              <p className="text-sm font-medium text-gray-700">{provider.isActive ? 'Available' : 'Not Available'}</p>
            </div>
          </div>
          
          <h4 className="font-semibold text-gray-800 mb-2">About Me:</h4>
          
          <div className="mb-3 bg-gray-50 p-3 rounded-lg">
            <div className="flex items-start">
              <div className="bg-green-100 text-green-800 rounded-md px-2 py-1 text-xs font-bold mr-2 mt-1 uppercase">
                {provider.isActive ? 'Available' : 'Not Available'}
              </div>
              <p className="text-sm leading-relaxed text-gray-700">
                {truncatedBio}
              </p>
            </div>
          </div>
          
          {isBioLong && (
            <button onClick={toggleBio} className="text-emerald-600 text-sm font-medium hover:underline inline-flex items-center">
              {showFullBio ? 'Show Less' : 'Read More'}
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
              </svg>
            </button>
          )}
          
          {/* Review Section - Display Reviews */}
          {providerReviews.length > 0 ? (
            <div className="mt-4">
              <h4 className="font-semibold text-gray-800 mb-2">Recent Reviews</h4>
              
              {/* Show first review or all reviews based on state */}
              {(showAllReviews ? providerReviews : providerReviews.slice(0, 1)).map((review, index) => (
                <div key={review._id} className={`flex items-start bg-gray-50 p-3 rounded-lg ${index > 0 ? 'mt-3' : ''}`}>
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-300 mr-3 flex-shrink-0 border-2 border-white shadow-sm">
                    <Image 
                      src={review.user.image ? `/uploads/users/${review.user.image}` : "/images/default-avatar.jpg"}
                      alt={review.user.fullName} 
                      width={40} 
                      height={40} 
                      objectFit="cover" 
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {review.user.fullName} <span className="text-gray-500 font-normal ml-1">
                        on {new Date(review.createdAt).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </p>
                    <div className="flex text-yellow-400 my-1">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < review.rating ? "" : "text-gray-300"}>★</span>
                      ))}
                    </div>
                    <p className="text-sm text-gray-700">"{review.comment}"</p>
                  </div>
                </div>
              ))}
              
              {providerReviews.length > 1 && (
                <button 
                  type="button"
                  onClick={toggleReviews} 
                  className="mt-2 text-emerald-600 text-sm hover:underline focus:outline-none"
                >
                  {showAllReviews ? 'Show less' : `See all ${providerReviews.length} reviews`}
                </button>
              )}
            </div>
          ) : (
            <div className="mt-4">
              <h4 className="font-semibold text-gray-800 mb-2">Reviews</h4>
              <p className="text-sm text-gray-600">No reviews available for this provider yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Date Selection Modal */}
      {showDateModal && (
        <DateSelectionModal
          onConfirm={handleDateConfirm}
          onClose={() => setShowDateModal(false)}
          taskerName={provider.fullName}
          providerId={provider._id}
          serviceDetails={getServiceDetails()}
        />
      )}
    </div>
  );
};

export default ServiceListing;