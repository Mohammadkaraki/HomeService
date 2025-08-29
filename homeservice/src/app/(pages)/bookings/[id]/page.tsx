"use client"
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { bookings } from '../../../utils/api';
import Link from 'next/link';

interface BookingDetails {
  _id: string;
  provider: {
    _id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    profileImage?: string;
  };
  user: {
    _id: string;
    fullName: string;
    email: string;
  };
  service: {
    _id: string;
    name: string;
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
  endTime?: string;
  duration: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  totalPrice: number;
  userDetails: {
    fullName: string;
    phoneNumber: string;
    location: string;
  };
  notes?: string;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  createdAt: string;
}

const BookingDetailsPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await bookings.getById(id as string);
        setBooking(response.data);
      } catch (err: any) {
        console.error('Error fetching booking details:', err);
        setError(err.response?.data?.message || 'Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookingDetails();
  }, [id]);

  // Check if the current user is allowed to view this booking (either the user who made the booking or the provider)
  const canViewBooking = () => {
    if (!user || !booking) return false;
    
    return (
      user._id === booking.user._id || 
      user._id === booking.provider._id ||
      user.role === 'admin'
    );
  };

  const handleUpdateStatus = async (newStatus: 'confirmed' | 'completed' | 'cancelled') => {
    if (!booking) return;
    
    try {
      await bookings.update(booking._id, { status: newStatus });
      
      // Refresh booking details
      const response = await bookings.getById(booking._id);
      setBooking(response.data);
    } catch (err: any) {
      console.error('Error updating booking status:', err);
      setError(err.response?.data?.message || 'Failed to update booking status');
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Header */}
            <div className="bg-emerald-700 text-white p-6">
              <h1 className="text-2xl font-bold">Booking Details</h1>
              <p className="text-emerald-100">View your booking information</p>
            </div>
            
            {/* Content */}
            {loading ? (
              <div className="p-8 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
              </div>
            ) : error ? (
              <div className="p-6 bg-red-50 border-l-4 border-red-500 text-red-700">
                <p>{error}</p>
              </div>
            ) : !booking ? (
              <div className="p-6 text-center">
                <p className="text-gray-500">Booking not found</p>
                <Link href="/" className="mt-4 inline-block text-emerald-600 hover:text-emerald-800">
                  Return to Home
                </Link>
              </div>
            ) : !canViewBooking() ? (
              <div className="p-6 bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700">
                <p>You don't have permission to view this booking.</p>
                <Link href="/" className="mt-4 inline-block text-emerald-600 hover:text-emerald-800">
                  Return to Home
                </Link>
              </div>
            ) : (
              <div className="p-6">
                {/* Booking status */}
                <div className="mb-6 flex justify-between items-center">
                  <div>
                    <span className="text-sm text-gray-500">Booking ID: {booking._id}</span>
                    <div className="mt-1">
                      <span className={`px-3 py-1 text-sm rounded-full font-medium 
                        ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                          booking.status === 'completed' ? 'bg-blue-100 text-blue-800' : 
                          booking.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'}`}
                      >
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                      <span className={`ml-2 px-3 py-1 text-sm rounded-full font-medium 
                        ${booking.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 
                          booking.paymentStatus === 'refunded' ? 'bg-gray-100 text-gray-800' : 
                          'bg-yellow-100 text-yellow-800'}`}
                      >
                        {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Status update buttons for provider */}
                  {user?._id === booking.provider._id && booking.status !== 'completed' && booking.status !== 'cancelled' && (
                    <div className="flex space-x-2">
                      {booking.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleUpdateStatus('confirmed')}
                            className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors"
                          >
                            Confirm
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus('cancelled')}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      
                      {booking.status === 'confirmed' && (
                        <button 
                          onClick={() => handleUpdateStatus('completed')}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                          Mark Completed
                        </button>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Service details */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h2 className="text-lg font-semibold mb-3">Service Details</h2>
                    <div className="space-y-2">
                      <div>
                        <span className="text-gray-500">Service:</span>
                        <span className="block font-medium">{booking.service.name}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Category:</span>
                        <span className="block font-medium">{booking.service.category.name}</span>
                      </div>
                      {booking.service.subcategory && (
                        <div>
                          <span className="text-gray-500">Subcategory:</span>
                          <span className="block font-medium">{booking.service.subcategory.name}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-500">Price:</span>
                        <span className="block font-medium">${booking.totalPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Booking details */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h2 className="text-lg font-semibold mb-3">Booking Details</h2>
                    <div className="space-y-2">
                      <div>
                        <span className="text-gray-500">Date:</span>
                        <span className="block font-medium">{new Date(booking.bookingDate).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Time:</span>
                        <span className="block font-medium">{booking.startTime}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Duration:</span>
                        <span className="block font-medium">{booking.duration} hours</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Created:</span>
                        <span className="block font-medium">{new Date(booking.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Provider details */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h2 className="text-lg font-semibold mb-3">Provider Details</h2>
                    <div className="space-y-2">
                      <div>
                        <span className="text-gray-500">Name:</span>
                        <span className="block font-medium">{booking.provider.fullName}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Email:</span>
                        <span className="block font-medium">{booking.provider.email}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Phone:</span>
                        <span className="block font-medium">{booking.provider.phoneNumber}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* User details */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h2 className="text-lg font-semibold mb-3">Client Details</h2>
                    <div className="space-y-2">
                      <div>
                        <span className="text-gray-500">Name:</span>
                        <span className="block font-medium">{booking.userDetails.fullName}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Phone:</span>
                        <span className="block font-medium">{booking.userDetails.phoneNumber}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Location:</span>
                        <span className="block font-medium">{booking.userDetails.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Notes */}
                {booking.notes && (
                  <div className="mt-6 border border-gray-200 rounded-lg p-4">
                    <h2 className="text-lg font-semibold mb-3">Notes</h2>
                    <p className="text-gray-700">{booking.notes}</p>
                  </div>
                )}
                
                {/* Back button */}
                <div className="mt-8">
                  {user?.role === 'provider' ? (
                    <Link href="/provider/dashboard" className="text-emerald-600 hover:text-emerald-800">
                      &larr; Back to Dashboard
                    </Link>
                  ) : (
                    <Link href="/bookings" className="text-emerald-600 hover:text-emerald-800">
                      &larr; Back to My Bookings
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default BookingDetailsPage; 