import axios from 'axios';
import Cookies from 'js-cookie';

// Base URL for API requests
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Log API configuration
console.log('API Configuration:');
console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
console.log('Using API Base URL:', API_BASE_URL);

// Set up axios instance with default headers
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add request interceptor to include auth token in every request
axiosInstance.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to: ${config.baseURL}${config.url}`);
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`Response from ${response.config.url}: Status ${response.status}`);
    return response;
  },
  (error) => {
    console.error('API Error Response:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    }
    return Promise.reject(error);
  }
);

// Define the AuthResponse interface
export interface AuthResponse {
  token: string;
  data: any;
}

// Helper function to get auth headers
const getAuthHeaders = () => {
  let token = localStorage.getItem('token');
  if (!token) {
    const cookieToken = Cookies.get('token');
    token = cookieToken || null;
  }
  console.log('Token found:', token ? 'Yes' : 'No');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Auth endpoints
export const auth = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await axiosInstance.post('/auth/login', { email, password });
      if (response.data.token) {
        Cookies.set('token', response.data.token);
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  register: (userData: any) => 
    axiosInstance.post('/auth/register', userData),
  registerUser: (userData: any) => 
    axiosInstance.post('/users/register', userData),
  registerProvider: (providerData: any) => 
    axiosInstance.post('/providers/register', providerData)
      .then(response => {
        // Store token in cookie
        if (response.data.token) {
          Cookies.set('token', response.data.token);
        }
        return response.data;
      }),
  logout: async () => {
    try {
      // Call the backend logout endpoint
      await axiosInstance.get('/auth/logout', { headers: getAuthHeaders() });
      // Also remove cookie locally
      Cookies.remove('token');
      localStorage.removeItem('token');
      return Promise.resolve();
    } catch (error) {
      console.error('Error during logout:', error);
      // Still remove local tokens even if backend fails
      Cookies.remove('token');
      localStorage.removeItem('token');
      return Promise.resolve();
    }
  },
  getCurrentUser: () => 
    axiosInstance.get('/auth/me'),
  checkAuth: async () => {
    try {
      const response = await axiosInstance.get('/auth/checkauth', { headers: getAuthHeaders() });
      console.log('Auth check response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Auth check error:', error);
      throw error;
    }
  },
  // Add other auth-related endpoints as needed
};

// User endpoints
export const users = {
  getById: (id: string) => 
    axiosInstance.get(`/users/${id}`),
  update: (id: string, userData: any) => 
    axiosInstance.put(`/users/${id}`, userData),
  updatePassword: (id: string, passwordData: { currentPassword: string, newPassword: string }) => 
    axiosInstance.patch(`/users/${id}/password`, passwordData),
  // Add other user-related endpoints as needed
};

// Category endpoints
export const categories = {
  getAll: async () => {
    try {
      const response = await axiosInstance.get('/categories');
      console.log('Categories getAll response:', response.data);
      return response;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },
  getById: async (id: string) => {
    try {
      const response = await axiosInstance.get(`/categories/${id}`);
      console.log(`Category ${id} response:`, response.data);
      return response;
    } catch (error) {
      console.error(`Error fetching category ${id}:`, error);
      throw error;
    }
  },
  getSubcategories: async (categoryId: string) => {
    try {
      const response = await axiosInstance.get(`/categories/${categoryId}/subcategories`);
      console.log(`Subcategories for category ${categoryId} response:`, response.data);
      return response;
    } catch (error) {
      console.error(`Error fetching subcategories for category ${categoryId}:`, error);
      throw error;
    }
  },
  create: (categoryData: any) => 
    axiosInstance.post('/categories', categoryData),
  // Add other category-related endpoints as needed
};

// Provider endpoints
export const providers = {
  getAll: () => 
    axiosInstance.get('/providers'),
  getById: (id: string) => 
    axiosInstance.get(`/providers/${id}`),
  getByFilter: (filterUrl: string) => 
    axiosInstance.get(filterUrl),
  update: (id: string, data: any) =>
    axiosInstance.put('/providers/updatedetails', data, {
      headers: getAuthHeaders()
    }),
  uploadPhoto: (id: string, formData: FormData) =>
    axiosInstance.put('/providers/photo', formData, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'multipart/form-data'
      }
    }),
  getServices: (id: string) =>
    axiosInstance.get(`/providers/${id}/services`),
  // Add other provider-related endpoints as needed
};

// Booking endpoints
export const bookings = {
  getAll: () => 
    axiosInstance.get('/bookings'),
  getById: (id: string) => 
    axiosInstance.get(`/bookings/${id}`),
  getByProviderId: (providerId: string) => {
    // Extract any parameters if they exist
    const [baseId, params] = providerId.split('?');
    
    // Use the correct URL format that matches backend routing: /providers/{id}/bookings
    const url = params 
      ? `/providers/${baseId}/bookings?${params}` 
      : `/providers/${baseId}/bookings`;
    
    console.log(`Fetching bookings for provider using URL: ${url}`);
    
    return axiosInstance.get(url)
      .catch(error => {
        console.error('Error fetching provider bookings:', error);
        // Add more detailed error info
        if (error.response) {
          console.error('Error status:', error.response.status);
          console.error('Error data:', error.response.data);
        } else if (error.request) {
          console.error('No response received for request:', error.request);
        }
        throw error;
      });
  },
  getByUserId: (userId: string) =>
    axiosInstance.get(`/bookings/user/${userId}`),
  create: (bookingData: any) => {
    const providerId = bookingData.provider;
    
    if (!providerId) {
      console.error('Provider ID is missing in booking data');
      return Promise.reject(new Error('Provider ID is required for booking creation'));
    }
    
    // Create a copy of the data without the provider field as it will be in the URL
    const { provider, ...dataToSend } = bookingData;
    
    console.log(`Creating booking for provider: ${providerId}`);
    console.log('Booking data:', JSON.stringify(dataToSend, null, 2));
    
    // Use the correct URL format required by the backend
    return axiosInstance.post(`/providers/${providerId}/bookings`, dataToSend);
  },
  update: (id: string, bookingData: any) => 
    axiosInstance.put(`/bookings/${id}`, bookingData),
  // Add other booking-related endpoints as needed
};

// Reviews endpoints
export const reviews = {
  getByProviderId: (providerId: string) => 
    axiosInstance.get(`/reviews/provider/${providerId}`),
  create: (reviewData: any) => 
    axiosInstance.post('/reviews', reviewData),
  // Add other review-related endpoints as needed
};

// Services endpoints
export const services = {
  getAll: () => 
    axiosInstance.get('/services'),
  getById: (id: string) => 
    axiosInstance.get(`/services/${id}`),
  getByProviderId: (providerId: string) => 
    axiosInstance.get(`/services/provider/${providerId}`),
  create: (serviceData: any) => 
    axiosInstance.post('/services', serviceData),
  updateProviderServices: (providerId: string, servicesData: any) =>
    axiosInstance.put('/providers/updatedetails', { services: servicesData }, {
      headers: getAuthHeaders()
    }),
  // Add other service-related endpoints as needed
};

// Export the axios instance for any custom requests
export default axiosInstance; 