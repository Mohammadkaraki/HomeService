// pages/index.tsx
"use client"
import React from 'react';
import Navbar from '../../components/Navbar';
import ServiceCategories from '../../components/ServiceCategories';
import FilterSection from '../../components/FilterSection';
import Footer from '../../components/Footer';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <ServiceCategories />
      <FilterSection />
      <Footer />
    </div>
  );
};

export default HomePage;