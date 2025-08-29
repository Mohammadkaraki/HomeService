"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import UserDetailsForm from '../../components/UserDetailsForm';
import { bookings } from '@/app/utils/api';
import { useAuth } from '@/app/hooks/useAuth';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Link from 'next/link';
import axios from 'axios';

export default function UserDetailsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [bookingData, setBookingData] = useState<any>(null);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    const bookingDataStr = localStorage.getItem('bookingData');
    
    // Debug log the booking data on load
    if (bookingDataStr) {
      try {
        const parsedData = JSON.parse(bookingDataStr);
        setBookingData(parsedData);
        console.log('Initial booking data on page load:', JSON.stringify(parsedData, null, 2));
        console.log('Service category on load:', parsedData.service?.category);
      } catch (e) {
        console.error('Error parsing booking data:', e);
      }
    } else {
      console.warn('No booking data found in localStorage on load');
    }
    
    if (!token || !userData) {
      // Store current path to redirect back after login
      localStorage.setItem('redirectAfterLogin', '/userdetails');
      // Redirect to login
      router.push('/login');
    } else if (!bookingDataStr) {
      // If no booking data, redirect back to booking page
      toast.error('Booking information is missing. Please start a new booking.');
      router.push('/booking/new');
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  const handleSubmit = async (data: { 
    name: string; 
    phoneNumber: string; 
    location: string;
  }) => {
    setIsSubmitting(true);
    setError('');
    
    // Define these at the top level of the function so they're in scope for the entire function
    let providerId: string = '';
    let completeBooking: any = null;
    
    try {
      if (!user) {
        throw new Error("You need to be logged in to create a booking");
      }
      
      // Use booking data from state
      if (!bookingData) {
        throw new Error("Booking information is missing");
      }
      
      // Normalize the data structure to handle different formats
      let providerData = bookingData.provider;
      providerId = typeof providerData === 'object' ? providerData.id : providerData;
      
      console.log('Provider ID:', providerId);
      
      // Handle different service category formats
      let serviceCategoryId;
      let serviceSubcategoryId;
      
      if (bookingData.service && bookingData.service.category) {
        // New format
        serviceCategoryId = bookingData.service.category;
        serviceSubcategoryId = bookingData.service.subcategory;
      } else if (bookingData.provider && bookingData.provider.serviceCategory) {
        // Old format
        serviceCategoryId = bookingData.provider.serviceCategory;
        serviceSubcategoryId = bookingData.provider.serviceSubcategory;
      }
      
      // Validate that we have a service category - this is required by the backend
      if (!serviceCategoryId) {
        console.error('ERROR: Missing service category ID');
        throw new Error("Service category is required but not provided. Please try booking again.");
      }
      
      // Handle different date/time formats
      const bookingDate = bookingData.bookingDate || bookingData.date;
      const startTime = bookingData.startTime || bookingData.time;
      const totalPrice = bookingData.totalPrice || 
                        (bookingData.provider && bookingData.provider.hourlyRate ? 
                          bookingData.provider.hourlyRate : 0);
      
      // Create a complete booking object that matches the backend model exactly
      completeBooking = {
        // Add user ID if available
        user: user?._id,
        service: {
          category: serviceCategoryId,
          subcategory: serviceSubcategoryId || null
        },
        bookingDate: bookingDate,
        startTime: startTime,
        estimatedHours: bookingData.estimatedHours || 1,
        totalPrice: parseFloat(totalPrice) || 0,
        status: 'pending',
        paymentStatus: 'pending',
        userDetails: {
          fullName: data.name,
          phoneNumber: data.phoneNumber,
          location: data.location
        },
        notes: bookingData.notes || ''
      };
      
      console.log('Submitting booking with data:', JSON.stringify(completeBooking, null, 2));
      
      // Make API call with consistent error handling
      toast.info('Submitting your booking...');
      
      // Use the bookings API call from api.ts
      const response = await bookings.create({
        ...completeBooking,
        provider: providerId
      });
      
      console.log('Booking response:', response);
      
      if (response.data && (response.data.success || response.data._id)) {
        // Clear the stored booking data after successful submission
        localStorage.removeItem('bookingData');
        
        // Show success toast
        toast.success('Booking submitted successfully!');
        
        // Short delay before redirect to show toast
        setTimeout(() => {
          // Redirect to the home page instead of confirmation page
          router.push('/');
        }, 1500);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error: any) {
      console.error('Error submitting form:', error);
      
      // Create detailed error log
      const errorDetails = {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers,
        request: error.config ? {
          method: error.config.method,
          url: error.config.url,
          data: error.config.data
        } : null
      };
      
      console.error('Detailed error:', JSON.stringify(errorDetails, null, 2));
      
      if (error.response && error.response.status === 401) {
        setError('Authentication error. Please log in again.');
        
        // Store current path to redirect back after login
        localStorage.setItem('redirectAfterLogin', '/userdetails');
        
        // Redirect to login after a short delay
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else if (error.response && error.response.data && error.response.data.message) {
        // Show specific error message from backend
        const errorMessage = error.response.data.message;
        setError(errorMessage);
        toast.error(errorMessage);
      } else {
        setError(error.message || 'Failed to submit booking. Please try again.');
        toast.error('Server error. Please try again later.');
        
        // Store booking in localStorage
        if (completeBooking && providerId) {
          try {
            const bookingToStore = {
              ...completeBooking,
              provider: providerId,
              timestamp: new Date().toISOString()
            };
            
            localStorage.setItem('pendingBooking', JSON.stringify(bookingToStore));
            toast.info('Your booking details have been saved locally. You can try again later.');
          } catch (e) {
            console.error('Error saving to localStorage:', e);
          }
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center p-4 pt-12">
        <div className="w-full max-w-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center p-4 pt-12">
      <ToastContainer position="top-center" autoClose={3000} />
      
      <div className="w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <Link 
            href="/booking" 
            className="text-emerald-600 hover:text-emerald-800 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Booking
          </Link>
        </div>
        
        <h1 className="text-2xl font-semibold mb-2 text-center">Your Details</h1>
        <p className="text-center text-gray-600 mb-6">Please provide your contact information to complete the booking</p>
        
        {bookingData && (
          <div className="mb-6 p-4 bg-emerald-50 rounded-lg border border-emerald-100">
            <h2 className="font-medium text-emerald-800 mb-2">Booking Summary</h2>
            <p className="text-sm text-emerald-700">
              {new Date(bookingData.bookingDate).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              })} at {bookingData.startTime}
            </p>
            {bookingData.totalPrice > 0 && (
              <p className="text-sm text-emerald-700 mt-1">
                Estimated price: ${bookingData.totalPrice.toFixed(2)} 
                {bookingData.estimatedHours > 1 ? ` (${bookingData.estimatedHours} hours)` : ''}
              </p>
            )}
          </div>
        )}
        
        <UserDetailsForm 
          onSubmit={handleSubmit} 
        />
        
        {isSubmitting && (
          <div className="mt-4 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-emerald-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Processing your booking...</p>
          </div>
        )}
        
        {error && (
          <div className="mt-4 text-center text-red-600 p-3 bg-red-50 rounded">
            <p>{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}