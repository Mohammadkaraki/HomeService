"use client"
import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import { services, bookings } from '../../../utils/api';
import { useAuth } from '../../../context/AuthContext';
import ProtectedRoute from '../../../components/ProtectedRoute';

interface Service {
  _id: string;
  provider: {
    _id: string;
    fullName: string;
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
  basePrice: number;
  priceUnit: string;
}

const BookingFormPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  
  const serviceId = searchParams.get('service');
  const date = searchParams.get('date');
  const time = searchParams.get('time');
  const hours = searchParams.get('hours') || '1';
  
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    location: '',
    notes: ''
  });
  const [totalPrice, setTotalPrice] = useState(0);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Get token from localStorage (safe in useEffect for browser environment)
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    setToken(storedToken);
    
    // Redirect if not authenticated
    if (!isAuthenticated) {
      router.push('/login?redirect=' + encodeURIComponent(window.location.pathname + window.location.search));
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    const fetchServiceData = async () => {
      if (!serviceId) {
        router.push('/');
        return;
      }
      
      try {
        setLoading(true);
        const response = await services.getById(serviceId);
        setService(response.data);
        
        // Calculate total price
        const hoursNum = parseInt(hours);
        setTotalPrice(response.data.basePrice * hoursNum);
        
        // Pre-fill user data if available
        if (user) {
          setFormData(prev => ({
            ...prev,
            fullName: user.fullName || '',
            phoneNumber: user.phoneNumber || '',
            location: user.location || ''
          }));
        }
      } catch (err: any) {
        console.error('Error fetching service data:', err);
        setError('Failed to load service information. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchServiceData();
  }, [serviceId, hours, user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!service || !date || !time) {
      setError('Missing required booking information');
      return;
    }
    
    if (!isAuthenticated || !user) {
      setError('You must be logged in to book a service');
      router.push('/login?redirect=' + encodeURIComponent(window.location.pathname + window.location.search));
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      
      // Format the date string to a proper Date object
      const formattedDate = new Date(date);
      
      const bookingData = {
        user: user._id,
        service: {
          category: service.category._id,
          subcategory: service.subcategory?._id
        },
        provider: service.provider._id,
        bookingDate: formattedDate,
        startTime: time,
        estimatedHours: parseInt(hours),
        totalPrice,
        userDetails: {
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber,
          location: formData.location
        },
        notes: formData.notes
      };
      
      // Debug logging
      console.log('Booking Data:', bookingData);
      console.log('Auth Token:', token);
      
      const response = await bookings.create(bookingData);
      router.push(`/booking/confirmation/${response.data._id}`);
    } catch (err: any) {
      console.error('Error creating booking:', err);
      console.error('Error response:', err.response?.data);
      
      if (err.response?.status === 401) {
        setError('Your session has expired. Please login again.');
        router.push('/login?redirect=' + encodeURIComponent(window.location.pathname + window.location.search));
      } else {
        setError(err.response?.data?.message || 'Failed to create booking. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['user']}>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Complete Your Booking</h1>
          
          {loading ? (
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
              <p>{error}</p>
            </div>
          ) : service ? (
            <div className="flex flex-col md:flex-row gap-8">
              {/* Booking form */}
              <div className="w-full md:w-2/3">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4">Your Information</h2>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                        disabled={submitting}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                        disabled={submitting}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 mb-2">
                        Service Location
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                        disabled={submitting}
                        placeholder="Enter the address where service will be performed"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 mb-2">
                        Additional Notes (Optional)
                      </label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[100px]"
                        disabled={submitting}
                        placeholder="Any special instructions or details the service provider should know"
                      />
                    </div>
                    
                    <button
                      type="submit"
                      className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-md hover:bg-emerald-700 transition-colors disabled:opacity-50"
                      disabled={submitting}
                    >
                      {submitting ? 'Processing...' : 'Confirm Booking'}
                    </button>
                  </form>
                </div>
              </div>
              
              {/* Booking summary */}
              <div className="w-full md:w-1/3">
                <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                  <h2 className="text-xl font-semibold mb-4">Booking Summary</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-gray-700">Service</h3>
                      <p className="text-gray-900">{service.title}</p>
                      <p className="text-sm text-gray-500">
                        {service.category.name} {service.subcategory && `› ${service.subcategory.name}`}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-gray-700">Provider</h3>
                      <p className="text-gray-900">{service.provider.fullName}</p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-gray-700">Date & Time</h3>
                      <p className="text-gray-900">
                        {new Date(date as string).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                      <p className="text-gray-900">
                        {time} ({hours} {parseInt(hours) === 1 ? 'hour' : 'hours'})
                      </p>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Total</span>
                        <span className="text-xl font-bold text-emerald-600">
                          ${totalPrice.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Payment will be collected after service completion
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Service not found</p>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default BookingFormPage; 