"use client"
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import ServiceList from '../../../components/ServiceList';
import { categories } from '../../../utils/api';
import Link from 'next/link';
import Image from 'next/image';

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

const CategoryPage = () => {
  const params = useParams();
  const categoryId = params.id as string;
  
  const [category, setCategory] = useState<Category | null>(null);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setLoading(true);
        
        // Fetch category details
        const categoryResponse = await categories.getById(categoryId);
        setCategory(categoryResponse.data);
        
        // Fetch subcategories
        const subcategoriesResponse = await categories.getSubcategories(categoryId);
        setSubcategories(subcategoriesResponse.data);
      } catch (err: any) {
        console.error('Error fetching category data:', err);
        setError('Failed to load category information. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      fetchCategoryData();
    }
  }, [categoryId]);

  const handleSubcategoryClick = (subcategoryId: string) => {
    setSelectedSubcategory(subcategoryId === selectedSubcategory ? null : subcategoryId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
            <p>{error}</p>
          </div>
        ) : category ? (
          <>
            <div className="mb-6">
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <Link href="/" className="hover:underline">Home</Link>
                <span className="mx-2">›</span>
                <span className="text-gray-700">{category.name}</span>
              </div>

              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
                {category.image && (
                  <div className="w-full md:w-1/4 max-w-xs">
                    <div className="rounded-lg overflow-hidden">
                      <Image
                        src={category.image}
                        alt={category.name}
                        width={300}
                        height={200}
                        className="object-cover w-full"
                      />
                    </div>
                  </div>
                )}
                <div className={`${category.image ? 'md:w-3/4' : 'w-full'}`}>
                  <h1 className="text-3xl font-bold text-gray-800">{category.name}</h1>
                  <p className="text-gray-600 mt-2">{category.description}</p>
                </div>
              </div>
            </div>
            
            {/* Subcategories section */}
            {subcategories.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-700 mb-3">Services in this category</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {subcategories.map((subcategory) => (
                    <Link
                      key={subcategory._id}
                      href={`/category/${categoryId}/${subcategory._id}`}
                      className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
                    >
                      <h3 className="font-medium text-gray-800 mb-1">{subcategory.name}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{subcategory.description}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            
            {/* Featured services from this category */}
            <div className="mt-10">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Popular Services</h2>
              <ServiceList 
                categoryId={categoryId} 
                subcategoryId={selectedSubcategory || undefined} 
              />
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">Category not found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage; 