// components/UserDetailsForm.tsx
"use client"
import React, { useState } from 'react';

interface UserDetailsFormProps {
  onSubmit: (data: { 
    name: string; 
    phoneNumber: string; 
    location: string;
    bookingData?: any;
  }) => void;
  className?: string;
}

const UserDetailsForm: React.FC<UserDetailsFormProps> = ({ onSubmit, className = '' }) => {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [location, setLocation] = useState('');
  const [bookingData, setBookingData] = useState<any>(null);
  const [errors, setErrors] = useState({
    name: '',
    phoneNumber: '',
    location: ''
  });

  // Load booking data from localStorage when component mounts
  React.useEffect(() => {
    try {
      const storedBookingData = localStorage.getItem('bookingData');
      if (storedBookingData) {
        setBookingData(JSON.parse(storedBookingData));
      }
    } catch (error) {
      console.error('Error loading booking data:', error);
    }
  }, []);

  const validateForm = () => {
    const newErrors = {
      name: '',
      phoneNumber: '',
      location: ''
    };
    let isValid = true;

    if (!name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
      isValid = false;
    } else if (!/^\d{10}$/.test(phoneNumber.replace(/\D/g, ''))) {
      newErrors.phoneNumber = 'Please enter a valid 10-digit phone number';
      isValid = false;
    }

    if (!location.trim()) {
      newErrors.location = 'Location is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit({ 
        name, 
        phoneNumber, 
        location,
        bookingData 
      });
    }
  };

  // Format phone number as user types
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    
    // Only store digits, but format for display
    setPhoneNumber(value);
  };

  return (
    <form onSubmit={handleSubmit} className={`max-w-md w-full ${className}`}>
      <div className="mb-6">
        <label htmlFor="name" className="block text-lg font-medium mb-2">
          Name
        </label>
        <input
          type="text"
          id="name"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.name && <p className="mt-1 text-red-500 text-sm">{errors.name}</p>}
      </div>

      <div className="mb-6">
        <label htmlFor="phoneNumber" className="block text-lg font-medium mb-2">
          Phone Number
        </label>
        <input
          type="tel"
          id="phoneNumber"
          placeholder="Number"
          value={phoneNumber}
          onChange={handlePhoneChange}
          className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 ${
            errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.phoneNumber && <p className="mt-1 text-red-500 text-sm">{errors.phoneNumber}</p>}
      </div>

      <div className="mb-8">
        <label htmlFor="location" className="block text-lg font-medium mb-2">
          Location
        </label>
        <input
          type="text"
          id="location"
          placeholder="Choose Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 ${
            errors.location ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.location && <p className="mt-1 text-red-500 text-sm">{errors.location}</p>}
      </div>

      <button
        type="submit"
        className="w-full py-4 px-6 bg-green-700 hover:bg-green-600 text-white font-medium text-xl rounded-full transition duration-200"
      >
        Submit
      </button>
    </form>
  );
};

export default UserDetailsForm;