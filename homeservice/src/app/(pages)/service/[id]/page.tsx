"use client"
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Navbar from '../../../components/Navbar';
import { services } from '../../../utils/api';
import { useAuth } from '../../../context/AuthContext';

interface Service {
  _id: string;
  provider: {
    _id: string;
    fullName: string;
    profileImage?: string;
    bio?: string;
    averageRating?: number;
    totalReviews?: number;
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
  serviceArea: string[];
  tags: string[];
}

const ServiceDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const serviceId = params.id as string;
  
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hours, setHours] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);
  const [bookingDate, setBookingDate] = useState('');
  const [startTime, setStartTime] = useState('');

  useEffect(() => {
    const fetchServiceData = async () => {
      try {
        setLoading(true);
        const response = await services.getById(serviceId);
        setService(response.data);
        setTotalPrice(response.data.basePrice);
      } catch (err: any) {
        console.error('Error fetching service data:', err);
        setError('Failed to load service information. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (serviceId) {
      fetchServiceData();
    }
  }, [serviceId]);

  useEffect(() => {
    if (service) {
      setTotalPrice(service.basePrice * hours);
    }
  }, [hours, service]);

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      setHours(value);
    }
  };

  const handleBookNow = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!bookingDate || !startTime) {
      alert('Please select a date and time for your booking');
      return;
    }

    router.push(`/booking/new?service=${serviceId}&date=${bookingDate}&time=${startTime}&hours=${hours}`);
  };

  // Get today's date in YYYY-MM-DD format for min date in date picker
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-2/3"></div>
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-2/3 space-y-4">
                <div className="h-64 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
              <div className="w-full md:w-1/3 h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
            <p>{error}</p>
          </div>
        ) : service ? (
          <>
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-800">{service.title}</h1>
              <div className="text-sm text-gray-500 mt-1">
                {service.category.name} {service.subcategory && `› ${service.subcategory.name}`}
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-8">
              {/* Service details */}
              <div className="w-full md:w-2/3">
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="h-64 bg-gray-100 relative">
                    <Image 
                      src="/images/service-placeholder.jpg" 
                      alt={service.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center overflow-hidden mr-3">
                        {service.provider.profileImage ? (
                          <Image 
                            src={service.provider.profileImage.startsWith('http') 
                              ? service.provider.profileImage
                              : `/uploads/providers/${service.provider.profileImage}`} 
                            alt={service.provider.fullName}
                            width={48}
                            height={48}
                            className="object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              // Show fallback initial
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = `<span class="text-emerald-700 font-semibold text-lg">${service.provider.fullName.charAt(0)}</span>`;
                              }
                            }}
                          />
                        ) : (
                          <span className="text-emerald-700 font-semibold text-lg">
                            {service.provider.fullName.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium">{service.provider.fullName}</h3>
                        <div className="text-sm text-gray-500">
                          {service.provider.averageRating ? (
                            <span>★ {service.provider.averageRating.toFixed(1)} ({service.provider.totalReviews} reviews)</span>
                          ) : (
                            <span>New Provider</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <h2 className="text-xl font-semibold mb-3">About this service</h2>
                    <p className="text-gray-700 mb-6">{service.description}</p>
                    
                    {service.serviceArea.length > 0 && (
                      <div className="mb-6">
                        <h3 className="font-semibold mb-2">Service Areas</h3>
                        <div className="flex flex-wrap gap-2">
                          {service.serviceArea.map((area, index) => (
                            <span key={index} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                              {area}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {service.tags.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                          {service.tags.map((tag, index) => (
                            <span key={index} className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Booking panel */}
              <div className="w-full md:w-1/3">
                <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                  <h2 className="text-xl font-semibold mb-4">Book this service</h2>
                  
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-700">Price</span>
                      <span className="text-xl font-bold text-emerald-600">
                        ${service.basePrice}/{service.priceUnit}
                      </span>
                    </div>
                    
                    {service.priceUnit === 'hour' && (
                      <div className="mb-4">
                        <label className="block text-gray-700 mb-2">
                          Estimated Hours
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={hours}
                          onChange={handleHoursChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    )}
                    
                    <div className="mb-4">
                      <label className="block text-gray-700 mb-2">
                        Date
                      </label>
                      <input
                        type="date"
                        min={today}
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    
                    <div className="mb-6">
                      <label className="block text-gray-700 mb-2">
                        Time
                      </label>
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    
                    <div className="border-t border-gray-200 pt-4 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Total</span>
                        <span className="text-xl font-bold text-emerald-600">
                          ${totalPrice.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    
                    <button
                      onClick={handleBookNow}
                      className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-md hover:bg-emerald-700 transition-colors"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">Service not found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceDetailPage; 