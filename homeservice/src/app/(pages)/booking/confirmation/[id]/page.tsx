"use client"
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../../../components/Navbar';
import { bookings } from '../../../../utils/api';
import { useAuth } from '../../../../context/AuthContext';
import ProtectedRoute from '../../../../components/ProtectedRoute';

interface Booking {
  _id: string;
  user: {
    _id: string;
    fullName: string;
  };
  provider: {
    _id: string;
    fullName: string;
  };
  service: {
    category: {
      _id: string;
      name: string;
    };
    subcategory?: {
      _id: string;
      name: string;
    };
  };
  bookingDate: string;
  startTime: string;
  estimatedHours: number;
  totalPrice: number;
  status: string;
  userDetails: {
    fullName: string;
    phoneNumber: string;
    location: string;
  };
  notes?: string;
  paymentStatus: string;
  createdAt: string;
}

const BookingConfirmationPage = () => {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookingData = async () => {
      try {
        setLoading(true);
        const response = await bookings.getById(bookingId);
        console.log("booking data", response.data);
        setBooking(response.data);

        // If provider doesn't have fullName, fetch it separately
        if (response.data && response.data.provider && !response.data.provider.fullName) {
          try {
            const providerId = response.data.provider._id;
            const providerResponse = await fetch(`http://localhost:5000/api/providers/${providerId}`);
            const providerData = await providerResponse.json();
            
            if (providerData.success && providerData.data) {
              // Update the booking with provider details
              setBooking(prev => {
                if (!prev) return response.data;
                return {
                  ...prev,
                  provider: {
                    ...prev.provider,
                    fullName: providerData.data.fullName || 'Provider'
                  }
                };
              });
            }
          } catch (providerError) {
            console.error('Error fetching provider details:', providerError);
          }
        }
      } catch (err: any) {
        console.error('Error fetching booking data:', err);
        setError('Failed to load booking information. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) {
      fetchBookingData();
    }
  }, [bookingId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <ProtectedRoute allowedRoles={['user']}>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="container mx-auto px-4 py-8">
          {loading ? (
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
              <p>{error}</p>
            </div>
          ) : booking ? (
            <div className="max-w-3xl mx-auto">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-emerald-600 p-6 text-white">
                  <div className="flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h1 className="text-3xl font-bold text-center">Booking Confirmed!</h1>
                  <p className="text-center mt-2 text-emerald-100">
                    Your booking has been successfully placed with <span className="font-bold">{booking.provider.fullName || 'your provider'}</span>.
                  </p>
                </div>
                
                <div className="p-6">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">Booking Details</h2>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Booking ID</p>
                          <p className="font-medium">{booking._id}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Status</p>
                          <p className="font-medium capitalize">{booking.status}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Date</p>
                          <p className="font-medium">{formatDate(booking.bookingDate)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Time</p>
                          <p className="font-medium">{booking.startTime}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Duration</p>
                          <p className="font-medium">{booking.estimatedHours} {booking.estimatedHours === 1 ? 'hour' : 'hours'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Total Price</p>
                          <p className="font-medium">${booking.totalPrice.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">Provider Information</h2>
                    <div className="bg-emerald-50 p-4 rounded-md border border-emerald-100">
                      <div className="flex items-center mb-3">
                        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mr-4">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-emerald-700">Your Service Provider</p>
                          <p className="font-bold text-xl text-emerald-800">{booking.provider.fullName || 'Your Provider'}</p>
                        </div>
                      </div>
                      <p className="text-sm text-emerald-600 italic">
                        {booking.provider.fullName || 'Your provider'} will provide {booking.service.category.name} services 
                        {booking.service.subcategory ? ` (${booking.service.subcategory.name})` : ''} as requested.
                      </p>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">Service Information</h2>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Category</p>
                          <p className="font-medium">{booking.service.category.name}</p>
                        </div>
                        {booking.service.subcategory && (
                          <div>
                            <p className="text-sm text-gray-500">Subcategory</p>
                            <p className="font-medium">{booking.service.subcategory.name}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-sm text-gray-500">Location</p>
                          <p className="font-medium">{booking.userDetails.location}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">Customer Details</h2>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Name</p>
                          <p className="font-medium">{booking.userDetails.fullName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Phone Number</p>
                          <p className="font-medium">{booking.userDetails.phoneNumber}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Service Location</p>
                          <p className="font-medium">{booking.userDetails.location}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {booking.notes && (
                    <div className="mb-6">
                      <h2 className="text-xl font-semibold mb-2">Additional Notes</h2>
                      <div className="bg-gray-50 p-4 rounded-md">
                        <p>{booking.notes}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="border-t border-gray-200 pt-6 mt-6">
                    <div className="flex flex-col md:flex-row gap-4 justify-between">
                      <Link 
                        href="/bookings" 
                        className="inline-block px-6 py-3 bg-gray-200 text-gray-800 font-medium rounded-md hover:bg-gray-300 transition-colors text-center"
                      >
                        View All Bookings
                      </Link>
                      <Link 
                        href="/" 
                        className="inline-block px-6 py-3 bg-emerald-600 text-white font-medium rounded-md hover:bg-emerald-700 transition-colors text-center"
                      >
                        Back to Home
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Booking not found</p>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default BookingConfirmationPage; 