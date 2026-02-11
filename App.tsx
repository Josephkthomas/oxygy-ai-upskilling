import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { LevelJourney } from './components/LevelJourney';
import { Departments, LearningModel } from './components/Extras';
import { Footer } from './components/Footer';
import { PromptPlayground } from './components/PromptPlayground';

type Page = 'home' | 'playground';

function getPageFromHash(): Page {
  return window.location.hash === '#playground' ? 'playground' : 'home';
}

function App() {
  const [currentPage, setCurrentPage] = useState<Page>(getPageFromHash);

  useEffect(() => {
    const handleHashChange = () => {
      const page = getPageFromHash();
      setCurrentPage(page);
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans text-navy-900 selection:bg-teal selection:text-white">
      {currentPage === 'home' ? (
        <>
          <Navbar />
          <Hero />
          <LevelJourney />
          <Departments />
          <LearningModel />
          <Footer />
        </>
      ) : (
        <>
          <Navbar />
          <PromptPlayground />
        </>
      )}
    </div>
  );
}

export default App;
