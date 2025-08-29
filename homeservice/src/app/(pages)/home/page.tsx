// pages/index.tsx
"use client"
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/app/components/Navbar';
import { categories as categoriesApi } from '@/app/utils/api';
import Link from 'next/link';

// Define TypeScript interfaces
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
  image: string;
  isActive: boolean;
  subcategories?: Subcategory[];
}

// Fallback data for when API is completely unavailable
const FALLBACK_CATEGORIES = [
  {
    _id: '1',
    name: 'Home Cleaning',
    description: 'Professional cleaning services for your home',
    image: '/images/cleaning.jpg',
    isActive: true,
    subcategories: []
  },
  {
    _id: '2',
    name: 'Plumbing',
    description: 'Expert plumbing services for your home',
    image: '/images/plumbing.jpg',
    isActive: true,
    subcategories: []
  },
  {
    _id: '3',
    name: 'Electrical',
    description: 'Certified electricians for all your needs',
    image: '/images/electrical.jpg',
    isActive: true,
    subcategories: []
  },
  {
    _id: '4',
    name: 'Landscaping',
    description: 'Garden design, maintenance, and lawn care services',
    image: '/images/landscaping.jpg',
    isActive: true,
    subcategories: []
  },
  {
    _id: '5',
    name: 'Home Repair',
    description: 'General home repair and maintenance services',
    image: '/images/repair.jpg',
    isActive: true,
    subcategories: []
  },
  {
    _id: '6',
    name: 'HVAC',
    description: 'Heating, ventilation, and air conditioning services',
    image: '/images/hvac.jpg',
    isActive: true,
    subcategories: []
  },
  {
    _id: '7',
    name: 'Painting',
    description: 'Interior and exterior painting services',
    image: '/images/painting.jpg',
    isActive: true,
    subcategories: []
  },
  {
    _id: '8',
    name: 'Roofing',
    description: 'Roof installation, repair, and maintenance services',
    image: '/images/roofing.jpg',
    isActive: true,
    subcategories: []
  }
];

const HomePage: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [visibleCount, setVisibleCount] = useState(8); // Number of initially visible categories
    const [error, setError] = useState<string | null>(null);
    const [usingFallbackData, setUsingFallbackData] = useState(false);
    const initialCategoryCount = 8; // Store initial count as a constant
    const [retryCount, setRetryCount] = useState(0);

    // Fetch categories from backend
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setIsLoading(true);
                setError(null);
                
                console.log(`Fetching categories from ${process.env.NEXT_PUBLIC_API_URL || 'default API URL'}`);
                const response = await categoriesApi.getAll();
                
                console.log('Categories API response:', response);
                
                // Validate categories data format
                if (!response || !response.data) {
                    throw new Error('Empty response from categories API');
                }
                
                // Handle different response formats
                let categoriesData = [];
                if (response.data.success && Array.isArray(response.data.data)) {
                    console.log('Using standard response format with success flag');
                    categoriesData = response.data.data;
                } else if (Array.isArray(response.data)) {
                    console.log('Using direct array response format');
                    categoriesData = response.data;
                } else if (response.data.categories && Array.isArray(response.data.categories)) {
                    console.log('Using data.categories format');
                    categoriesData = response.data.categories;
                } else if (response.data.results && Array.isArray(response.data.results)) {
                    console.log('Using data.results format');
                    categoriesData = response.data.results;
                } else {
                    console.warn('Unexpected API response format:', response.data);
                    throw new Error('Invalid data format received from API');
                }
                
                if (categoriesData.length === 0) {
                    console.warn('API returned empty categories array');
                }
                
                // Fetch subcategories for each category
                const categoriesWithSubcategories = await Promise.all(
                    categoriesData.map(async (category: Category) => {
                        try {
                            const subcategoriesResponse = await categoriesApi.getSubcategories(category._id);
                            console.log(`Subcategories for ${category.name}:`, subcategoriesResponse);
                            
                            let subcategories = [];
                            
                            if (subcategoriesResponse && subcategoriesResponse.data) {
                                // Check if data is already an array
                                if (Array.isArray(subcategoriesResponse.data)) {
                                    subcategories = subcategoriesResponse.data;
                                    console.log('Subcategories loaded (array):', subcategories.length);
                                } 
                                // Check if data contains a subcategories property that is an array
                                else if (subcategoriesResponse.data.subcategories && Array.isArray(subcategoriesResponse.data.subcategories)) {
                                    subcategories = subcategoriesResponse.data.subcategories;
                                    console.log('Subcategories loaded (data.subcategories):', subcategories.length);
                                }
                                // Check if data is an object with a results property
                                else if (subcategoriesResponse.data.results && Array.isArray(subcategoriesResponse.data.results)) {
                                    subcategories = subcategoriesResponse.data.results;
                                    console.log('Subcategories loaded (data.results):', subcategories.length);
                                }
                                // Check for success/data pattern
                                else if (subcategoriesResponse.data.success && Array.isArray(subcategoriesResponse.data.data)) {
                                    subcategories = subcategoriesResponse.data.data;
                                    console.log('Subcategories loaded (success/data):', subcategories.length);
                                }
                                else {
                                    console.warn('Subcategories response is not in expected format');
                                    console.warn('Response structure:', Object.keys(subcategoriesResponse.data));
                                }
                            }
                            
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
                
                setCategories(categoriesWithSubcategories);
                setUsingFallbackData(false);
            } catch (error: any) {
                console.error('Error fetching categories:', error);
                
                let errorMessage = 'Failed to load categories. Please try again later.';
                
                // More detailed error message based on the error type
                if (error.message === 'Network Error') {
                    errorMessage = 'Unable to connect to the server. Please check your internet connection.';
                } else if (error.response) {
                    errorMessage = `Server error (${error.response.status}): ${error.response.data?.message || 'Unknown error'}`;
                }
                
                setError(errorMessage);
                
                // Use fallback data after multiple retries
                if (retryCount > 2) {
                    console.log('Using fallback data after multiple failed attempts');
                    setCategories(FALLBACK_CATEGORIES);
                    setUsingFallbackData(true);
                } else {
                    setCategories([]);
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchCategories();
    }, [retryCount]);

    const handleRetry = () => {
        setRetryCount(prev => prev + 1);
        setIsLoading(true);
    };

    const handleDropdownToggle = (categoryId: number) => {
        if (activeDropdown === categoryId) {
            setActiveDropdown(null);
        } else {
            setActiveDropdown(categoryId);
        }
    };

    const handleCategoryView = (action: 'more' | 'less') => {
        if (action === 'more') {
            setVisibleCount(prevCount => prevCount + 8); // Show 8 more categories
        } else {
            setVisibleCount(initialCategoryCount); // Reset to initial count
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.5
            }
        }
    };

    // Display only the first 'visibleCount' categories
    const visibleCategories = categories.slice(0, visibleCount);
    const hasMoreCategories = visibleCount < categories.length;

    // Base URL for backend images
    const imageBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

    return (
        <div className="min-h-screen bg-gray-50">
            <Head>
                <title>HomeServices - Your Home Service Experts</title>
                <meta name="description" content="Find reliable home services professionals" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <Navbar />

            {/* Show error message if there is one */}
            {error && (
                <div className="container mx-auto px-4 mt-4">
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700">{error}</p>
                                <div className="mt-2">
                                    <button 
                                        className="px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors text-sm font-medium"
                                        onClick={handleRetry}
                                    >
                                        Retry Connection
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Show fallback data message */}
            {usingFallbackData && (
                <div className="container mx-auto px-4 mt-4">
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-yellow-700">
                                    Showing sample data due to API connection issues. Some features may be limited.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Hero Section */}
            <section className="container mx-auto p-4">
                <motion.div
                    className="rounded-lg mb-8 overflow-hidden relative"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="relative h-96">
                        {/* Hero image */}
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-800 to-emerald-600">
                            {/* This would be replaced with an actual image */}
                            <div className="absolute inset-0 opacity-40" style={{
                                backgroundImage: "url('/api/placeholder/1200/600')",
                                backgroundSize: "cover",
                                backgroundPosition: "center"
                            }}></div>
                        </div>

                        <div className="relative z-10 h-full flex flex-col justify-center px-6 md:px-12 text-white">
                            <motion.h2
                                className="text-3xl md:text-5xl font-bold mb-4"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.6 }}
                            >
                                Professional Home Services
                            </motion.h2>
                            <motion.p
                                className="text-lg md:text-xl mb-8 max-w-2xl"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5, duration: 0.6 }}
                            >
                                Connect with trusted professionals for all your home service needs. From repairs to cleaning, we've got you covered.
                            </motion.p>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7, duration: 0.6 }}
                            >
                                <button className="bg-white text-emerald-700 px-6 py-3 rounded-full font-medium hover:bg-emerald-50 transition-colors shadow-lg">
                                    Book a Service Today
                                </button>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* Service Categories Grid */}
            <section className="container mx-auto p-4">
                <motion.h2
                    className="text-2xl font-semibold mb-6 text-gray-800"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                >
                    Service Categories
                </motion.h2>

                {isLoading ? (
                    <div className="flex justify-center items-center min-h-[300px]">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-500"></div>
                    </div>
                ) : categories.length === 0 && !usingFallbackData ? (
                    <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
                        <p>No categories available at this time.</p>
                        <button 
                            className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors"
                            onClick={handleRetry}
                        >
                            Refresh
                        </button>
                    </div>
                ) : (
                    <motion.div
                        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {visibleCategories.map((category) => (
                            <motion.div
                                key={category._id}
                                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
                                variants={itemVariants}
                                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                            >
                                <Link href={`/services?category=${category._id}`} className="block">
                                    <div className="p-2">
                                        <h3 className="text-sm font-medium text-gray-800">{category.name}</h3>
                                    </div>
                                    <div className="h-32 sm:h-40 relative">
                                        <div className="w-full h-full bg-gray-200 relative overflow-hidden">
                                            {/* Use next/image with external URL support */}
                                            {(() => {
                                                const isHttp = typeof category.image === 'string' && category.image.startsWith('http');
                                                const isDefault = category.image === 'default-category.jpg' || !category.image;
                                                const src = isDefault
                                                    ? '/next.svg'
                                                    : isHttp
                                                        ? category.image
                                                        : `${imageBaseUrl}/categories/${category.image}`;
                                                return (
                                                    <Image
                                                        src={src}
                                                        alt={category.name}
                                                        fill
                                                        sizes="(max-width: 640px) 50vw, 25vw"
                                                        style={{ objectFit: 'cover' }}
                                                    />
                                                );
                                            })()}
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {hasMoreCategories && (
                    <div className="flex justify-center mt-8">
                        <motion.button
                            className="bg-white border border-emerald-600 text-emerald-600 px-8 py-3 rounded-full hover:bg-emerald-50 transition-colors duration-300 shadow"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleCategoryView('more')}
                        >
                            View More
                        </motion.button>
                    </div>
                )}

                {/* View Less button - only show if we're displaying more than the initial count */}
                {visibleCount > initialCategoryCount && (
                    <div className="flex justify-center mt-4">
                        <motion.button
                            className="bg-white border border-gray-400 text-gray-600 px-8 py-2 rounded-full hover:bg-gray-50 transition-colors duration-300"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleCategoryView('less')}
                        >
                            View Less
                        </motion.button>
                    </div>
                )}
            </section>

            {/* Trusted Brands Section */}
            <section className="container mx-auto py-16 px-4">
                <motion.h2
                    className="text-center text-2xl font-semibold mb-12"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                >
                    Trusted By Top Brands
                </motion.h2>

                <motion.div
                    className="flex flex-wrap justify-center items-center gap-8 md:gap-16"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                >
                    <motion.div
                        className="w-24 grayscale hover:grayscale-0 transition-all duration-300"
                        whileHover={{ scale: 1.1 }}
                    >
                        <p className="font-bold text-center">Microsoft</p>
                    </motion.div>
                    <motion.div
                        className="w-24 grayscale hover:grayscale-0 transition-all duration-300"
                        whileHover={{ scale: 1.1 }}
                    >
                        <p className="font-bold text-center">Adobe</p>
                    </motion.div>
                    <motion.div
                        className="w-24 grayscale hover:grayscale-0 transition-all duration-300"
                        whileHover={{ scale: 1.1 }}
                    >
                        <p className="font-bold text-center">Google</p>
                    </motion.div>
                    <motion.div
                        className="w-24 grayscale hover:grayscale-0 transition-all duration-300"
                     
                        whileHover={{ scale: 1.1 }}
                    >
                        <p className="font-bold text-center">NETFLIX</p>
                    </motion.div>
                </motion.div>
            </section>
            {/* Improved Footer */}
            <footer className="bg-gray-900 text-white pt-16 pb-8">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Column 1: About */}
                        <div>
                            <h3 className="text-xl font-bold text-emerald-400 mb-4">HomeServices</h3>
                            <p className="text-gray-300 mb-4">
                                Connecting you with trusted professionals for all your home service needs since 2018.
                            </p>
                            <div className="flex space-x-4">
                                <a href="#" className="text-gray-300 hover:text-emerald-400 transition-colors">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path>
                                    </svg>
                                </a>
                                <a href="#" className="text-gray-300 hover:text-emerald-400 transition-colors">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"></path>
                                    </svg>
                                </a>
                                <a href="#" className="text-gray-300 hover:text-emerald-400 transition-colors">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"></path>
                                    </svg>
                                </a>
                            </div>
                        </div>

                        {/* Column 2: Quick Links */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                            <ul className="space-y-2">
                                <li><a href="#" className="text-gray-300 hover:text-emerald-400 transition-colors">About Us</a></li>
                                <li><a href="#" className="text-gray-300 hover:text-emerald-400 transition-colors">Our Services</a></li>
                                <li><a href="#" className="text-gray-300 hover:text-emerald-400 transition-colors">How It Works</a></li>
                                <li><a href="#" className="text-gray-300 hover:text-emerald-400 transition-colors">Blog</a></li>
                                <li><a href="#" className="text-gray-300 hover:text-emerald-400 transition-colors">FAQ</a></li>
                                <li><a href="#" className="text-gray-300 hover:text-emerald-400 transition-colors">Contact Us</a></li>
                            </ul>
                        </div>

                        {/* Column 3: Popular Services */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Popular Services</h3>
                            <ul className="space-y-2">
                                <li><a href="#" className="text-gray-300 hover:text-emerald-400 transition-colors">Home Cleaning</a></li>
                                <li><a href="#" className="text-gray-300 hover:text-emerald-400 transition-colors">Plumbing Services</a></li>
                                <li><a href="#" className="text-gray-300 hover:text-emerald-400 transition-colors">Electrical Repairs</a></li>
                                <li><a href="#" className="text-gray-300 hover:text-emerald-400 transition-colors">Furniture Assembly</a></li>
                                <li><a href="#" className="text-gray-300 hover:text-emerald-400 transition-colors">Lawn Care</a></li>
                                <li><a href="#" className="text-gray-300 hover:text-emerald-400 transition-colors">Home Painting</a></li>
                            </ul>
                        </div>

                        {/* Column 4: Newsletter */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Get Started Now</h3>
                            <p className="text-gray-300 mb-4">Subscribe to our newsletter for updates and promotions.</p>
                            <form className="space-y-4">
                                <div>
                                    <input
                                        type="email"
                                        placeholder="Email Address"
                                        className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-emerald-400"
                                    />
                                </div>
                                <div>
                                    <input
                                        type="tel"
                                        placeholder="Phone Number"
                                        className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-emerald-400"
                                    />
                                </div>
                                <motion.button
                                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded transition-colors w-full"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    Subscribe
                                </motion.button>
                            </form>
                        </div>
                    </div>

                    {/* Bottom Footer */}
                    <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
                        <p className="text-gray-400 text-sm">©2025 HomeServices Inc. All rights reserved.</p>
                        <div className="flex flex-wrap space-x-4 mt-4 md:mt-0 text-sm">
                            <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">Terms of Service</a>
                            <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">Privacy Policy</a>
                            <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">Cookies</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};
export default HomePage
