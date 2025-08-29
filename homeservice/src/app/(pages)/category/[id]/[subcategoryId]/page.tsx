"use client"
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/app/components/Navbar';
import ServiceList from '@/app/components/ServiceList';
import { categories } from '@/app/utils/api';
import Link from 'next/link';

interface Category {
  _id: string;
  name: string;
  description: string;
  image?: string;
}

interface Subcategory {
  _id: string;
  name: string;
  description: string;
  category: string;
}

const SubcategoryPage = () => {
  const params = useParams();
  const categoryId = params.id as string;
  const subcategoryId = params.subcategoryId as string;
  
  const [category, setCategory] = useState<Category | null>(null);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch category details
        const categoryResponse = await categories.getById(categoryId);
        setCategory(categoryResponse.data);
        
        // Fetch all subcategories for this category
        const subcategoriesResponse = await categories.getSubcategories(categoryId);
        setSubcategories(subcategoriesResponse.data);
        
        // Find the selected subcategory
        const selected = subcategoriesResponse.data.find(
          (subcategory: Subcategory) => subcategory._id === subcategoryId
        );
        
        if (selected) {
          setSelectedSubcategory(selected);
        } else {
          setError('Subcategory not found');
        }
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError('Failed to load information. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (categoryId && subcategoryId) {
      fetchData();
    }
  }, [categoryId, subcategoryId]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
            <p>{error}</p>
          </div>
        ) : category && selectedSubcategory ? (
          <>
            <div className="mb-6">
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <Link href="/" className="hover:underline">Home</Link>
                <span className="mx-2">›</span>
                <Link href={`/category/${categoryId}`} className="hover:underline">{category.name}</Link>
                <span className="mx-2">›</span>
                <span className="text-gray-700">{selectedSubcategory.name}</span>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-800">{selectedSubcategory.name}</h1>
              <p className="text-gray-600 mt-2 mb-6">{selectedSubcategory.description}</p>
            </div>
            
            {/* Subcategories section */}
            {subcategories.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-700 mb-3">
                  All services in {category.name}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {subcategories.map((subcategory) => (
                    <Link
                      key={subcategory._id}
                      href={`/category/${categoryId}/${subcategory._id}`}
                    >
                      <span 
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors inline-block ${
                          subcategoryId === subcategory._id
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-emerald-50'
                        }`}
                      >
                        {subcategory.name}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            
            {/* Service list section */}
            <ServiceList 
              categoryId={categoryId}
              subcategoryId={subcategoryId}
            />
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">Information not found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubcategoryPage; 