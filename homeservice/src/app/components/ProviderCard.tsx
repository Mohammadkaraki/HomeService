"use client"
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface ProviderCardProps {
  id: string;
  name: string;
  image: string;
  location: string;
  bio: string;
  rating: number;
  reviewCount: number;
}

const ProviderCard: React.FC<ProviderCardProps> = ({
  id,
  name,
  image,
  location,
  bio,
  rating,
  reviewCount
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-4">
        <div className="flex items-center mb-4">
          <div className="relative w-16 h-16 rounded-full overflow-hidden mr-4 flex-shrink-0">
            <Image 
              src={image} 
              alt={name}
              fill
              sizes="64px"
              className="object-cover"
              onError={(e) => {
                // Fallback to default avatar on error
                const target = e.target as HTMLImageElement;
                target.src = '/icons/default-avatar.svg';
              }}
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{name}</h3>
            <div className="flex items-center text-sm text-gray-600">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
              </svg>
              {location}
            </div>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex items-center mb-1">
            <div className="flex mr-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg 
                  key={star}
                  className={`w-4 h-4 ${star <= rating ? 'text-amber-400' : 'text-gray-300'}`} 
                  fill="currentColor" 
                  viewBox="0 0 20 20" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
              ))}
            </div>
            <span className="text-sm text-gray-600">{reviewCount} reviews</span>
          </div>
          <p className="text-gray-600 text-sm line-clamp-2">{bio}</p>
        </div>
        
        <div className="flex justify-between items-center">
          <Link 
            href={`/provider/${id}`}
            className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center"
          >
            View Profile
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"></path>
            </svg>
          </Link>
          <Link
            href={`/booking/${id}`}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Book Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProviderCard; 