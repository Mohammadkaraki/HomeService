"use client"
import React from 'react';
import Navbar from '../../components/Navbar';
import CleaningServicesGrid from '../../components/CleaningServicesGrid';
import Footer from '../../components/Footer';

export default function SelectPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="py-8">
        <CleaningServicesGrid />
      </main>
      <Footer />
    </div>
  );
}