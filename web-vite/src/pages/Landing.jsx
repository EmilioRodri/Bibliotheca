import React from 'react';
import LandingNavbar from '../components/layout/LandingNavbar'; 
import HeroSection from '../components/layout/HeroSection';

export default function Landing() {
  return (
    <div className="min-h-screen bg-rich-charcoal flex flex-col">
      <LandingNavbar />
      <HeroSection />
    </div>
  );
}