import React from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { LevelJourney } from './components/LevelJourney';
import { Departments, LearningModel } from './components/Extras';
import { Footer } from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-white font-sans text-navy-900 selection:bg-teal selection:text-white">
      <Navbar />
      <Hero />
      <LevelJourney />
      <Departments />
      <LearningModel />
      <Footer />
    </div>
  );
}

export default App;