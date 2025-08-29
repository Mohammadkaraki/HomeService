"use client"
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { services } from '../utils/api';

interface Service {
  _id: string;
  provider: {
    _id: string;
    fullName: string;
    profileImage?: string;
    averageRating?: number;
  };
  category: {
    _id: string;
    name: string;
  };
  subcategory?: {
    _id: string;
    name: string;
  };
  title: string;
  description: string;
  basePrice: number;
  priceUnit: string;
  isAvailable: boolean;
}

interface ServiceListProps {
  categoryId?: string;
  subcategoryId?: string;
}

const ServiceList: React.FC<ServiceListProps> = ({ categoryId, subcategoryId }) => {
  const [serviceList, setServiceList] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const query: any = {};
        
        if (categoryId) {
          query.category = categoryId;
        }
        
        if (subcategoryId) {
          query.subcategory = subcategoryId;
        }
        
        const response = await services.getAll(query);
        setServiceList(response.data);
      } catch (err: any) {
        console.error('Error fetching services:', err);
        setError('Failed to load services. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [categoryId, subcategoryId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          {[1, 2, 3].map((index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md flex flex-col md:flex-row gap-4">
              <div className="w-full md:w-1/4 h-40 bg-gray-200 rounded-md"></div>
              <div className="w-full md:w-3/4 space-y-3">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-10 bg-gray-200 rounded w-1/4 mt-4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (serviceList.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-gray-500">No services available for this category at the moment.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {serviceList.map((service) => (
          <div key={service._id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-1/4">
                <div className="aspect-video bg-gray-100 rounded-md overflow-hidden relative">
                  <Image 
                    src="/images/service-placeholder.jpg" 
                    alt={service.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="mt-3 flex items-center">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center overflow-hidden mr-2">
                    {service.provider.profileImage ? (
                      <Image 
                        src={service.provider.profileImage} 
                        alt={service.provider.fullName}
                        width={40}
                        height={40}
                        className="object-cover"
                      />
                    ) : (
                      <span className="text-emerald-700 font-semibold">
                        {service.provider.fullName.charAt(0)}
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-medium">{service.provider.fullName}</span>
                </div>
              </div>
              
              <div className="w-full md:w-3/4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">{service.title}</h3>
                    <div className="text-sm text-gray-500 mt-1">
                      {service.category.name} {service.subcategory && `› ${service.subcategory.name}`}
                    </div>
                  </div>
                  <div className="text-xl font-bold text-emerald-600">
                    ${service.basePrice}/{service.priceUnit}
                  </div>
                </div>
                
                <p className="text-gray-600 mt-3 line-clamp-3">{service.description}</p>
                
                <div className="mt-4">
                  <Link 
                    href={`/service/${service._id}`}
                    className="inline-block px-6 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceList; 