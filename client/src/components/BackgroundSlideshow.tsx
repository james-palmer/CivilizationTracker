import { useState, useEffect } from 'react';

// Define the background images
const backgroundImages = [
  'https://images.unsplash.com/photo-1552832230-c0197dd311b5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80', // Rome Colosseum
  'https://images.unsplash.com/photo-1608037521244-f7b6d493fa31?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80', // Parthenon
  'https://images.unsplash.com/photo-1598971861713-54ad16a7e72e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80', // Egyptian pyramids
  'https://images.unsplash.com/photo-1547922657-b370d1687ebb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80', // Great Wall of China
  'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80', // Machu Picchu
];

interface BackgroundSlideshowProps {
  children: React.ReactNode;
}

export default function BackgroundSlideshow({ children }: BackgroundSlideshowProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [nextImageIndex, setNextImageIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  useEffect(() => {
    const interval = setInterval(() => {
      // Start transition
      setIsTransitioning(true);
      
      // After transition duration, update indices
      setTimeout(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
        setNextImageIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
        setIsTransitioning(false);
      }, 1000); // Should match the CSS transition duration
      
    }, 10000); // Change image every 10 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="relative min-h-screen">
      {/* Current background image */}
      <div 
        className={`absolute inset-0 bg-cover bg-center bg-fixed transition-opacity duration-1000 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`} 
        style={{ 
          backgroundImage: `url(${backgroundImages[currentImageIndex]})`,
          zIndex: -2
        }}
      />
      
      {/* Next background image (preloaded) */}
      <div 
        className={`absolute inset-0 bg-cover bg-center bg-fixed transition-opacity duration-1000 ${isTransitioning ? 'opacity-100' : 'opacity-0'}`} 
        style={{ 
          backgroundImage: `url(${backgroundImages[nextImageIndex]})`,
          zIndex: -2
        }}
      />
      
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-[#0F172A] bg-opacity-80"
        style={{ zIndex: -1 }}
      />
      
      {/* Content */}
      <div className="relative min-h-screen flex flex-col">
        {children}
      </div>
    </div>
  );
}