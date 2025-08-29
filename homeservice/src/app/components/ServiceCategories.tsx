"use client"
import React, { useState, useEffect } from 'react';
import ServiceCategory from './ServiceCategory';
import { categories as categoriesApi } from '../utils/api';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface Subcategory {
  _id: string;
  name: string;
  description: string;
  image: string;
  category: string;
}

interface Category {
  _id: string;
  name: string;
  description: string;
  image: string;
}

// Mock data for development when the API is unavailable
const MOCK_CATEGORIES: Record<string, Category> = {
  '1': {
    _id: '1',
    name: 'Home Cleaning',
    description: 'Professional cleaning services for your home',
    image: '/images/cleaning.jpg'
  },
  '2': {
    _id: '2',
    name: 'Plumbing',
    description: 'Expert plumbing services for your home',
    image: '/images/plumbing.jpg'
  },
  '3': {
    _id: '3',
    name: 'Electrical',
    description: 'Certified electricians for all your needs',
    image: '/images/electrical.jpg'
  }
};

const MOCK_SUBCATEGORIES: Record<string, Subcategory[]> = {
  '1': [
    {
      _id: '101',
      name: 'Deep Cleaning',
      description: 'Thorough cleaning of your entire home',
      image: '/images/deep-cleaning.jpg',
      category: '1'
    },
    {
      _id: '102',
      name: 'Window Cleaning',
      description: 'Professional window cleaning services',
      image: '/images/window-cleaning.jpg',
      category: '1'
    },
    {
      _id: '103',
      name: 'Carpet Cleaning',
      description: 'Deep clean your carpets and rugs',
      image: '/images/carpet-cleaning.jpg',
      category: '1'
    }
  ],
  '2': [
    {
      _id: '201',
      name: 'Pipe Repair',
      description: 'Fix leaky pipes and plumbing issues',
      image: '/images/pipe-repair.jpg',
      category: '2'
    },
    {
      _id: '202',
      name: 'Drain Cleaning',
      description: 'Unclog drains and ensure proper water flow',
      image: '/images/drain-cleaning.jpg',
      category: '2'
    }
  ],
  '3': [
    {
      _id: '301',
      name: 'Wiring Installation',
      description: 'Install new wiring for your home',
      image: '/images/wiring.jpg',
      category: '3'
    },
    {
      _id: '302',
      name: 'Light Fixture Installation',
      description: 'Install or replace light fixtures',
      image: '/images/lighting.jpg',
      category: '3'
    }
  ]
};

const ServiceCategories: React.FC = () => {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get('category');
  const subcategoryId = searchParams.get('subcategory');
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [subcategoriesLoading, setSubcategoriesLoading] = useState(true);
  const [subcategoriesError, setSubcategoriesError] = useState<string | null>(null);
  const [useMockData, setUseMockData] = useState(false);

  useEffect(() => {
    const fetchSubcategories = async () => {
      if (!categoryId) return;

      try {
        setSubcategoriesLoading(true);
        setSubcategoriesError(null);
        
        console.log(`API URL: ${process.env.NEXT_PUBLIC_API_URL}`);
        console.log(`Attempting to fetch category with ID: ${categoryId}`);

        // Fetch category details using the API utility
        try {
          const categoryResponse = await categoriesApi.getById(categoryId);
          console.log("Category response:", categoryResponse);
          
          if (categoryResponse && categoryResponse.data) {
            setCategory(categoryResponse.data);
            console.log("Category data:", categoryResponse.data);
          } else {
            throw new Error('Failed to fetch category details - empty response');
          }
        } catch (categoryError) {
          console.error("Error fetching category:", categoryError);
          // Use mock data if API fails
          if (MOCK_CATEGORIES[categoryId]) {
            console.log("Using mock category data");
            setCategory(MOCK_CATEGORIES[categoryId]);
            setUseMockData(true);
          } else {
            throw new Error(`Failed to fetch category details - ${categoryError instanceof Error ? categoryError.message : String(categoryError)}`);
          }
        }

        // Fetch subcategories for the category
        try {
          if (useMockData) {
            console.log("Using mock subcategory data");
            setSubcategories(MOCK_SUBCATEGORIES[categoryId] || []);
          } else {
            const subcategoriesResponse = await categoriesApi.getSubcategories(categoryId);
            console.log("Subcategories response:", subcategoriesResponse);
            
            if (subcategoriesResponse && subcategoriesResponse.data) {
              // Log detailed info about the response format
              console.log('Subcategories data type:', typeof subcategoriesResponse.data);
              console.log('Subcategories data structure:', JSON.stringify(subcategoriesResponse.data, null, 2));
              
              // Check for standard backend format with success, count and data properties
              if (subcategoriesResponse.data.success && subcategoriesResponse.data.data) {
                setSubcategories(subcategoriesResponse.data.data);
                console.log("Subcategories data (standard format):", subcategoriesResponse.data.data.length);
              }
              // Check if data is already an array
              else if (Array.isArray(subcategoriesResponse.data)) {
                setSubcategories(subcategoriesResponse.data);
                console.log("Subcategories data (array):", subcategoriesResponse.data.length);
              } 
              // Check if data contains a subcategories property that is an array
              else if (subcategoriesResponse.data.subcategories && Array.isArray(subcategoriesResponse.data.subcategories)) {
                setSubcategories(subcategoriesResponse.data.subcategories);
                console.log("Subcategories data (data.subcategories):", subcategoriesResponse.data.subcategories.length);
              }
              // Check if data is an object with a results property
              else if (subcategoriesResponse.data.results && Array.isArray(subcategoriesResponse.data.results)) {
                setSubcategories(subcategoriesResponse.data.results);
                console.log("Subcategories data (data.results):", subcategoriesResponse.data.results.length);
              } else {
                console.warn("Subcategories response is not in expected format");
                console.warn("Response structure:", Object.keys(subcategoriesResponse.data));
                // Fallback to empty array to prevent errors
                setSubcategories([]);
              }
            } else {
              throw new Error('Failed to fetch subcategories - empty response');
            }
          }
        } catch (subcategoriesError) {
          console.error("Error fetching subcategories:", subcategoriesError);
          // If category fetch succeeded but subcategories failed, use mock data
          if (MOCK_SUBCATEGORIES[categoryId]) {
            console.log("Using mock subcategory data after API error");
            setSubcategories(MOCK_SUBCATEGORIES[categoryId]);
          } else {
            // If no mock data available, set error
            setSubcategoriesError(`Failed to fetch subcategories - ${subcategoriesError instanceof Error ? subcategoriesError.message : String(subcategoriesError)}`);
          }
        }
      } catch (error) {
        console.error("Error in data fetching flow:", error);
        // Final fallback - if we have mock data for the category, use it
        if (MOCK_CATEGORIES[categoryId] && MOCK_SUBCATEGORIES[categoryId]) {
          console.log("Using full mock data fallback");
          setCategory(MOCK_CATEGORIES[categoryId]);
          setSubcategories(MOCK_SUBCATEGORIES[categoryId]);
          setSubcategoriesError(null);
        } else {
          setSubcategoriesError(error instanceof Error ? error.message : String(error));
        }
      } finally {
        setSubcategoriesLoading(false);
      }
    };

    fetchSubcategories();
  }, [categoryId, useMockData]);

  if (subcategoriesLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
              <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (subcategoriesError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
          <div className="text-center mb-6">
            <svg className="mx-auto h-16 w-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-800 mt-4">Error Loading Services</h2>
          </div>
          
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-red-700">{subcategoriesError}</p>
          </div>
          
          <div className="mb-6">
            <h3 className="font-semibold text-gray-700 mb-2">Troubleshooting Steps:</h3>
            <ul className="list-disc pl-5 space-y-1 text-gray-600">
              <li>Refresh the page to try again</li>
              <li>Check if the backend server is running at <code className="bg-gray-100 px-1 rounded">http://localhost:5000</code></li>
              <li>Verify that the correct category ID is being used: <code className="bg-gray-100 px-1 rounded">{categoryId || 'No category ID'}</code></li>
              <li>Check API URL configuration in <code className="bg-gray-100 px-1 rounded">.env.local</code> file</li>
              <li>Check browser console for detailed error information</li>
            </ul>
          </div>
          
          <div className="flex justify-center space-x-4">
            <Link 
              href="/"
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Return to Home
            </Link>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!categoryId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Select a Category</h2>
          <p className="text-gray-600">Please select a category from the navigation menu to view available services.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 border-b border-gray-300 mb-8">
      {/* Breadcrumb */}
      <nav className="flex mb-8" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-2">
          <li>
            <Link href="/" className="text-gray-500 hover:text-gray-700">
              Home
            </Link>
          </li>
          <li>
            <span className="text-gray-400 mx-2">/</span>
          </li>
          <li>
            <Link href="/services" className="text-gray-500 hover:text-gray-700">
              Services
            </Link>
          </li>
          <li>
            <span className="text-gray-400 mx-2">/</span>
          </li>
          <li className="text-gray-900">{category?.name}</li>
        </ol>
      </nav>

      {/* Category Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{category?.name}</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          {category?.description}
        </p>
      </div>

      {/* Subcategories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subcategories.map((subcategory) => (
          <Link
            key={subcategory._id}
            href={`/services?category=${categoryId}&subcategory=${subcategory._id}`}
            className={`block transition-all duration-300 hover:shadow-lg ${
              subcategoryId === subcategory._id ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            <ServiceCategory
              name={subcategory.name}
              description={subcategory.description}
              image={subcategory.image}
            />
          </Link>
        ))}
      </div>

      {subcategories.length === 0 && (
        <div className="text-center mt-12">
          <p className="text-gray-600">No services found in this category.</p>
        </div>
      )}
    </div>
  );
};

export default ServiceCategories;