'use client';
import React, { useState, useEffect } from 'react';
import { categories } from '@/app/utils/api';

interface Service {
  _id: string;
  name: string;
  description?: string;
  categoryId: string;
  subcategories?: string[];
  hourlyRate: number;
}

interface Category {
  _id: string;
  name: string;
  subcategories?: {
    _id: string;
    name: string;
  }[];
}

interface ServiceSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onServiceSelect: (selectedServices: Service[]) => void;
  currentServices?: Service[];
}

const ServiceSelectionModal: React.FC<ServiceSelectionModalProps> = ({
  isOpen,
  onClose,
  onServiceSelect,
  currentServices = []
}) => {
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedServices, setSelectedServices] = useState<Service[]>(currentServices);
  const [hourlyRate, setHourlyRate] = useState<string>('');
  const [subcategorySelections, setSubcategorySelections] = useState<Record<string, boolean>>({});
  
  // Fetch categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await categories.getAll();
        console.log('Categories API response:', response);
        
        // Check if the categories have subcategories
        let categoryData;
        if (response.data?.data && Array.isArray(response.data.data)) {
          categoryData = response.data.data;
          console.log('Categories found in response.data.data');
        } else if (response.data && Array.isArray(response.data)) {
          categoryData = response.data;
          console.log('Categories found directly in response.data');
        } else {
          console.error('Unexpected category data format:', response.data);
          categoryData = [];
        }
        
        console.log('Extracted categories:', categoryData);
        
        // Check if any categories have subcategories
        const hasSubcategories = categoryData.some((cat: any) => 
          cat.subcategories && cat.subcategories.length > 0
        );
        console.log('Categories have subcategories:', hasSubcategories);
        
        if (!hasSubcategories) {
          // If no subcategories exist in the data, try to fetch them for each category
          console.log('Fetching subcategories for each category...');
          const categoriesWithSubcategories = await Promise.all(
            categoryData.map(async (category: any) => {
              try {
                const subResponse = await categories.getSubcategories(category._id);
                console.log(`Subcategories for ${category.name}:`, subResponse.data);
                
                return {
                  ...category,
                  subcategories: subResponse.data?.data || subResponse.data || []
                };
              } catch (err) {
                console.error(`Failed to fetch subcategories for ${category.name}:`, err);
                return category;
              }
            })
          );
          
          setAllCategories(categoriesWithSubcategories);
        } else {
          setAllCategories(categoryData);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);
  
  // Reset subcategory selections when category changes
  useEffect(() => {
    if (selectedCategory) {
      setSubcategorySelections({});
    }
  }, [selectedCategory]);
  
  // Handle category selection with improved debugging
  const handleCategorySelect = (categoryId: string) => {
    console.log('Selected category ID:', categoryId);
    
    const selectedCat = allCategories.find(cat => cat._id === categoryId);
    console.log('Selected category:', selectedCat);
    
    if (selectedCat?.subcategories) {
      console.log('Subcategories available:', selectedCat.subcategories.length);
      console.log('Subcategory details:', selectedCat.subcategories);
    } else {
      console.log('No subcategories found for this category');
      
      // Attempt to fetch subcategories on-demand if not already loaded
      categories.getSubcategories(categoryId)
        .then(response => {
          console.log(`Fetched subcategories for ${categoryId}:`, response.data);
          
          // Update the category with subcategories
          const updatedCategories = allCategories.map(cat => {
            if (cat._id === categoryId) {
              return {
                ...cat,
                subcategories: response.data?.data || response.data || []
              };
            }
            return cat;
          });
          
          setAllCategories(updatedCategories);
        })
        .catch(err => {
          console.error('Failed to fetch subcategories:', err);
        });
    }
    
    setSelectedCategory(categoryId);
    setHourlyRate('');
  };
  
  // Handle subcategory selection
  const handleSubcategorySelect = (subcategoryId: string) => {
    setSubcategorySelections(prev => ({
      ...prev,
      [subcategoryId]: !prev[subcategoryId]
    }));
  };
  
  // Add service to selection
  const handleAddService = () => {
    if (!selectedCategory || !hourlyRate) return;
    
    const category = allCategories.find(cat => cat._id === selectedCategory);
    if (!category) return;
    
    const selectedSubcategories = Object.entries(subcategorySelections)
      .filter(([_, isSelected]) => isSelected)
      .map(([id]) => id);
    
    const newService: Service = {
      _id: Date.now().toString(), // Temporary ID until saved to backend
      name: category.name,
      categoryId: selectedCategory,
      subcategories: selectedSubcategories.length > 0 ? selectedSubcategories : undefined,
      hourlyRate: parseFloat(hourlyRate)
    };
    
    // Check if service with this category already exists
    const existingServiceIndex = selectedServices.findIndex(
      service => service.categoryId === selectedCategory
    );
    
    if (existingServiceIndex >= 0) {
      // Update existing service
      const updatedServices = [...selectedServices];
      updatedServices[existingServiceIndex] = {
        ...updatedServices[existingServiceIndex],
        subcategories: selectedSubcategories.length > 0 ? selectedSubcategories : undefined,
        hourlyRate: parseFloat(hourlyRate)
      };
      setSelectedServices(updatedServices);
    } else {
      // Add new service
      setSelectedServices(prev => [
        ...prev, 
        { 
          ...newService, 
          hourlyRate: parseFloat(hourlyRate)
        }
      ]);
    }
    
    // Reset selection
    setSelectedCategory(null);
    setHourlyRate('');
    setSubcategorySelections({});
  };
  
  // Remove service from selection
  const handleRemoveService = (serviceId: string) => {
    setSelectedServices(prev => prev.filter(service => service._id !== serviceId));
  };
  
  // Handle save
  const handleSave = () => {
    onServiceSelect(selectedServices);
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Add Services</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="overflow-y-auto p-4 max-h-[calc(80vh-8rem)]">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center py-4">
              {error}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Service selection */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-3 text-gray-800">Select Service</h3>
                
                {/* Category selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded"
                    value={selectedCategory || ''}
                    onChange={(e) => handleCategorySelect(e.target.value)}
                  >
                    <option value="">Select a category</option>
                    {allCategories.map(category => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Subcategory selection */}
                {selectedCategory && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subcategories (Optional)</label>
                    <div className="max-h-40 overflow-y-auto border border-gray-300 rounded p-2 bg-white">
                      {(() => {
                        const selectedCategoryObj = allCategories.find(cat => cat._id === selectedCategory);
                        const subcategories = selectedCategoryObj?.subcategories || [];
                        
                        console.log('Rendering subcategories:', subcategories);
                        
                        if (subcategories.length === 0) {
                          return (
                            <div className="text-gray-500 italic py-2 text-center">
                              No subcategories available for this category
                            </div>
                          );
                        }
                        
                        return subcategories.map(sub => (
                          <div key={sub._id} className="flex items-center mb-1">
                            <input
                              type="checkbox"
                              id={sub._id}
                              checked={!!subcategorySelections[sub._id]}
                              onChange={() => handleSubcategorySelect(sub._id)}
                              className="mr-2"
                            />
                            <label htmlFor={sub._id}>{sub.name}</label>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                )}
                
                {/* Hourly rate */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="Your hourly rate"
                  />
                </div>
                
                <button
                  onClick={handleAddService}
                  disabled={!selectedCategory || !hourlyRate}
                  className="bg-emerald-600 text-white py-2 px-4 rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Add Service
                </button>
              </div>
              
              {/* Selected services */}
              <div>
                <h3 className="font-medium mb-3 text-gray-800">Selected Services</h3>
                
                {selectedServices.length === 0 ? (
                  <div className="text-gray-500 italic">No services selected yet</div>
                ) : (
                  <ul className="space-y-2">
                    {selectedServices.map(service => (
                      <li key={service._id} className="bg-white p-3 rounded border border-gray-200 shadow-sm">
                        <div className="flex justify-between">
                          <div className="font-medium">{service.name}</div>
                          <button 
                            onClick={() => handleRemoveService(service._id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                        <div className="text-emerald-600 font-semibold">${service.hourlyRate}/hr</div>
                        {service.subcategories && service.subcategories.length > 0 && (
                          <div className="mt-1 text-sm text-gray-500">
                            <span className="font-medium">Specialties:</span>{' '}
                            {service.subcategories.map(subId => {
                              const category = allCategories.find(c => c._id === service.categoryId);
                              const subcategory = category?.subcategories?.find(s => s._id === subId);
                              return subcategory?.name;
                            }).filter(Boolean).join(', ')}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={selectedServices.length === 0}
            className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Save Services
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceSelectionModal; 