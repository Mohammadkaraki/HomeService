"use client"
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import DateSelectionModal from '../../components/DateSelectionModal';

const BookingPage: React.FC = () => {
  const router = useRouter();
  const [showDateModal, setShowDateModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');

  const handleDateConfirm = (date: Date, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
    setShowDateModal(false);
    
    // Navigate to the next step (userdetails page)
    router.push('/userdetails');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <h1 className="text-3xl font-bold mb-6">Book Your Service</h1>
      
      {selectedDate ? (
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full mb-6">
          <h2 className="text-xl font-semibold mb-2">Your Booking</h2>
          <p className="text-gray-700">
            Date: {selectedDate.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric'
            })}
          </p>
          <p className="text-gray-700">Time: {selectedTime}</p>
          
          <div className="flex mt-4 space-x-2">
            <button
              onClick={() => setShowDateModal(true)}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded"
            >
              Change Date/Time
            </button>
            
            <button
              onClick={() => router.push('/userdetails')}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
            >
              Continue
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <p className="mb-4 text-gray-600">Select a date and time for your service</p>
          <button
            onClick={() => setShowDateModal(true)}
            className="bg-green-800 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-md"
          >
            Select Date & Time
          </button>
        </div>
      )}
      
      {showDateModal && (
        <DateSelectionModal
          onConfirm={handleDateConfirm}
          onClose={() => setShowDateModal(false)}
          taskerName="Service Provider"
        />
      )}
    </div>
  );
}

export default BookingPage;