"use client"
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '../../../../components/Navbar';
import Footer from '../../../../components/Footer';
import ProtectedRoute from '../../../../components/ProtectedRoute';
import { categories, providers } from '../../../../utils/api';

interface Category {
  _id: string;
  name: string;
  subcategories: Subcategory[];
}

interface Subcategory {
  _id: string;
  name: string;
}

interface FormData {
  category: string;
  subcategories: string[];
  hourlyRate: number;
  description: string;
}

const NewServicePage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  
  // Form state
  const [formData, setFormData] = useState<FormData>({
    category: '',
    subcategories: [],
    hourlyRate: 0,
    description: '',
  });
  
  // Get all categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await categories.getAll();
        setAllCategories(response.data);
        
      } catch (err: any) {
        console.error('Error fetching categories:', err);
        setError(err.response?.data?.message || 'Failed to load categories');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'hourlyRate') {
      const numValue = parseFloat(value);
      setFormData(prev => ({
        ...prev,
        [name]: isNaN(numValue) ? 0 : numValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Handle category change
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    
    // Reset subcategories when category changes
    setFormData(prev => ({
      ...prev,
      category: value,
      subcategories: []
    }));
    
    // Clear error for category
    if (formErrors.category) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.category;
        return newErrors;
      });
    }
  };
  
  // Handle subcategory selection
  const handleSubcategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    
    if (checked) {
      // Add subcategory
      setFormData(prev => ({
        ...prev,
        subcategories: [...prev.subcategories, value]
      }));
    } else {
      // Remove subcategory
      setFormData(prev => ({
        ...prev,
        subcategories: prev.subcategories.filter(id => id !== value)
      }));
    }
    
    // Clear error for subcategories
    if (formErrors.subcategories) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.subcategories;
        return newErrors;
      });
    }
  };
  
  // Form validation
  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!formData.category) errors.category = 'Please select a category';
    if (formData.subcategories.length === 0) errors.subcategories = 'Please select at least one subcategory';
    if (formData.hourlyRate <= 0) errors.hourlyRate = 'Please enter a valid hourly rate';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Call API to create service
      await providers.createService(user?._id || '', formData);
      
      // Redirect to dashboard
      router.push('/provider/dashboard?tab=services');
      
    } catch (err: any) {
      console.error('Error creating service:', err);
      setError(err.message || 'Failed to create service');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Get selected category object
  const selectedCategory = allCategories.find(cat => cat._id === formData.category);
  
  return (
    <ProtectedRoute allowedRoles={['provider']}>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Header */}
            <div className="bg-emerald-700 text-white p-6">
              <h1 className="text-2xl font-bold">Add New Service</h1>
              <p className="text-emerald-100">Create a new service offering</p>
            </div>
            
            {/* Content */}
            <div className="p-6">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
                </div>
              ) : error ? (
                <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 mb-6">
                  <p>{error}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {/* Category selection */}
                  <div className="mb-6">
                    <label className="block text-gray-700 font-medium mb-2" htmlFor="category">
                      Service Category
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleCategoryChange}
                      className={`w-full p-3 border rounded-md ${formErrors.category ? 'border-red-500' : 'border-gray-300'}`}
                    >
                      <option value="">Select a category</option>
                      {allCategories.map(category => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {formErrors.category && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.category}</p>
                    )}
                  </div>
                  
                  {/* Subcategory selection */}
                  {selectedCategory && (
                    <div className="mb-6">
                      <label className="block text-gray-700 font-medium mb-2">
                        Specialties/Subcategories
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {selectedCategory.subcategories.map(subcategory => (
                          <div key={subcategory._id} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`subcategory-${subcategory._id}`}
                              value={subcategory._id}
                              checked={formData.subcategories.includes(subcategory._id)}
                              onChange={handleSubcategoryChange}
                              className="h-5 w-5 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                            />
                            <label
                              htmlFor={`subcategory-${subcategory._id}`}
                              className="ml-2 text-gray-700"
                            >
                              {subcategory.name}
                            </label>
                          </div>
                        ))}
                      </div>
                      {formErrors.subcategories && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.subcategories}</p>
                      )}
                    </div>
                  )}
                  
                  {/* Hourly rate */}
                  <div className="mb-6">
                    <label className="block text-gray-700 font-medium mb-2" htmlFor="hourlyRate">
                      Hourly Rate (USD)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <span className="text-gray-500">$</span>
                      </div>
                      <input
                        type="number"
                        id="hourlyRate"
                        name="hourlyRate"
                        min="0"
                        step="0.01"
                        value={formData.hourlyRate || ''}
                        onChange={handleInputChange}
                        className={`w-full pl-8 p-3 border rounded-md ${formErrors.hourlyRate ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="0.00"
                      />
                    </div>
                    {formErrors.hourlyRate && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.hourlyRate}</p>
                    )}
                  </div>
                  
                  {/* Description */}
                  <div className="mb-6">
                    <label className="block text-gray-700 font-medium mb-2" htmlFor="description">
                      Service Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full p-3 border border-gray-300 rounded-md"
                      placeholder="Describe your service offerings and expertise..."
                    />
                  </div>
                  
                  {/* Buttons */}
                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={() => router.push('/provider/dashboard?tab=services')}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors disabled:bg-emerald-300"
                    >
                      {isSubmitting ? 'Creating...' : 'Create Service'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
        
        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default NewServicePage; 