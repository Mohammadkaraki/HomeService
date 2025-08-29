// components/Navbar.jsx
"use client"
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { categories as categoriesApi, providers as providersApi } from '../utils/api';
import Image from 'next/image';

interface Subcategory {
  _id: string;
  name: string;
  description: string;
  category: string;
  isActive: boolean;
}

interface Category {
  _id: string;
  name: string;
  description: string;
  isActive: boolean;
  subcategories?: Subcategory[];
}

interface Provider {
  _id: string;
  fullName: string;
  location: string;
  bio: string;
  services: any[];
}

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [closeMoreMenuTimeout, setCloseMoreMenuTimeout] = useState<NodeJS.Timeout | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated, logout, userType } = useAuth();
  const router = useRouter();
  const moreMenuRef = useRef<HTMLLIElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Provider[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  // Determine how many categories to show directly in navbar
  const visibleCategoriesCount = 10; // Show 10 categories directly, rest go to "More" dropdown
  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await categoriesApi.getAll();
        
        console.log('Categories API response:', response);
        
        let categoriesData = [];
        
        if (response && response.data) {
          // Check if backend returns the standard format with success, count and data properties
          if (response.data.success && response.data.data) {
            console.log('Using backend standard response format with', response.data.data.length, 'categories');
            categoriesData = response.data.data;
          }
          // Fallback to direct array format
          else if (Array.isArray(response.data)) {
            categoriesData = response.data;
            console.log('Using array data format with', categoriesData.length, 'categories');
          } else if (response.data.categories && Array.isArray(response.data.categories)) {
            categoriesData = response.data.categories;
            console.log('Using data.categories format with', categoriesData.length, 'categories');
          } else if (response.data.results && Array.isArray(response.data.results)) {
            categoriesData = response.data.results;
            console.log('Using data.results format with', categoriesData.length, 'categories');
          } else {
            console.warn('Unexpected API response format:', response.data);
            // Try to extract categories if the data is an object with category-like properties
            const possibleCategories = Object.values(response.data);
            if (possibleCategories.length > 0 && typeof possibleCategories[0] === 'object') {
              categoriesData = possibleCategories.filter(item => 
                item && typeof item === 'object' && 'name' in item
              );
              console.log('Extracted potential categories:', categoriesData.length);
            }
          }
        }
        
        // Only use fallback categories if API returned nothing usable
        if (categoriesData.length === 0) {
          console.warn('No categories found in API response, using fallbacks');
          categoriesData = [
            { _id: '6500000000000000000000a1', name: 'Cleaning', description: 'Cleaning services', isActive: true },
            { _id: '6500000000000000000000a2', name: 'Plumbing', description: 'Plumbing services', isActive: true },
            { _id: '6500000000000000000000a3', name: 'Electrical', description: 'Electrical services', isActive: true },
            { _id: '6500000000000000000000a4', name: 'Painting', description: 'Painting services', isActive: true },
            { _id: '6500000000000000000000a5', name: 'Gardening', description: 'Gardening services', isActive: true },
            { _id: '6500000000000000000000a6', name: 'Carpentry', description: 'Carpentry services', isActive: true },
            { _id: '6500000000000000000000a7', name: 'Appliance Repair', description: 'Appliance repair services', isActive: true },
            { _id: '6500000000000000000000a8', name: 'Roofing', description: 'Roofing services', isActive: true },
            { _id: '6500000000000000000000a9', name: 'HVAC', description: 'HVAC services', isActive: true },
            { _id: '6500000000000000000000b1', name: 'Moving', description: 'Moving services', isActive: true },
            { _id: '6500000000000000000000b2', name: 'Pest Control', description: 'Pest control services', isActive: true },
            { _id: '6500000000000000000000b3', name: 'Flooring', description: 'Flooring services', isActive: true }
          ];
        }
        
        // Process the categories to add subcategories
        const categoriesWithSubcategories = await Promise.all(
          categoriesData.map(async (category: Category) => {
            try {
              if (!category._id) {
                console.warn('Category missing _id:', category);
                return {
                  ...category,
                  subcategories: []
                };
              }
              
              console.log('Fetching subcategories for category:', category.name, 'with ID:', category._id);
              const subcategoriesResponse = await categoriesApi.getSubcategories(category._id);
              console.log('Subcategories response:', subcategoriesResponse);
              
              let subcategories = [];
              
              if (subcategoriesResponse && subcategoriesResponse.data) {
                // Check for standard backend format with success, count and data properties
                if (subcategoriesResponse.data.success && subcategoriesResponse.data.data) {
                  console.log('Using backend standard response format for subcategories');
                  subcategories = subcategoriesResponse.data.data;
                }
                // Fallback to other formats
                else if (Array.isArray(subcategoriesResponse.data)) {
                  subcategories = subcategoriesResponse.data;
                } else if (subcategoriesResponse.data.subcategories && Array.isArray(subcategoriesResponse.data.subcategories)) {
                  subcategories = subcategoriesResponse.data.subcategories;
                } else if (subcategoriesResponse.data.results && Array.isArray(subcategoriesResponse.data.results)) {
                  subcategories = subcategoriesResponse.data.results;
                }
              }
              
              console.log(`Found ${subcategories.length} subcategories for ${category.name}`);
              
              return {
                ...category,
                subcategories: subcategories
              };
            } catch (error) {
              console.error(`Error fetching subcategories for ${category.name}:`, error);
              return {
                ...category,
                subcategories: []
              };
            }
          })
        );
        
        console.log('Final processed categories:', categoriesWithSubcategories);
        setCategories(categoriesWithSubcategories);
        
      } catch (error) {
        console.error('Error fetching categories:', error);
        
        // Only use fallbacks in case of API error
        const fallbackCategories = [
          { _id: '6500000000000000000000a1', name: 'Cleaning', description: 'Cleaning services', isActive: true, subcategories: [] },
          { _id: '6500000000000000000000a2', name: 'Plumbing', description: 'Plumbing services', isActive: true, subcategories: [] },
          { _id: '6500000000000000000000a3', name: 'Electrical', description: 'Electrical services', isActive: true, subcategories: [] },
          { _id: '6500000000000000000000a4', name: 'Painting', description: 'Painting services', isActive: true, subcategories: [] },
          { _id: '6500000000000000000000a5', name: 'Gardening', description: 'Gardening services', isActive: true, subcategories: [] }
        ];
        setCategories(fallbackCategories);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Error during logout:', error);
      // Still redirect to login page even if error occurs
      router.push('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Search providers function
  const searchProviders = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }
    
    setIsSearching(true);
    try {
      // Create a filter URL with the search parameter
      const searchUrl = `/providers?search=${encodeURIComponent(query)}`;
      console.log('Search URL:', searchUrl);
      
      // Use getByFilter instead of getAll to pass search parameters
      const response = await providersApi.getByFilter(searchUrl);
      console.log('Search providers response:', response);
      
      if (response && response.data) {
        // Check if backend returns the standard format with success, count and data properties
        if (response.data.success && response.data.data) {
          setSearchResults(response.data.data);
          console.log('Search results loaded (standard format):', response.data.data.length);
        }
        // Fallback to direct array if not in standard format
        else if (Array.isArray(response.data)) {
          setSearchResults(response.data);
          console.log('Search results loaded (array):', response.data.length);
        }
        // Other possible formats
        else if (response.data.providers && Array.isArray(response.data.providers)) {
          setSearchResults(response.data.providers);
          console.log('Search results loaded (data.providers):', response.data.providers.length);
        }
        else if (response.data.results && Array.isArray(response.data.results)) {
          setSearchResults(response.data.results);
          console.log('Search results loaded (data.results):', response.data.results.length);
        }
        else {
          console.warn('Search results response is not in expected format');
          console.warn('Response structure:', Object.keys(response.data));
          setSearchResults([]);
        }
      } else {
        console.warn('Search results response missing data property');
        setSearchResults([]);
      }
      
      setShowSearchResults(true);
    } catch (error) {
      console.error('Error searching providers:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search input change with debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm) {
        searchProviders(searchTerm);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // Handle clicks outside the search results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Split categories into main visible ones and overflow ones for "More" dropdown
  const visibleCategories = categories.slice(0, visibleCategoriesCount);
  const moreCategories = categories.slice(visibleCategoriesCount);

  // Add cleanup for the timeout when component unmounts
  useEffect(() => {
    return () => {
      if (closeMoreMenuTimeout) {
        clearTimeout(closeMoreMenuTimeout);
      }
    };
  }, [closeMoreMenuTimeout]);

  // Handle clicks outside the more menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setIsMoreMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?query=${encodeURIComponent(searchTerm)}`);
      setShowSearchResults(false);
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    console.log('Navigating to category with ID:', categoryId);
    router.push(`/services?category=${categoryId}`);
  };

  const handleSubcategoryClick = (categoryId: string, subcategoryId: string) => {
    console.log('Navigating to subcategory with ID:', subcategoryId, 'of category:', categoryId);
    router.push(`/services?category=${categoryId}&subcategory=${subcategoryId}`);
  };

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      // Close menus when switching to desktop
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
        setIsUserMenuOpen(false);
        setIsMoreMenuOpen(false);
      }
    };

    // Initial check
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Get the appropriate dashboard link based on user type
  const getDashboardLink = () => {
    if (!isAuthenticated || !user) return '/login';
    
    if (userType === 'provider') return '/provider/dashboard';
    if (user.role === 'admin') return '/admin/dashboard';
    return '/user/dashboard'; // Regular user dashboard
  };

  return (
    <nav className="bg-emerald-700 text-white w-full">
      {/* Top navigation bar */}
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/home" className="flex items-center">
          <h1 className="text-2xl font-bold">
            <span className="text-white">Home</span>
            <span className="text-white">Services</span>
          </h1>
        </Link>
        
        {/* Search bar */}
        <div className="hidden md:flex items-center justify-center flex-grow mx-4" ref={searchRef}>
          <div className="relative w-full max-w-xl">
            <form onSubmit={handleSearchSubmit}>
              <input 
                type="text" 
                placeholder="Search for service providers..." 
                className="w-full px-4 py-2 rounded-full bg-white text-black focus:outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => {
                  if (searchResults.length > 0) {
                    setShowSearchResults(true);
                  }
                }}
              />
              <button type="submit" className="absolute right-3 top-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>
            
            {/* Search results dropdown */}
            {showSearchResults && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
                {isSearching ? (
                  <div className="p-4 text-center text-gray-500">
                    <div className="inline-block animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-emerald-500 mr-2"></div>
                    Searching...
                  </div>
                ) : searchResults.length > 0 ? (
                  <ul className="py-1">
                    {searchResults.map((provider) => (
                      <li key={provider._id} className="border-b last:border-b-0">
                        <Link 
                          href={`/provider/${provider._id}`}
                          className="block px-4 py-3 hover:bg-gray-50 transition-colors"
                          onClick={() => setShowSearchResults(false)}
                        >
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                              <span className="text-sm font-medium text-gray-600">{provider.fullName.charAt(0)}</span>
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-gray-800">{provider.fullName}</div>
                              <div className="text-sm text-gray-500 truncate">{provider.location}</div>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-1">{provider.bio}</p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : searchTerm && (
                  <div className="p-4 text-center text-gray-500">
                    No providers found matching "{searchTerm}"
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Auth buttons or User menu */}
        <div className="hidden md:flex items-center space-x-2">
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center">
                  <span className="text-sm">{user?.fullName?.charAt(0) || 'U'}</span>
                </div>
                <span>{user?.fullName || 'User'}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              {/* User dropdown menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
                  <div className="py-1">
                    <Link
                      href={getDashboardLink()}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-emerald-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-emerald-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    {userType === 'user' && (
                      <Link 
                        href="/bookings" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-emerald-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        My Bookings
                      </Link>
                    )}
                    {userType === 'provider' && (
                      <>
                        <Link 
                          href="/provider/dashboard?tab=services" 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-emerald-100"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          My Services
                        </Link>
                        <Link 
                          href="/provider/dashboard?tab=bookings" 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-emerald-100"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          Service Requests
                        </Link>
                      </>
                    )}
                    {user?.role === 'admin' && (
                      <Link 
                        href="/admin" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-emerald-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsUserMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-emerald-100"
                      disabled={isLoggingOut}
                    >
                      {isLoggingOut ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Logging out...
                        </span>
                      ) : "Logout"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className="px-3 py-1 hover:underline">
                Login
              </Link>
              <span>|</span>
              <Link href="/signup" className="px-3 py-1 hover:underline">
                Sign Up
              </Link>
            </>
          )}
        
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              className="text-white focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile search bar */}
      <div className="md:hidden px-4 pb-3">
        <div className="relative">
          <form onSubmit={handleSearchSubmit}>
            <input 
              type="text" 
              placeholder="Search for service providers..." 
              className="w-full px-4 py-2 rounded-full text-black bg-white focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="absolute right-3 top-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>
        </div>
      </div>
      
      {/* Categories bar (desktop) */}
      <div className="hidden md:block bg-emerald-700 border-t border-emerald-600">
        <div className="container mx-auto">
          {loading ? (
            <div className="flex justify-center py-2 text-white">Loading categories...</div>
          ) : (
            <ul className="flex justify-between">
              {/* Display main visible categories */}
              {visibleCategories.map((category) => (
                <li key={category._id} className="group relative px-3 py-2">
                  <Link 
                    href={`/services?category=${category._id}`} 
                    className="text-white hover:text-emerald-200 whitespace-nowrap"
                  >
                    {category.name}
                    {category.subcategories && category.subcategories.length > 0 && (
                      <span className="ml-1">▼</span>
                    )}
                  </Link>
                  
                  {/* Dropdown */}
                  {category.subcategories && category.subcategories.length > 0 && (
                    <div className="absolute left-0 top-full mt-0 w-64 bg-white rounded-b shadow-lg group-hover:block hidden z-50">
                      <ul className="py-2">
                        {category.subcategories.map((subcategory) => (
                          <li key={subcategory._id}>
                            <Link 
                              href={`/services?category=${category._id}&subcategory=${subcategory._id}`}
                              className="block px-4 py-2 text-gray-800 hover:bg-emerald-100"
                            >
                              {subcategory.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              ))}

              {/* "More" dropdown for overflow categories */}
              {moreCategories.length > 0 && (
                <li className="group relative px-3 py-2" ref={moreMenuRef}>
                  <button
                    className="text-white hover:text-emerald-200 whitespace-nowrap flex items-center"
                    onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                    onMouseEnter={() => {
                      if (closeMoreMenuTimeout) {
                        clearTimeout(closeMoreMenuTimeout);
                        setCloseMoreMenuTimeout(null);
                      }
                      setIsMoreMenuOpen(true);
                    }}
                    onMouseLeave={() => {
                      const timeout = setTimeout(() => {
                        setIsMoreMenuOpen(false);
                      }, 500);
                      setCloseMoreMenuTimeout(timeout);
                    }}
                  >
                    More
                    <svg className="h-5 w-5 ml-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {/* More dropdown menu */}
                  <div 
                    className={`absolute right-0 top-full mt-0 w-64 bg-white rounded-b shadow-lg transition-opacity duration-300 z-50 ${isMoreMenuOpen ? 'visible opacity-100' : 'invisible opacity-0'}`}
                    onMouseEnter={() => {
                      if (closeMoreMenuTimeout) {
                        clearTimeout(closeMoreMenuTimeout);
                        setCloseMoreMenuTimeout(null);
                      }
                      setIsMoreMenuOpen(true);
                    }}
                    onMouseLeave={() => {
                      const timeout = setTimeout(() => {
                        setIsMoreMenuOpen(false);
                      }, 500);
                      setCloseMoreMenuTimeout(timeout);
                    }}
                  >
                    {/* Add a buffer area at the top to make transitioning from button to dropdown easier */}
                    <div className="h-2"></div>
                    <ul className="py-2">
                      {moreCategories.map((category) => (
                        <li key={category._id} className="group relative hover:bg-emerald-100">
                          <div className="flex justify-between px-4 py-2 text-gray-800">
                            <Link href={`/services?category=${category._id}`} className="block w-full">
                              {category.name}
                            </Link>
                            
                            {category.subcategories && category.subcategories.length > 0 && (
                              <div className="ml-2">
                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </div>
                          
                          {/* Nested subcategories dropdown */}
                          {category.subcategories && category.subcategories.length > 0 && (
                            <div className="absolute left-full top-0 w-64 bg-white rounded shadow-lg invisible group-hover:visible transition-opacity duration-300 opacity-0 group-hover:opacity-100 -mt-2">
                              <ul className="py-2">
                                {category.subcategories.map((subcategory) => (
                                  <li key={subcategory._id} className="hover:bg-emerald-100">
                                    <Link 
                                      href={`/services?category=${category._id}&subcategory=${subcategory._id}`}
                                      className="block px-4 py-2 text-gray-800"
                                    >
                                      {subcategory.name}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              )}
            </ul>
          )}
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden bg-emerald-800">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {/* Auth links for mobile */}
            <div className="flex justify-between px-3 py-2 border-b border-emerald-700">
              {isAuthenticated ? (
                <div className="w-full">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center">
                        <span className="text-sm">{user?.fullName?.charAt(0) || 'U'}</span>
                      </div>
                      <span className="ml-2">{user?.fullName || 'User'}</span>
                    </div>
                  </div>
                  <div className="mt-2 space-y-1">
                    <Link href={getDashboardLink()} className="block px-3 py-1 text-emerald-100 hover:text-white">
                      Dashboard
                    </Link>
                    <Link href="/profile" className="block px-3 py-1 text-emerald-100 hover:text-white">
                      Profile
                    </Link>
                    {userType === 'user' && (
                      <Link href="/bookings" className="block px-3 py-1 text-emerald-100 hover:text-white">
                        My Bookings
                      </Link>
                    )}
                    {userType === 'provider' && (
                      <>
                        <Link href="/provider/dashboard?tab=services" className="block px-3 py-1 text-emerald-100 hover:text-white">
                          My Services
                        </Link>
                        <Link href="/provider/dashboard?tab=bookings" className="block px-3 py-1 text-emerald-100 hover:text-white">
                          Service Requests
                        </Link>
                      </>
                    )}
                    {user?.role === 'admin' && (
                      <Link href="/admin" className="block px-3 py-1 text-emerald-100 hover:text-white">
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-left px-3 py-1 text-emerald-100 hover:text-white"
                      disabled={isLoggingOut}
                    >
                      {isLoggingOut ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-emerald-100" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Logging out...
                        </span>
                      ) : "Logout"}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <Link href="/login" className="text-white hover:text-emerald-200">
                    Login
                  </Link>
                  <Link href="/signup" className="text-white hover:text-emerald-200">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
            
            {/* Mobile Categories */}
            {loading ? (
              <div className="px-3 py-2 text-white">Loading categories...</div>
            ) : (
              categories.map((category) => (
                <div key={category._id} className="relative">
                  <details className="group">
                    <summary className="flex justify-between items-center px-3 py-2 text-white cursor-pointer list-none">
                      {category.name}
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </summary>
                    {category.subcategories && category.subcategories.length > 0 && (
                      <div className="pl-4 pr-2">
                        {category.subcategories.map((subcategory) => (
                          <Link 
                            key={subcategory._id}
                            href={`/services?category=${category._id}&subcategory=${subcategory._id}`}
                            className="block px-3 py-2 text-emerald-100 hover:text-white"
                          >
                            {subcategory.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </details>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;