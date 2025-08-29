// components/DateSelectionModal.tsx
"use client"
import React, { useState } from 'react';
import { format } from 'date-fns';

interface DateSelectionModalProps {
  onConfirm: (date: Date, time: string) => void;
  onClose: () => void;
  taskerName?: string;
  providerId?: string;
  serviceDetails?: {
    hourlyRate?: number;
    categoryId?: string;
    subcategoryId?: string;
  };
}

const DateSelectionModal: React.FC<DateSelectionModalProps> = ({
  onConfirm,
  onClose,
  taskerName = "Aleksei V.",
  providerId,
  serviceDetails
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("1:30pm");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Generate calendar days
  const generateCalendarDays = () => {
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), 19);
    const days = [];
    
    // Get current month and year
    const currentMonth = startDate.getMonth();
    const currentYear = startDate.getFullYear();
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextMonthYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    
    // Generate days for current month and beginning of next month
    for (let i = 0; i < 21; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const isCurrentMonth = date.getMonth() === currentMonth;
      const isNextMonth = date.getMonth() === nextMonth && date.getFullYear() === nextMonthYear;
      
      if (isCurrentMonth || isNextMonth) {
        days.push(date);
      }
      
      if (days.length >= 21) break;
    }
    
    return days;
  };
  
  const calendarDays = generateCalendarDays();
  
  // Get days organized by week
  const getWeeks = () => {
    const weeks: any[][] = [];
    let week: any[] = [];
    
    calendarDays.forEach((day, index) => {
      if (index % 7 === 0 && index > 0) {
        weeks.push(week);
        week = [];
      }
      week.push(day);
      
      if (index === calendarDays.length - 1) {
        weeks.push(week);
      }
    });
    
    return weeks;
  };
  
  const weeks = getWeeks();
  
  // Format month range
  const formatMonthRange = () => {
    const firstDay = calendarDays[0];
    const lastDay = calendarDays[calendarDays.length - 1];
    
    const firstMonth = format(firstDay, 'MMMM');
    const lastMonth = format(lastDay, 'MMMM');
    const year = format(lastDay, 'yyyy');
    
    return firstMonth === lastMonth 
      ? `${firstMonth} ${year}`
      : `${firstMonth} — ${lastMonth} ${year}`;
  };
  
  // Time options
  const timeOptions = [
    "9:00am", "9:30am", "10:00am", "10:30am", "11:00am", "11:30am",
    "12:00pm", "12:30pm", "1:00pm", "1:30pm", "2:00pm", "2:30pm",
    "3:00pm", "3:30pm", "4:00pm", "4:30pm", "5:00pm", "5:30pm"
  ];
  
  // Handle date selection
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };
  
  // Handle confirm
  const handleConfirm = () => {
    if (selectedDate) {
      setIsSubmitting(true);
      
      // Store booking data in localStorage if provider details are available
      if (providerId && serviceDetails) {
        try {
          const bookingData = {
            provider: providerId,
            service: {
              category: serviceDetails.categoryId,
              subcategory: serviceDetails.subcategoryId
            },
            bookingDate: selectedDate.toISOString(),
            startTime: selectedTime,
            estimatedHours: 1,
            totalPrice: serviceDetails.hourlyRate || 0,
            status: 'pending',
            notes: ''
          };
          
          console.log('Storing booking data:', JSON.stringify(bookingData, null, 2));
          localStorage.setItem('bookingData', JSON.stringify(bookingData));
        } catch (error) {
          console.error('Error storing booking data:', error);
        }
      }
      
      // Add a slight delay to show loading state
      setTimeout(() => {
        onConfirm(selectedDate, selectedTime);
        setIsSubmitting(false);
      }, 500);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-max w-full">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-2xl font-medium text-gray-800">Choose your task date and start time:</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isSubmitting}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div className="p-4 flex">
          <div className="flex-1">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                <img 
                  src="https://randomuser.me/api/portraits/men/32.jpg" 
                  alt="Tasker avatar" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-gray-700 font-medium">{taskerName}'s Availability</div>
            </div>
            
            <div className="mb-4">
              <div className="text-gray-700 mb-2">{formatMonthRange()}</div>
              <div className="grid grid-cols-7 gap-1 text-center">
                <div className="text-sm text-gray-500 font-medium">SUN</div>
                <div className="text-sm text-gray-500 font-medium">MON</div>
                <div className="text-sm text-gray-500 font-medium">TUE</div>
                <div className="text-sm text-gray-500 font-medium">WED</div>
                <div className="text-sm text-gray-500 font-medium">THU</div>
                <div className="text-sm text-gray-500 font-medium">FRI</div>
                <div className="text-sm text-gray-500 font-medium">SAT</div>
              </div>
              
              {weeks.map((week, weekIndex) => (
                <div key={`week-${weekIndex}`} className="grid grid-cols-7 gap-1 mt-1">
                  {week.map((day, dayIndex) => {
                    const dayNum = day.getDate();
                    const isSelected = selectedDate && 
                      selectedDate.getDate() === dayNum && 
                      selectedDate.getMonth() === day.getMonth();
                    const isHighlighted = dayNum === 23 || dayNum === 24;
                    
                    return (
                      <button
                        key={`day-${weekIndex}-${dayIndex}`}
                        className={`
                          w-10 h-10 rounded-md flex items-center justify-center text-lg
                          ${isSelected ? 'bg-green-800 text-white' : ''}
                          ${!isSelected ? 'hover:bg-green-100' : ''}
                        `}
                        onClick={() => handleDateSelect(day)}
                        disabled={isSubmitting}
                      >
                        {dayNum}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
            
            <div className="mb-4">
              <div className="relative">
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:border-green-500"
                  disabled={isSubmitting}
                >
                  {timeOptions.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                  </svg>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                You can chat to adjust task details or change start time after confirming.
              </p>
            </div>
          </div>
          
          <div className="ml-4 w-64">
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-700 mb-2">Request for:</h3>
              <p className="text-gray-800">
                {selectedDate ? format(selectedDate, 'MMM d') : 'Jan 24'}, {selectedTime}
              </p>
            </div>
            
            <button
              onClick={handleConfirm}
              className="w-full bg-green-800 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-md flex justify-center items-center"
              disabled={!selectedDate || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : "Select & Continue"}
            </button>
            
            <div className="flex items-start mt-8">
              <div className="flex-shrink-0 mr-3">
                <div className="bg-blue-100 rounded-md p-2">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 5H7C4.79086 5 3 6.79086 3 9V17C3 19.2091 4.79086 21 7 21H17C19.2091 21 21 19.2091 21 17V9C21 6.79086 19.2091 5 17 5H15" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 9H15V13H9V9Z" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 17H15" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              <div>
                <p className="text-gray-700 font-medium">Next, confirm your details</p>
                <p className="text-gray-600 text-sm">to get connected with your Tasker.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateSelectionModal;