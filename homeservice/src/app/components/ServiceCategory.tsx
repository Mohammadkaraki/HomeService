// components/ServiceCategory.tsx
"use client"
import React, { useState } from 'react';
import Image from 'next/image';

interface CategoryProps {
  name: string;
  description?: string;
  image?: string;
  isActive?: boolean;
  onClick?: () => void;
}

const ServiceCategory: React.FC<CategoryProps> = ({ 
  name,
  description,
  image,
  isActive = false, 
  onClick
}) => {
  const [imgError, setImgError] = useState(false);
  
  // Ensure the image URL is valid
  const getValidImageUrl = (url?: string): string => {
    if (!url) return '/images/placeholder.jpg';
    
    // Check if it's a relative path or already an absolute URL
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // Ensure it starts with a leading slash for local images
    return url.startsWith('/') ? url : `/${url}`;
  };
  
  return (
    <div className="h-full bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300">
      <div className="relative h-48 bg-emerald-50">
        {image && (
          <Image
            src={imgError ? '/images/placeholder.jpg' : getValidImageUrl(image)}
            alt={name}
            fill
            className="object-cover"
            onError={() => setImgError(true)}
          />
        )}
      </div>
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{name}</h3>
        {description && (
          <p className="text-gray-600 line-clamp-2">{description}</p>
        )}
      </div>
    </div>
  );
};

export default ServiceCategory;