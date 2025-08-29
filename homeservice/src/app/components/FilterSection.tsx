"use client"
import React, { useState, useEffect } from 'react';
import ServiceListing from './ServiceListing';
import { useSearchParams } from 'next/navigation';
import { providers } from '../utils/api';

interface Provider {
  _id: string;
  fullName: string;
  bio: string;
  location: string;
  profileImage?: string;
  isVerified: boolean;
  isActive: boolean;
  isElite: boolean;
  averageRating: number;
  totalReviews: number;
  totalCompletedTasks: number;
  services: Array<{
    category: string | { _id: string; name: string };
    subcategories: Array<string | { _id: string; name: string }>;
    hourlyRate: number;
  }>;
  availability: {
    monday: { start: string; end: string; isAvailable: boolean };
    tuesday: { start: string; end: string; isAvailable: boolean };
    wednesday: { start: string; end: string; isAvailable: boolean };
    thursday: { start: string; end: string; isAvailable: boolean };
    friday: { start: string; end: string; isAvailable: boolean };
    saturday: { start: string; end: string; isAvailable: boolean };
    sunday: { start: string; end: string; isAvailable: boolean };
  };
}

const FilterSection: React.FC = () => {
    const [range, setRange] = useState<number>(75);
    const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
    const [scrollY, setScrollY] = useState<number>(0);
    const [providersList, setProvidersList] = useState<Provider[]>([]);
    const [filteredProvidersList, setFilteredProvidersList] = useState<Provider[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const searchParams = useSearchParams();
    
    // Filter states
    const [dateFilter, setDateFilter] = useState<string>('week'); // 'today', '3days', 'week', 'custom'
    const [timeFilters, setTimeFilters] = useState({
        morning: false,
        afternoon: false,
        evening: false
    });
    const [priceRange, setPriceRange] = useState<[number, number]>([10, 150]);
    const [providerTypes, setProviderTypes] = useState({
        elite: false,
        greatValue: false
    });
    const [sortBy, setSortBy] = useState<string>('recommended'); // 'recommended', 'priceLow', 'priceHigh', 'rating'

    // Add state to track if filters have been modified by user
    const [filtersModified, setFiltersModified] = useState({
        date: false,
        price: false,
        time: false,
        providerType: false
    });

    // Track scroll position
    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.scrollY);
        };
        
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    // Fetch providers based on category/subcategory
    useEffect(() => {
        const fetchProviders = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const categoryId = searchParams.get('category');
                const subcategoryId = searchParams.get('subcategory');
                
                console.log('Fetching providers with params:', { categoryId, subcategoryId });
                
                let filterUrl = '/providers';
                if (categoryId) {
                    filterUrl += `?category=${categoryId}`;
                    if (subcategoryId) {
                        filterUrl += `&subcategory=${subcategoryId}`;
                    }
                }
                
                console.log('API request URL:', filterUrl);
                
                try {
                    console.log('About to call API, filterUrl:', filterUrl);
                    console.log('Full API URL:', process.env.NEXT_PUBLIC_API_URL + '/api' + filterUrl);
                    const response = await providers.getByFilter(filterUrl);
                    console.log('Provider API response:', response);
                    
                    // Check the exact format of the response
                    console.log('Response data type:', typeof response.data);
                    console.log('Response data full:', JSON.stringify(response.data, null, 2));
                    
                    if (response && response.data) {
                        // Check if backend returns the standard format with success, count and data properties
                        if (response.data.success && response.data.data) {
                            setProvidersList(response.data.data);
                            setFilteredProvidersList(response.data.data);
                            console.log('Provider data loaded (standard format):', response.data.data.length, 'providers found');
                        }
                        // Check if data is already an array
                        else if (Array.isArray(response.data)) {
                            setProvidersList(response.data);
                            setFilteredProvidersList(response.data);
                            console.log('Provider data loaded (array):', response.data.length, 'providers found');
                        }
                        // Check if data contains a providers property that is an array
                        else if (response.data.providers && Array.isArray(response.data.providers)) {
                            setProvidersList(response.data.providers);
                            setFilteredProvidersList(response.data.providers);
                            console.log('Provider data loaded (data.providers):', response.data.providers.length, 'providers found');
                        }
                        // Check if data is an object with a results property
                        else if (response.data.results && Array.isArray(response.data.results)) {
                            setProvidersList(response.data.results);
                            setFilteredProvidersList(response.data.results);
                            console.log('Provider data loaded (data.results):', response.data.results.length, 'providers found');
                        }
                        // No recognizable array format
                        else {
                            console.warn('Provider response data is not in expected format');
                            console.warn('Response structure:', Object.keys(response.data));
                            setProvidersList([]);
                            setFilteredProvidersList([]);
                            setError('Provider data format is unexpected. Check console for details.');
                        }
                    } else {
                        console.warn('Provider response missing data property');
                        setProvidersList([]);
                        setFilteredProvidersList([]);
                        setError('No providers found for this category');
                    }
                } catch (apiError: any) {
                    console.error('API error:', apiError);
                    // Log more detailed error information
                    console.error('API error status:', apiError.response?.status);
                    console.error('API error data:', apiError.response?.data);
                    console.error('API error message:', apiError.message);
                    
                    if (apiError.response?.status === 404) {
                        setError('API endpoint not found. Please check server configuration.');
                    } else if (apiError.code === 'ECONNREFUSED' || apiError.message.includes('Network Error')) {
                        setError('Cannot connect to server. Please check if the backend is running.');
                        
                        // TEMPORARY SOLUTION: Add mock data for testing until the API is working
                        console.log('Temporarily using mock data for development/testing');
                        setProvidersList([
                            {
                                _id: "temp_provider_1",
                                fullName: "John Smith",
                                bio: "Professional plumber with 10+ years of experience in residential and commercial plumbing. Specializing in emergency repairs, installations, and maintenance.",
                                location: "New York, NY",
                                profileImage: "provider1.jpg",
                                isVerified: true,
                                isActive: true,
                                isElite: true,
                                averageRating: 4.8,
                                totalReviews: 149,
                                totalCompletedTasks: 274,
                                services: [
                                    {
                                        category: { _id: "temp_cat_1", name: "Plumbing" },
                                        subcategories: [
                                            { _id: "temp_subcat_1", name: "Pipe Repair" },
                                        ],
                                        hourlyRate: 85
                                    }
                                ],
                                availability: {
                                    monday: { start: "08:00", end: "17:00", isAvailable: true },
                                    tuesday: { start: "08:00", end: "17:00", isAvailable: true },
                                    wednesday: { start: "08:00", end: "17:00", isAvailable: true },
                                    thursday: { start: "08:00", end: "17:00", isAvailable: true },
                                    friday: { start: "08:00", end: "17:00", isAvailable: true },
                                    saturday: { start: "09:00", end: "14:00", isAvailable: true },
                                    sunday: { start: "", end: "", isAvailable: false }
                                }
                            },
                            {
                                _id: "temp_provider_2",
                                fullName: "Jane Martinez",
                                bio: "Licensed electrician with expertise in home electrical systems, lighting installation, and smart home setups. Safety and quality are my top priorities.",
                                location: "Los Angeles, CA",
                                profileImage: "provider2.jpg",
                                isVerified: true,
                                isActive: true,
                                isElite: false,
                                averageRating: 4.7,
                                totalReviews: 98,
                                totalCompletedTasks: 156,
                                services: [
                                    {
                                        category: { _id: "temp_cat_2", name: "Electrical" },
                                        subcategories: [
                                            { _id: "temp_subcat_2", name: "Wiring" },
                                        ],
                                        hourlyRate: 95
                                    }
                                ],
                                availability: {
                                    monday: { start: "07:00", end: "18:00", isAvailable: true },
                                    tuesday: { start: "07:00", end: "18:00", isAvailable: true },
                                    wednesday: { start: "07:00", end: "18:00", isAvailable: true },
                                    thursday: { start: "07:00", end: "18:00", isAvailable: true },
                                    friday: { start: "07:00", end: "18:00", isAvailable: true },
                                    saturday: { start: "08:00", end: "16:00", isAvailable: true },
                                    sunday: { start: "", end: "", isAvailable: false }
                                }
                            }
                        ]);
                        setFilteredProvidersList([
                            {
                                _id: "temp_provider_1",
                                fullName: "John Smith",
                                bio: "Professional plumber with 10+ years of experience in residential and commercial plumbing. Specializing in emergency repairs, installations, and maintenance.",
                                location: "New York, NY",
                                profileImage: "provider1.jpg",
                                isVerified: true,
                                isActive: true,
                                isElite: true,
                                averageRating: 4.8,
                                totalReviews: 149,
                                totalCompletedTasks: 274,
                                services: [
                                    {
                                        category: { _id: "temp_cat_1", name: "Plumbing" },
                                        subcategories: [
                                            { _id: "temp_subcat_1", name: "Pipe Repair" },
                                        ],
                                        hourlyRate: 85
                                    }
                                ],
                                availability: {
                                    monday: { start: "08:00", end: "17:00", isAvailable: true },
                                    tuesday: { start: "08:00", end: "17:00", isAvailable: true },
                                    wednesday: { start: "08:00", end: "17:00", isAvailable: true },
                                    thursday: { start: "08:00", end: "17:00", isAvailable: true },
                                    friday: { start: "08:00", end: "17:00", isAvailable: true },
                                    saturday: { start: "09:00", end: "14:00", isAvailable: true },
                                    sunday: { start: "", end: "", isAvailable: false }
                                }
                            },
                            {
                                _id: "temp_provider_2",
                                fullName: "Jane Martinez",
                                bio: "Licensed electrician with expertise in home electrical systems, lighting installation, and smart home setups. Safety and quality are my top priorities.",
                                location: "Los Angeles, CA",
                                profileImage: "provider2.jpg",
                                isVerified: true,
                                isActive: true,
                                isElite: false,
                                averageRating: 4.7,
                                totalReviews: 98,
                                totalCompletedTasks: 156,
                                services: [
                                    {
                                        category: { _id: "temp_cat_2", name: "Electrical" },
                                        subcategories: [
                                            { _id: "temp_subcat_2", name: "Wiring" },
                                        ],
                                        hourlyRate: 95
                                    }
                                ],
                                availability: {
                                    monday: { start: "07:00", end: "18:00", isAvailable: true },
                                    tuesday: { start: "07:00", end: "18:00", isAvailable: true },
                                    wednesday: { start: "07:00", end: "18:00", isAvailable: true },
                                    thursday: { start: "07:00", end: "18:00", isAvailable: true },
                                    friday: { start: "07:00", end: "18:00", isAvailable: true },
                                    saturday: { start: "08:00", end: "16:00", isAvailable: true },
                                    sunday: { start: "", end: "", isAvailable: false }
                                }
                            }
                        ]);
                        
                        // Hide the error message since we're showing mock data
                        setError(null);
                    } else {
                        setProvidersList([]);
                        setFilteredProvidersList([]);
                        setError('Failed to load providers. Please try again later.');
                    }
                }
            } catch (err: any) {
                console.error('Error fetching providers:', err);
                console.error('Error details:', err.response?.data || err.message || err);
                setProvidersList([]);
                setFilteredProvidersList([]);
                setError(err.message || 'Failed to load providers');
            } finally {
                setLoading(false);
            }
        };

        fetchProviders();
    }, [searchParams]);
    
    // Toggle filter visibility
    const toggleFilter = () => {
        setIsFilterOpen(!isFilterOpen);
        // Prevent body scrolling when filter is open on mobile
        if (!isFilterOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    };
    
    // Apply filters to providers list
    useEffect(() => {
        if (providersList.length === 0) {
            setFilteredProvidersList([]);
            return;
        }

        let filtered = [...providersList];
        let anyFilterApplied = false;

        // Apply provider type filters
        if (providerTypes.elite || providerTypes.greatValue) {
            anyFilterApplied = true;
            filtered = filtered.filter(provider => {
                if (providerTypes.elite && provider.isElite) return true;
                if (providerTypes.greatValue && provider.averageRating >= 4.5) return true;
                return !(providerTypes.elite || providerTypes.greatValue);
            });
        }

        // Only apply price filters if the user has modified the price range
        if (filtersModified.price) {
            anyFilterApplied = true;
            filtered = filtered.filter(provider => {
                const rate = provider.services[0]?.hourlyRate || 0;
                return rate >= priceRange[0] && rate <= priceRange[1];
            });
        }

        // Apply time filters if any are selected
        if (timeFilters.morning || timeFilters.afternoon || timeFilters.evening) {
            anyFilterApplied = true;
            filtered = filtered.filter(provider => {
                // Check if provider is available during selected time periods
                const hasTimeMatch = Object.entries(timeFilters).some(([period, isSelected]) => {
                    if (!isSelected) return false;
                    
                    // Get current day of week in lowercase (monday, tuesday, etc.)
                    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                    const today = dayNames[new Date().getDay()];
                    
                    // Safely access availability for the current day
                    const dayAvailability = provider.availability[today as keyof typeof provider.availability];
                    
                    if (!dayAvailability?.isAvailable) return false;
                    
                    const startHour = parseInt(dayAvailability.start.split(':')[0], 10);
                    
                    if (period === 'morning' && startHour >= 8 && startHour < 12) return true;
                    if (period === 'afternoon' && startHour >= 12 && startHour < 17) return true;
                    if (period === 'evening' && startHour >= 17) return true;
                    
                    return false;
                });
                
                return hasTimeMatch || !(timeFilters.morning || timeFilters.afternoon || timeFilters.evening);
            });
        }

        // Apply date filter only if user has modified it
        if (filtersModified.date) {
            anyFilterApplied = true;
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Set to beginning of day
            
            const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            
            filtered = filtered.filter(provider => {
                if (dateFilter === 'today') {
                    // Check if provider is available today
                    const todayName = dayNames[today.getDay()];
                    const todayAvailability = provider.availability[todayName as keyof typeof provider.availability];
                    return todayAvailability?.isAvailable === true;
                } 
                else if (dateFilter === '3days') {
                    // Check if provider is available in next 3 days
                    for (let i = 0; i < 3; i++) {
                        const checkDate = new Date(today);
                        checkDate.setDate(today.getDate() + i);
                        const dayName = dayNames[checkDate.getDay()];
                        const dayAvailability = provider.availability[dayName as keyof typeof provider.availability];
                        if (dayAvailability?.isAvailable === true) {
                            return true;
                        }
                    }
                    return false;
                }
                else if (dateFilter === 'week') {
                    // Check if provider is available in next 7 days
                    for (let i = 0; i < 7; i++) {
                        const checkDate = new Date(today);
                        checkDate.setDate(today.getDate() + i);
                        const dayName = dayNames[checkDate.getDay()];
                        const dayAvailability = provider.availability[dayName as keyof typeof provider.availability];
                        if (dayAvailability?.isAvailable === true) {
                            return true;
                        }
                    }
                    return false;
                }
                
                return true; // Default for 'custom' or any other value
            });
        }

        // Apply sorting (always apply sorting)
        filtered = sortProviders(filtered, sortBy);

        // If no filters were applied, show all providers
        if (!anyFilterApplied) {
            setFilteredProvidersList(filtered);
        } else {
            setFilteredProvidersList(filtered);
        }
    }, [providersList, dateFilter, timeFilters, priceRange, providerTypes, sortBy, filtersModified]);

    // Sort providers based on selected criteria
    const sortProviders = (providers: Provider[], sort: string) => {
        const sortedProviders = [...providers];
        
        switch (sort) {
            case 'priceLow':
                return sortedProviders.sort((a, b) => {
                    const rateA = a.services[0]?.hourlyRate || 0;
                    const rateB = b.services[0]?.hourlyRate || 0;
                    return rateA - rateB;
                });
            case 'priceHigh':
                return sortedProviders.sort((a, b) => {
                    const rateA = a.services[0]?.hourlyRate || 0;
                    const rateB = b.services[0]?.hourlyRate || 0;
                    return rateB - rateA;
                });
            case 'rating':
                return sortedProviders.sort((a, b) => {
                    return (b.averageRating || 0) - (a.averageRating || 0);
                });
            case 'recommended':
            default:
                // Recommended sorting combines rating and elite status
                return sortedProviders.sort((a, b) => {
                    // Elite providers come first
                    if (a.isElite && !b.isElite) return -1;
                    if (!a.isElite && b.isElite) return 1;
                    
                    // Then by rating
                    return (b.averageRating || 0) - (a.averageRating || 0);
                });
        }
    };

    // Handle filter changes
    const handleDateFilterChange = (filter: string) => {
        setDateFilter(filter);
        setFiltersModified(prev => ({ ...prev, date: true }));
    };

    const handleTimeFilterChange = (period: 'morning' | 'afternoon' | 'evening') => {
        setTimeFilters(prev => ({
            ...prev,
            [period]: !prev[period]
        }));
        setFiltersModified(prev => ({ ...prev, time: true }));
    };

    const handlePriceRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value, 10);
        setPriceRange(prev => [prev[0], value]);
        setFiltersModified(prev => ({ ...prev, price: true }));
    };

    const handleProviderTypeChange = (type: 'elite' | 'greatValue') => {
        setProviderTypes(prev => ({
            ...prev,
            [type]: !prev[type]
        }));
        setFiltersModified(prev => ({ ...prev, providerType: true }));
    };

    // Handle sort change
    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSortBy(e.target.value);
    };

    return (
        <div className="container mx-auto px-4 mb-6">
            {/* Mobile Filter Button - Only visible on mobile */}
            <div className="md:hidden mb-4 sticky top-0 z-30 bg-white py-2">
                <button 
                    onClick={toggleFilter}
                    className="w-full py-2 px-4 bg-emerald-600 text-white rounded-lg flex items-center justify-center"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
                    </svg>
                    Filters
                </button>
            </div>

            {/* Full-screen mobile filter overlay */}
            {isFilterOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={toggleFilter}></div>
            )}

            <div className="flex flex-col md:flex-row gap-6">
                {/* Filter Section - Full screen on mobile when toggled, fixed on desktop */}
                <div className={`${isFilterOpen ? 'fixed inset-0 z-50 overflow-y-auto pt-4 pb-20 px-4' : 'hidden'} md:block md:w-1/3 md:sticky md:top-4`} style={{ maxHeight: 'calc(100vh - 2rem)' }}>
                    <div className="bg-white rounded-lg border border-gray-200 p-4 md:overflow-y-auto md:max-h-[calc(100vh-2rem)]">
                        {/* Mobile Close Button */}
                        <div className="flex justify-between items-center mb-4 md:hidden">
                            <h2 className="font-bold text-lg">Filters</h2>
                            <button 
                                onClick={toggleFilter}
                                className="text-gray-500"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>

                        {/* Date Filter */}
                        <div className="mb-6">
                            <h3 className="font-medium text-gray-800 mb-3">Date</h3>
                            <div className="grid grid-cols-2 gap-2">
                                <button 
                                    className={`px-4 py-2 border border-gray-300 rounded-full text-sm text-center hover:bg-gray-50 ${dateFilter === 'today' ? 'bg-emerald-100 border-emerald-500' : ''}`}
                                    onClick={() => handleDateFilterChange('today')}
                                >
                                    Today
                                </button>
                                <button 
                                    className={`px-4 py-2 border border-gray-300 rounded-full text-sm text-center hover:bg-gray-50 ${dateFilter === '3days' ? 'bg-emerald-100 border-emerald-500' : ''}`}
                                    onClick={() => handleDateFilterChange('3days')}
                                >
                                    Within 3 Days
                                </button>
                                <button 
                                    className={`px-4 py-2 border border-gray-300 rounded-full text-sm text-center hover:bg-gray-50 ${dateFilter === 'week' ? 'bg-emerald-100 border-emerald-500' : ''}`}
                                    onClick={() => handleDateFilterChange('week')}
                                >
                                    Within A Week
                                </button>
                                <button 
                                    className={`px-4 py-2 border border-gray-300 rounded-full text-sm text-center hover:bg-gray-50 ${dateFilter === 'custom' ? 'bg-emerald-100 border-emerald-500' : ''}`}
                                    onClick={() => handleDateFilterChange('custom')}
                                >
                                    Choose Dates
                                </button>
                            </div>
                        </div>

                        {/* Time Filter */}
                        <div className="mb-6">
                            <h3 className="font-medium text-gray-800 mb-3">Time of day</h3>
                            <div className="space-y-2 mb-3">
                                <div className="flex items-center">
                                    <input 
                                        type="checkbox" 
                                        id="morning" 
                                        className="w-4 h-4 mr-2 border-gray-300 rounded"
                                        checked={timeFilters.morning}
                                        onChange={() => handleTimeFilterChange('morning')}
                                    />
                                    <label htmlFor="morning" className="text-sm text-gray-700">Morning (8am - 12pm)</label>
                                </div>
                                <div className="flex items-center">
                                    <input 
                                        type="checkbox" 
                                        id="afternoon" 
                                        className="w-4 h-4 mr-2 border-gray-300 rounded"
                                        checked={timeFilters.afternoon}
                                        onChange={() => handleTimeFilterChange('afternoon')}
                                    />
                                    <label htmlFor="afternoon" className="text-sm text-gray-700">Afternoon (12pm - 5pm)</label>
                                </div>
                                <div className="flex items-center">
                                    <input 
                                        type="checkbox" 
                                        id="evening" 
                                        className="w-4 h-4 mr-2 border-gray-300 rounded"
                                        checked={timeFilters.evening}
                                        onChange={() => handleTimeFilterChange('evening')}
                                    />
                                    <label htmlFor="evening" className="text-sm text-gray-700">Evening (5pm - 9:30pm)</label>
                                </div>
                            </div>

                            <div className="text-center text-xs text-gray-500 mb-2">or choose a specific time</div>

                            <div className="relative">
                                <select className="w-full py-2 px-4 border border-gray-300 rounded-full bg-white appearance-none pr-8 text-sm">
                                    <option>I'm Flexible</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Price Filter */}
                        <div className="mb-6">
                            <h3 className="font-medium text-gray-800 mb-3">Price</h3>
                            <div className="h-12 bg-gradient-to-r from-green-100 via-green-200 to-green-400 mb-2 rounded-sm">
                                {/* Price histogram visualization */}
                                <div className="h-full flex items-end">
                                    <div className="w-1/12 h-3/6 bg-green-200 mx-px"></div>
                                    <div className="w-1/12 h-4/6 bg-green-200 mx-px"></div>
                                    <div className="w-1/12 h-3/6 bg-green-200 mx-px"></div>
                                    <div className="w-1/12 h-2/6 bg-green-200 mx-px"></div>
                                    <div className="w-1/12 h-1/6 bg-green-200 mx-px"></div>
                                    <div className="w-1/12 h-3/6 bg-green-200 mx-px"></div>
                                    <div className="w-1/12 h-full bg-green-500 mx-px"></div>
                                    <div className="w-1/12 h-full bg-green-500 mx-px"></div>
                                    <div className="w-1/12 h-full bg-green-500 mx-px"></div>
                                    <div className="w-1/12 h-full bg-green-500 mx-px"></div>
                                    <div className="w-1/12 h-full bg-green-500 mx-px"></div>
                                    <div className="w-1/12 h-full bg-green-500 mx-px"></div>
                                </div>
                            </div>

                            <div className="flex justify-between mb-1">
                                <span className="text-sm">$10</span>
                                <span className="text-sm">$150+</span>
                            </div>

                            <div className="mb-3">
                                <input
                                    type="range"
                                    min="10"
                                    max="150"
                                    value={priceRange[1]}
                                    onChange={handlePriceRangeChange}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />
                                <div className="text-center text-sm text-emerald-700 mt-2">
                                    Maximum price: ${priceRange[1]}/hr
                                </div>
                            </div>
                        </div>

                        {/* Tasker Type Filter */}
                        <div className="border-t border-gray-200 pt-4 mb-4">
                            <h3 className="font-medium text-gray-800 mb-3">Tasker type</h3>
                            <div className="space-y-2">
                                <div className="flex items-center">
                                    <input 
                                        type="checkbox" 
                                        id="elite" 
                                        className="w-4 h-4 mr-2 border-gray-300 rounded"
                                        checked={providerTypes.elite}
                                        onChange={() => handleProviderTypeChange('elite')}
                                    />
                                    <label htmlFor="elite" className="text-sm text-gray-700">Elite Tasker</label>
                                </div>
                                <div className="flex items-center">
                                    <input 
                                        type="checkbox" 
                                        id="great-value" 
                                        className="w-4 h-4 mr-2 border-gray-300 rounded"
                                        checked={providerTypes.greatValue}
                                        onChange={() => handleProviderTypeChange('greatValue')}
                                    />
                                    <label htmlFor="great-value" className="text-sm text-gray-700">Great value</label>
                                </div>
                            </div>
                        </div>

                        {/* Security Info */}
                        <div className="border-t border-gray-200 pt-4">
                            <div className="flex">
                                <div className="flex-shrink-0 mr-2">
                                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                                        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                                        </svg>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-600">
                                    Always have peace of mind. All Taskers undergo ID and criminal background checks.
                                    <a href="#" className="text-green-600 font-medium">Learn More</a>
                                </p>
                            </div>
                        </div>

                        {/* Apply Filters Button - Only visible on mobile */}
                        <div className="mt-6 md:hidden sticky bottom-4">
                            <button
                                onClick={toggleFilter}
                                className="w-full py-3 bg-emerald-600 text-white rounded-lg font-medium"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </div>

                {/* Providers List Section */}
                <div className="md:w-2/3">
                    <div className="flex justify-end mb-4 sticky top-0 bg-white z-20 py-2">
                        <div className="flex items-center">
                            <span className="mr-2 text-sm">Sorted by:</span>
                            <select 
                                className="border border-gray-300 rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                value={sortBy}
                                onChange={handleSortChange}
                            >
                                <option value="recommended">Recommended</option>
                                <option value="priceLow">Price: Low to High</option>
                                <option value="priceHigh">Price: High to Low</option>
                                <option value="rating">Highest Rating</option>
                            </select>
                        </div>
                    </div>
                    
                    {/* Loading State */}
                    {loading && (
                        <div className="flex justify-center items-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                            <p className="text-red-600">{error}</p>
                        </div>
                    )}

                    {/* Filter statistics */}
                    {!loading && !error && (
                        <div className="mb-4">
                            <p className="text-sm text-gray-600">
                                Showing {filteredProvidersList.length} of {providersList.length} providers
                                {Object.values(timeFilters).some(v => v) && " • Filtered by time"}
                                {providerTypes.elite && " • Elite taskers only"}
                                {providerTypes.greatValue && " • Great value"}
                                {priceRange[1] < 150 && ` • Max $${priceRange[1]}/hr`}
                            </p>
                        </div>
                    )}

                    {/* Providers List */}
                    {!loading && !error && filteredProvidersList.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            No providers found matching your filters. Try adjusting your criteria.
                        </div>
                    )}

                    {!loading && !error && filteredProvidersList.map((provider) => (
                        <ServiceListing key={provider._id} provider={provider} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FilterSection;