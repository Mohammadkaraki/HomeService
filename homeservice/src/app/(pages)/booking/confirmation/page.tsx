"use client"
import React from 'react';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';

const BookingConfirmationPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
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
                Your booking has been successfully placed.
              </p>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">What's Next?</h2>
                <p className="text-gray-600">
                  We've sent confirmation details to your email. Your provider will be notified of your booking and will contact you shortly to confirm the details.
                </p>
                <div className="mt-4 p-4 bg-blue-50 text-blue-700 rounded-md">
                  <p className="flex items-start">
                    <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
                    </svg>
                    You can view all your bookings and their status in your account dashboard.
                  </p>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-6 mt-6">
                <div className="flex flex-col md:flex-row gap-4 justify-between">
                  <Link 
                    href="/bookings" 
                    className="inline-block px-6 py-3 bg-gray-200 text-gray-800 font-medium rounded-md hover:bg-gray-300 transition-colors text-center"
                  >
                    View My Bookings
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
      </div>
    </div>
  );
};

export default BookingConfirmationPage; 