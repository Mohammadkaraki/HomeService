"use client"
import React, { useState, useEffect, ChangeEvent } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import { providers, bookings, auth, services } from '@/app/utils/api';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ServiceSelectionModal from '@/app/components/ServiceSelectionModal';
import Cookies from 'js-cookie';

interface Booking {
  _id: string;
  user: {
    fullName: string;
    email: string;
  };
  service: {
    category: {
      name: string;
    };
    subcategory?: {
      name: string;
    };
  };
  bookingDate: string;
  startTime: string;
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
  duration?: number;
}

interface Service {
  _id: string;
  name: string;
  description?: string;
  categoryId: string;
  subcategories?: string[];
  hourlyRate: number;
}

const ProviderDashboard = () => {
  const { user, userType, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  
  const [activeTab, setActiveTab] = useState(tabParam || 'profile');
  const [providerData, setProviderData] = useState<any>(null);
  const [providerBookings, setProviderBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Add authentication debugging
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        console.log('Checking auth status...');
        const authData = await auth.checkAuth();
        console.log('Auth status:', authData);
        
        if (!authData.isAuthenticated || authData.userType !== 'provider') {
          setError('Authentication error: Not authenticated as a provider');
          console.error('Authentication issue:', authData);
        }
      } catch (error) {
        console.error('Failed to check auth status:', error);
        setError('Failed to verify authentication. Please try logging in again.');
      }
    };
    
    checkAuthStatus();
  }, []);
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    location: '',
    bio: '',
  });
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Add an initialization flag to ensure form is only initialized once
  const [formInitialized, setFormInitialized] = useState(false);

  // Add debug logging for form data
  useEffect(() => {
    if (providerData) {
      console.log('Form data after population:', formData);
      console.log('Provider data structure:', providerData);
    }
  }, [formData, providerData]);

  // Add a separate useEffect to update form data when providerData changes
  useEffect(() => {
    if (providerData) {
      console.log('Updating form from provider data in useEffect:', providerData);
      setFormData({
        fullName: providerData.fullName || '',
        email: providerData.email || '',
        phoneNumber: providerData.phoneNumber || '',
        location: providerData.location || '',
        bio: providerData.bio || '',
      });
    }
  }, [providerData]);

  // Ensure form values are properly bound with clear debugging 
  // Track when form data changes
  useEffect(() => {
    console.log('Form data changed:', formData);
  }, [formData]);

  // Fetch provider data and bookings when component mounts
  useEffect(() => {
    const fetchData = async () => {
      if (!user || !user._id) return;
      console.log('Fetching provider data for ID:', user._id);
      
      try {
        const response = await providers.getById(user._id || '');
        if (response.data) {
          console.log('Provider data:', response.data);
          setProviderData(response.data);
          
          // Initialize form with provider data if not already done
          if (!formInitialized) {
            setFormData({
              fullName: response.data.fullName || '',
              email: response.data.email || '',
              phoneNumber: response.data.phoneNumber || '',
              location: response.data.location || '',
              bio: response.data.bio || '',
            });
            setFormInitialized(true);
            
            // Set profile image preview if available
            if (response.data.profileImage) {
              setImagePreview(response.data.profileImage);
            }
          }
        }
        
        // Fetch provider bookings
        await fetchProviderBookings();
        
        // Fetch provider services from API
        try {
          const servicesResponse = await services.getByProviderId(user._id || '');
          if (servicesResponse.data && Array.isArray(servicesResponse.data)) {
            console.log('Setting services from API:', servicesResponse.data);
            setProviderServices(servicesResponse.data);
          }
        } catch (servicesErr) {
          console.error('Error fetching provider services:', servicesErr);
          // Try to load from localStorage instead
          try {
            console.log('Attempting to load services from local storage...');
            const storedServices = localStorage.getItem(`provider_services_${user._id}`);
            if (storedServices) {
              console.log('Loading services from localStorage');
              setProviderServices(JSON.parse(storedServices));
              toast.info('Loaded your services from local storage');
            }
          } catch (localStorageErr) {
            console.error('Error loading from localStorage:', localStorageErr);
          }
        }
      } catch (err) {
        console.error('Error fetching provider data:', err);
        setError('Failed to load provider data. Please refresh the page and try again.');
      }
    };
    
    fetchData();
  }, [user, formInitialized]);

  // Form input handler with debug
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    console.log(`Input changed: ${name} = ${value}`);
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle profile image change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Basic validation
      if (!file.type.match('image.*')) {
        setFormErrors(prev => ({
          ...prev,
          profileImage: 'Please select an image file (PNG, JPG, JPEG)'
        }));
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB
        setFormErrors(prev => ({
          ...prev,
          profileImage: 'Image must be less than 5MB'
        }));
        return;
      }
      
      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file));
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.profileImage;
        return newErrors;
      });
    }
  };

  // Form validation
  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!formData.fullName.trim()) errors.fullName = 'Name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }
    if (!formData.phoneNumber.trim()) errors.phoneNumber = 'Phone number is required';
    if (!formData.location.trim()) errors.location = 'Location is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setSubmitSuccess(false);
    
    try {
      const updateData = {
        name: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        location: formData.location,
        bio: formData.bio,
      };
      
      console.log('Sending provider update with data:', updateData);
      
      // Update provider details - no need to pass ID since endpoint uses token
      await providers.update('', updateData);
      
      // Upload profile image if changed
      if (profileImage) {
        console.log('Uploading profile image:', profileImage.name);
        
        const imageFormData = new FormData();
        imageFormData.append('file', profileImage);
        
        try {
          const photoResponse = await providers.uploadPhoto('', imageFormData);
          console.log('Profile photo upload response:', photoResponse);
        } catch (photoErr: any) {
          console.error('Error uploading photo:', photoErr);
          console.error('Response data:', photoErr.response?.data);
          toast.error('Failed to upload profile image');
        }
      }
      
      setSubmitSuccess(true);
      toast.success('Profile updated successfully!');
      
      // Refresh provider data
      const response = await providers.getById(user?._id || '');
      console.log('Provider data after update:', response.data);
      setProviderData(response.data);
      
    } catch (err: any) {
      console.error('Error updating provider:', err);
      setError(err.response?.data?.message || 'Failed to update profile');
      toast.error('Failed to update profile: ' + (err.response?.data?.message || 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add a function to fetch the provider's bookings with error handling and retries
  const fetchProviderBookings = async (retryCount = 0) => {
    if (!user || !user._id) return;
    
    console.log('Fetching bookings for provider:', user._id);
    setLoading(true);
    setError(null); // Clear any previous errors
    
    try {
      // Add a timestamp parameter to prevent caching
      const timestamp = new Date().getTime();
      // Use the proper URL format
      const bookingsResponse = await bookings.getByProviderId(`${user._id}?t=${timestamp}`);
      
      console.log('Full booking response:', bookingsResponse);
      
      if (bookingsResponse.data) {
        console.log('Received provider bookings:', bookingsResponse.data);
        
        let bookingsData: Booking[] = [];
        
        // Handle the different response formats
        if (Array.isArray(bookingsResponse.data)) {
          bookingsData = bookingsResponse.data;
        } else if (bookingsResponse.data.data && Array.isArray(bookingsResponse.data.data)) {
          bookingsData = bookingsResponse.data.data;
        } else if (bookingsResponse.data.success && Array.isArray(bookingsResponse.data.bookings)) {
          // Some APIs return { success: true, bookings: [...] }
          bookingsData = bookingsResponse.data.bookings;
        } else if (bookingsResponse.data.success && bookingsResponse.data.data && Array.isArray(bookingsResponse.data.data)) {
          // Format: { success: true, data: [...] }
          bookingsData = bookingsResponse.data.data;
        } else {
          console.warn('Unexpected bookings data format:', bookingsResponse.data);
          bookingsData = [];
        }
        
        // Save to localStorage as backup
        try {
          localStorage.setItem(`provider_bookings_${user._id}`, JSON.stringify({
            bookings: bookingsData,
            timestamp: new Date().toISOString()
          }));
        } catch (storageErr) {
          console.error('Error saving bookings to localStorage:', storageErr);
        }
        
        setProviderBookings(bookingsData);
      } else {
        console.log('No bookings data received');
        setProviderBookings([]);
      }
    } catch (err: any) {
      console.error('Error fetching provider bookings:', err);
      
      // Handle 404 errors specifically - try an alternative endpoint
      if (err.response && err.response.status === 404) {
        console.log('Provider bookings endpoint returned 404. Trying alternative endpoint...');
        
        try {
          // Try a direct API call with a different endpoint format
          const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
          const timestamp = new Date().getTime();
          const token = Cookies.get('token');
          
          // Try the correct format: /api/providers/{id}/bookings
          const alternativeUrl = `${API_BASE_URL}/providers/${user._id}/bookings?t=${timestamp}`;
          
          console.log('Trying alternative URL:', alternativeUrl);
          
          const alternativeResponse = await fetch(alternativeUrl, {
            headers: {
              'Authorization': token ? `Bearer ${token}` : '',
              'Content-Type': 'application/json'
            }
          });
          
          if (alternativeResponse.ok) {
            const data = await alternativeResponse.json();
            console.log('Alternative endpoint response:', data);
            
            // Process the response
            let bookingsData: Booking[] = [];
            if (data && Array.isArray(data)) {
              bookingsData = data;
            } else if (data && data.data && Array.isArray(data.data)) {
              bookingsData = data.data;
            } else if (data && data.bookings && Array.isArray(data.bookings)) {
              bookingsData = data.bookings;
            }
            
            setProviderBookings(bookingsData);
            setLoading(false);
            return;
          } else {
            console.error('Alternative endpoint failed:', alternativeResponse.status);
            throw new Error(`Alternative endpoint failed: ${alternativeResponse.statusText}`);
          }
        } catch (altError) {
          console.error('Error with alternative endpoint:', altError);
          
          // Try loading from localStorage before giving up
          try {
            const storedBookings = localStorage.getItem(`provider_bookings_${user._id}`);
            if (storedBookings) {
              const parsedData = JSON.parse(storedBookings);
              const timestamp = new Date(parsedData.timestamp);
              const now = new Date();
              const hoursDiff = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60);
              
              if (hoursDiff <= 24) { // Only use cached data if it's less than 24 hours old
                console.log('Loading bookings from localStorage:', parsedData.bookings);
                setProviderBookings(parsedData.bookings);
                
                // Show a warning that we're using cached data
                toast.info('Using locally stored booking data. Some information may not be up-to-date.');
                setError('Could not connect to the server. Showing saved booking data.');
                setLoading(false);
                return;
              } else {
                console.log('Cached booking data is too old:', hoursDiff, 'hours');
              }
            }
          } catch (localStorageErr) {
            console.error('Error loading bookings from localStorage:', localStorageErr);
          }
          
          // For new providers with no bookings, just show empty state
          setProviderBookings([]);
          setLoading(false);
          return;
        }
      }
      
      // Attempt to retry up to 2 times (3 total attempts)
      const maxRetries = 2;
      if (retryCount < maxRetries) {
        console.log(`Retrying... (Attempt ${retryCount + 1} of ${maxRetries})`);
        // Wait a bit longer for each retry
        setTimeout(() => {
          fetchProviderBookings(retryCount + 1);
        }, 1000 * (retryCount + 1));
        return;
      }
      
      // If all retries failed, try loading from localStorage
      try {
        const storedBookings = localStorage.getItem(`provider_bookings_${user._id}`);
        if (storedBookings) {
          const parsedData = JSON.parse(storedBookings);
          const timestamp = new Date(parsedData.timestamp);
          const now = new Date();
          const hoursDiff = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60);
          
          if (hoursDiff <= 24) { // Only use cached data if it's less than 24 hours old
            console.log('Loading bookings from localStorage:', parsedData.bookings);
            setProviderBookings(parsedData.bookings);
            
            // Show a warning that we're using cached data
            toast.info('Using locally stored booking data. Some information may not be up-to-date.');
            setError('Could not connect to the server. Showing saved booking data.');
            setLoading(false);
            return;
          } else {
            console.log('Cached booking data is too old:', hoursDiff, 'hours');
          }
        }
      } catch (localStorageErr) {
        console.error('Error loading bookings from localStorage:', localStorageErr);
      }
      
      // If all retries failed and no localStorage data, show a friendly error
      let errorMessage = 'Failed to load booking data. Please refresh the page and try again.';
      
      if (err.response) {
        // Add specific status code info
        errorMessage += ` (Status: ${err.response.status})`;
        
        // Add specific error messages from the backend if available
        if (err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        }
        
        // Special handling for common error codes
        if (err.response.status === 401) {
          errorMessage = 'Authentication error. Please log in again.';
          // Redirect to login after a short delay
          setTimeout(() => {
            router.push('/login');
          }, 2000);
        } else if (err.response.status === 403) {
          errorMessage = 'You don\'t have permission to access this data.';
        }
      } else if (err.request) {
        // The request was made but no response was received
        errorMessage = 'Server did not respond. Please check your connection and try again.';
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Add useEffect to automatically refresh bookings data periodically
  useEffect(() => {
    // Only auto-refresh if the bookings tab is active
    if (activeTab === 'bookings' && user?._id) {
      // Initial fetch
      fetchProviderBookings();
      
      // Set up interval to refresh bookings every 30 seconds
      const refreshInterval = setInterval(() => {
        if (activeTab === 'bookings') {
          fetchProviderBookings();
        }
      }, 30000); // 30 seconds
      
      // Clean up interval on unmount or tab change
      return () => clearInterval(refreshInterval);
    }
  }, [activeTab, user?._id]);

  // Update the handleUpdateBookingStatus function to provide better feedback
  const handleUpdateBookingStatus = async (bookingId: string, newStatus: 'confirmed' | 'completed' | 'cancelled') => {
    try {
      toast.info(`Updating booking status to ${newStatus}...`);
      await bookings.update(bookingId, { status: newStatus });
      
      // Show success toast
      toast.success(`Booking ${newStatus} successfully!`);
      
      // Refresh bookings after update
      await fetchProviderBookings();
    } catch (err: any) {
      console.error('Error updating booking status:', err);
      toast.error(err.response?.data?.message || 'Failed to update booking status');
      setError(err.response?.data?.message || 'Failed to update booking status');
    }
  };

  // Update the renderBookingsTab function to show clearer status and better UI
  const renderBookingsTab = () => {
    return (
      <div className="bg-white shadow-md rounded-lg p-4 max-w-full overflow-x-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Service Requests</h2>
          
          <button 
            onClick={() => fetchProviderBookings()} 
            className="text-emerald-600 hover:text-emerald-800 flex items-center text-sm"
            disabled={loading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-200">
            <div className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-medium">{error}</p>
                <button 
                  onClick={() => fetchProviderBookings()} 
                  className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
          </div>
        ) : providerBookings.length === 0 && !error ? (
          <div className="text-center py-8 bg-gray-50 rounded">
            <div className="text-gray-500 mb-2">You don't have any bookings yet.</div>
            <p className="text-sm text-gray-400">When customers book your services, they'll appear here.</p>
          </div>
        ) : (
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-medium">Recent Bookings</h3>
              <p className="text-sm text-gray-500">Showing {providerBookings.length} bookings</p>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {providerBookings.map(booking => (
                <div 
                  key={booking._id} 
                  className={`border rounded-lg overflow-hidden ${
                    booking.status === 'pending' ? 'border-yellow-300 bg-yellow-50' :
                    booking.status === 'confirmed' ? 'border-blue-300 bg-blue-50' :
                    booking.status === 'completed' ? 'border-green-300 bg-green-50' :
                    booking.status === 'cancelled' ? 'border-red-300 bg-red-50' :
                    'border-gray-200'
                  }`}
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-medium text-gray-900">{booking.userDetails.fullName}</span>
                        <div className="text-sm text-gray-600">
                          {booking.userDetails.phoneNumber} • {booking.userDetails.location}
                        </div>
                      </div>
                      <div>
                        <span className={`text-sm px-2 py-1 rounded-full ${
                          booking.status === 'pending' ? 'bg-yellow-200 text-yellow-800' :
                          booking.status === 'confirmed' ? 'bg-blue-200 text-blue-800' :
                          booking.status === 'completed' ? 'bg-green-200 text-green-800' :
                          booking.status === 'cancelled' ? 'bg-red-200 text-red-800' :
                          'bg-gray-200 text-gray-800'
                        }`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mb-3 text-sm">
                      <div className="flex items-center text-gray-700">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(booking.bookingDate).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                      <div className="flex items-center text-gray-700 mt-1">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {booking.startTime} ({booking.duration || 1} {(booking.duration || 1) === 1 ? 'hour' : 'hours'})
                      </div>
                    </div>
                    
                    <div className="mb-3 text-sm">
                      <div className="font-medium text-gray-700">Service:</div>
                      <div className="text-gray-600">
                        {booking.service.category.name}
                        {booking.service.subcategory && ` (${booking.service.subcategory.name})`}
                      </div>
                    </div>
                    
                    {booking.notes && (
                      <div className="mb-3 text-sm">
                        <div className="font-medium text-gray-700">Notes:</div>
                        <div className="text-gray-600 bg-white p-2 rounded border border-gray-200">
                          {booking.notes}
                        </div>
                      </div>
                    )}
                    
                    <div className="text-sm text-gray-600 my-2">
                      <span className="font-medium">Payment: </span>
                      <span className={`${
                        booking.paymentStatus === 'paid' ? 'text-green-600' :
                        booking.paymentStatus === 'refunded' ? 'text-red-600' :
                        'text-yellow-600'
                      }`}>
                        {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                      </span>
                      <span className="ml-2">
                        ${booking.totalPrice.toFixed(2)}
                      </span>
                    </div>
                    
                    {booking.status === 'pending' && (
                      <div className="mt-4 flex space-x-2">
                        <button
                          onClick={() => handleUpdateBookingStatus(booking._id, 'confirmed')}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 focus:outline-none"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleUpdateBookingStatus(booking._id, 'cancelled')}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 focus:outline-none"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                    
                    {booking.status === 'confirmed' && (
                      <div className="mt-4 flex space-x-2">
                        <button
                          onClick={() => handleUpdateBookingStatus(booking._id, 'completed')}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 focus:outline-none"
                        >
                          Mark Completed
                        </button>
                        <button
                          onClick={() => handleUpdateBookingStatus(booking._id, 'cancelled')}
                          className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 focus:outline-none"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Update URL when tab changes
  const handleTabChange = (tab: string) => {
    console.log('Changing tab to:', tab);
    console.log('Current form data before tab change:', formData);
    setActiveTab(tab);
    
    // Clear any errors when switching tabs
    setError(null);
    
    // If switching to bookings tab, refresh the bookings data
    if (tab === 'bookings') {
      fetchProviderBookings();
    }
    
    router.push(`/provider/dashboard?tab=${tab}`, { scroll: false });
  };

  // Add state for services
  const [providerServices, setProviderServices] = useState<Service[]>([]);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);

  // Handle service selection
  const handleServiceSelection = async (selectedServices: Service[]) => {
    console.log('Selected services:', selectedServices);
    
    // First, update local state to provide immediate feedback
    setProviderServices(selectedServices);
    
    // Store services in local storage as a backup
    try {
      localStorage.setItem(
        `provider_services_${user?._id}`, 
        JSON.stringify(selectedServices)
      );
    } catch (storageErr) {
      console.error('Failed to save to localStorage:', storageErr);
    }
    
    // Attempt to save to the server
    try {
      if (user?._id) {
        console.log('Sending services update with data:', selectedServices);
        toast.info('Updating services...');
        
        // Call the API
        const response = await services.updateProviderServices(user._id, selectedServices);
        console.log('Service update response:', response);
        
        toast.success('Services updated successfully');
      } else {
        console.error('User ID not available for service update');
        throw new Error('User ID not available');
      }
    } catch (err: any) {
      console.error('Failed to update services:', err);
      
      // Get more detailed error information
      if (err.response) {
        console.error('Error response:', {
          status: err.response.status,
          data: err.response.data
        });
        
        // Show specific error message from API if available
        const errorMessage = err.response.data?.message || err.response.data?.error || 'Could not save services to server';
        toast.error(errorMessage);
        toast.info('Your services have been saved locally');
      } else if (err.request) {
        // The request was made but no response was received
        console.error('No response received:', err.request);
        toast.error('Network error - no response from server');
        toast.info('Your services have been saved locally');
      } else {
        // Something happened in setting up the request
        toast.error(`Error: ${err.message || 'Could not save services to server'}`);
        toast.info('Your services have been saved locally');
      }
    }
  };

  // Render services tab content
  const renderServicesTab = () => {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">My Services</h2>
          <button
            onClick={() => setIsServiceModalOpen(true)}
            className="bg-emerald-600 text-white py-2 px-4 rounded-md hover:bg-emerald-700 transition-colors"
          >
            Add Service
          </button>
        </div>
        
        {providerServices.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <h3 className="text-lg font-medium text-gray-700 mb-2">No services yet</h3>
            <p className="text-gray-500 mb-4">Start offering services by clicking the button above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {providerServices.map(service => (
              <div key={service._id} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1">{service.name}</h3>
                  <div className="text-emerald-600 font-medium">${service.hourlyRate}/hr</div>
                  {service.subcategories && service.subcategories.length > 0 && (
                    <div className="mt-2 text-sm text-gray-600">
                      <span className="font-medium">Specialties:</span>{' '}
                      {/* This is simplified - you'd need to fetch subcategory names from their IDs */}
                      {service.subcategories.length} specialties
                    </div>
                  )}
                  <div className="mt-4 flex justify-end">
                    <button
                      className="text-red-500 hover:text-red-700 text-sm font-medium"
                      onClick={() => {
                        setProviderServices(prev => prev.filter(s => s._id !== service._id));
                        toast.info('Service removed');
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <ProtectedRoute allowedRoles={['provider']}>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <ToastContainer position="top-right" autoClose={5000} />
        
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6 text-emerald-600">Provider Dashboard</h1>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Dashboard header */}
            <div className="bg-emerald-700 text-white p-6">
              <h1 className="text-2xl font-bold">Provider Dashboard</h1>
              <p className="text-emerald-100">Manage your profile and service bookings</p>
            </div>
            
            {/* Tabs */}
            <div className="bg-emerald-600 text-white">
              <div className="container mx-auto flex">
                <button
                  className={`px-6 py-3 focus:outline-none ${activeTab === 'profile' ? 'bg-white text-emerald-700 font-medium' : 'text-white hover:bg-emerald-500'}`}
                  onClick={() => handleTabChange('profile')}
                >
                  Profile
                </button>
                <button
                  className={`px-6 py-3 focus:outline-none ${activeTab === 'bookings' ? 'bg-white text-emerald-700 font-medium' : 'text-white hover:bg-emerald-500'}`}
                  onClick={() => handleTabChange('bookings')}
                >
                  Bookings
                </button>
                <button
                  className={`px-6 py-3 focus:outline-none ${activeTab === 'services' ? 'bg-white text-emerald-700 font-medium' : 'text-white hover:bg-emerald-500'}`}
                  onClick={() => handleTabChange('services')}
                >
                  My Services
                </button>
              </div>
            </div>
            
            {/* Loading state */}
            {loading && (
              <div className="p-8 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
              </div>
            )}
            
            {/* Error message */}
            {error && (
              <div className="p-6 bg-red-50 border-l-4 border-red-500 text-red-700">
                <p>{error}</p>
              </div>
            )}
            
            {/* Profile tab content */}
            {!loading && activeTab === 'profile' && (
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-6">Edit Profile</h2>
                
                {submitSuccess && (
                  <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 text-green-700">
                    Profile updated successfully!
                  </div>
                )}
                
                <form onSubmit={handleSubmit}>
                  {/* Profile image */}
                  <div className="mb-6">
                    <label className="block text-gray-700 mb-2">Profile Image</label>
                    <div className="flex items-center space-x-6">
                      <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                        {(() => {
                          // Use IIFE to allow for logging without React node type issues
                          if (providerData?.profileImage) {
                            const imagePath = `/api/uploads/providers/${providerData.profileImage}`;
                            console.log('Loading profile image from:', imagePath);
                            
                            if (imagePreview) {
                              return (
                                <Image 
                                  src={imagePreview} 
                                  alt="Profile preview" 
                                  width={96} 
                                  height={96}
                                  className="w-full h-full object-cover" 
                                />
                              );
                            }
                            
                            return (
                              <Image 
                                src={imagePath}
                                alt="Profile" 
                                width={96} 
                                height={96}
                                className="w-full h-full object-cover"
                                unoptimized={true}
                                onError={(e) => {
                                  console.error('Image failed to load:', imagePath);
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                }}
                              />
                            );
                          } else if (imagePreview) {
                            return (
                              <Image 
                                src={imagePreview} 
                                alt="Profile preview" 
                                width={96} 
                                height={96}
                                className="w-full h-full object-cover" 
                              />
                            );
                          } else {
                            return (
                              <div className="w-full h-full flex items-center justify-center bg-emerald-100">
                                <span className="text-emerald-700 text-2xl font-bold">
                                  {providerData?.fullName?.charAt(0) || '?'}
                                </span>
                              </div>
                            );
                          }
                        })()}
                      </div>
                      <div>
                        <input
                          type="file"
                          id="profileImage"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageChange}
                        />
                        <label
                          htmlFor="profileImage"
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded cursor-pointer hover:bg-gray-200 transition-colors"
                        >
                          Change Image
                        </label>
                        {formErrors.profileImage && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.profileImage}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Name */}
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2" htmlFor="fullName">Full Name</label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Your full name"
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                    {formErrors.fullName && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.fullName}</p>
                    )}
                  </div>
                  
                  {/* Email */}
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2" htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Your email address"
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                    {formErrors.email && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
                    )}
                  </div>
                  
                  {/* Phone */}
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2" htmlFor="phoneNumber">Phone Number</label>
                    <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="Your phone number"
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                    {formErrors.phoneNumber && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.phoneNumber}</p>
                    )}
                  </div>
                  
                  {/* Location */}
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2" htmlFor="location">Location</label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="Your service location"
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                    {formErrors.location && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.location}</p>
                    )}
                  </div>
                  
                  {/* Bio */}
                  <div className="mb-6">
                    <label className="block text-gray-700 mb-2" htmlFor="bio">Bio</label>
                    <textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full p-2 border border-gray-300 rounded"
                      placeholder="Tell clients about yourself and your services"
                      maxLength={500}
                    />
                    <p className="text-gray-500 text-sm mt-1">{formData.bio ? formData.bio.length : 0}/500 characters</p>
                  </div>
                  
                  {/* Submit button */}
                  <div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-emerald-600 text-white px-6 py-2 rounded font-medium hover:bg-emerald-700 transition-colors disabled:bg-emerald-300"
                    >
                      {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {/* Bookings tab content */}
            {!loading && activeTab === 'bookings' && renderBookingsTab()}
            
            {/* Services tab content */}
            {!loading && activeTab === 'services' && renderServicesTab()}
          </div>
        </div>
        
        {/* Service selection modal */}
        <ServiceSelectionModal
          isOpen={isServiceModalOpen}
          onClose={() => setIsServiceModalOpen(false)}
          onServiceSelect={handleServiceSelection}
          currentServices={providerServices}
        />
        
        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default ProviderDashboard; 