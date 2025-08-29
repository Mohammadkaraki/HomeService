// components/CleaningServicesGrid.tsx
"use client"
import React, { useState, useEffect } from 'react';
import { categories } from '../utils/api';
import CleaningCard from './CleaningCard';

interface Category {
  _id: string;
  name: string;
  description: string;
  subcategories: Array<{
    _id: string;
    name: string;
    description: string;
  }>;
}

const CleaningServicesGrid: React.FC = () => {
  const [serviceCategories, setServiceCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await categories.getAll();
        
        // Handle the backend response format
        let categoriesData = [];
        if (response && response.data) {
          if (response.data.success && response.data.data) {
            categoriesData = response.data.data;
          } else if (Array.isArray(response.data)) {
            categoriesData = response.data;
          }
        }

        // Fetch subcategories for each category
        const categoriesWithSubcategories = await Promise.all(
          categoriesData.map(async (category: Category) => {
            try {
              const subcategoriesResponse = await categories.getSubcategories(category._id);
              let subcategories = [];
              
              if (subcategoriesResponse && subcategoriesResponse.data) {
                if (subcategoriesResponse.data.success && subcategoriesResponse.data.data) {
                  subcategories = subcategoriesResponse.data.data;
                } else if (Array.isArray(subcategoriesResponse.data)) {
                  subcategories = subcategoriesResponse.data;
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

        setServiceCategories(categoriesWithSubcategories);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories. Please try again later.');
        setServiceCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-5 h-full">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((j) => (
                  <div key={j} className="h-4 bg-gray-200 rounded w-3/4"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
          <p>{error}</p>
          <button 
            className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Our Services</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {serviceCategories.map((category) => (
          <CleaningCard 
            key={category._id} 
            services={category.subcategories}
            title={category.name}
            description={category.description}
            categoryId={category._id}
          />
        ))}
      </div>
    </div>
  );
};

export default CleaningServicesGrid;