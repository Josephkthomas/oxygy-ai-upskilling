import React, { useState, useEffect } from 'react';
import { cn } from '../utils/cn';

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      scrolled ? "bg-white/95 backdrop-blur-sm shadow-sm py-4" : "bg-transparent py-6"
    )}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollToSection('hero')}>
          {/* Oxygy Logo Placeholder - Geometric Style */}
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 bg-navy-900 clip-path-polygon"></div>
            <span className="font-bold text-2xl tracking-tighter text-navy-900">OXYGY</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <button onClick={() => scrollToSection('journey')} className="text-navy-800 hover:text-teal font-medium text-sm transition-colors">The Journey</button>
          <button onClick={() => scrollToSection('level-1')} className="text-navy-800 hover:text-teal font-medium text-sm transition-colors">Fundamentals</button>
          <button onClick={() => scrollToSection('level-3')} className="text-navy-800 hover:text-teal font-medium text-sm transition-colors">Integration</button>
          <button onClick={() => scrollToSection('level-5')} className="text-navy-800 hover:text-teal font-medium text-sm transition-colors">Full Apps</button>
        </div>

        <button 
          onClick={() => scrollToSection('footer')}
          className="bg-teal hover:bg-teal-dark text-white px-6 py-2 rounded-full font-medium text-sm transition-colors"
        >
          Get in Touch
        </button>
      </div>
    </nav>
  );
};
