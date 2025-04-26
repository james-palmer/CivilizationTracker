import { useState, useEffect, useRef } from 'react';

// Define the background images with mobile-optimized versions
interface BackgroundImage {
  desktop: string;
  mobile: string;
  name: string;
}

const backgroundImages: BackgroundImage[] = [
  {
    desktop: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
    mobile: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=70',
    name: 'Rome Colosseum'
  },
  {
    desktop: 'https://images.unsplash.com/photo-1608037521244-f7b6d493fa31?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
    mobile: 'https://images.unsplash.com/photo-1608037521244-f7b6d493fa31?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=70',
    name: 'Parthenon'
  },
  {
    desktop: 'https://images.unsplash.com/photo-1598971861713-54ad16a7e72e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
    mobile: 'https://images.unsplash.com/photo-1598971861713-54ad16a7e72e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=70',
    name: 'Egyptian Pyramids'
  },
  {
    desktop: 'https://images.unsplash.com/photo-1547922657-b370d1687ebb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
    mobile: 'https://images.unsplash.com/photo-1547922657-b370d1687ebb?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=70',
    name: 'Great Wall of China'
  },
  {
    desktop: 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
    mobile: 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=70',
    name: 'Machu Picchu'
  },
];

interface BackgroundSlideshowProps {
  children: React.ReactNode;
}

export default function BackgroundSlideshow({ children }: BackgroundSlideshowProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [nextImageIndex, setNextImageIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const imagesLoadedRef = useRef<Set<number>>(new Set([0, 1]));
  
  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Check initially
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    
    // Clean up
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Preload images
  useEffect(() => {
    // Preload the next few images
    const preloadImages = () => {
      // Determine which images to preload (current, next, and a few more)
      const imagesToPreload = [];
      for (let i = 0; i < 3; i++) {
        const index = (currentImageIndex + i) % backgroundImages.length;
        if (!imagesLoadedRef.current.has(index)) {
          imagesToPreload.push(index);
          imagesLoadedRef.current.add(index);
        }
      }
      
      // Create image objects to trigger browser loading
      imagesToPreload.forEach(index => {
        const img = new Image();
        img.src = isMobile 
          ? backgroundImages[index].mobile 
          : backgroundImages[index].desktop;
      });
    };
    
    preloadImages();
  }, [currentImageIndex, isMobile]);
  
  // Slideshow interval
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
        className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`} 
        style={{ 
          backgroundImage: `url(${isMobile 
            ? backgroundImages[currentImageIndex].mobile 
            : backgroundImages[currentImageIndex].desktop
          })`,
          zIndex: -2
        }}
        aria-hidden="true"
      />
      
      {/* Next background image (preloaded) */}
      <div 
        className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ${isTransitioning ? 'opacity-100' : 'opacity-0'}`} 
        style={{ 
          backgroundImage: `url(${isMobile 
            ? backgroundImages[nextImageIndex].mobile 
            : backgroundImages[nextImageIndex].desktop
          })`,
          zIndex: -2
        }}
        aria-hidden="true"
      />
      
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-[#0F172A] bg-opacity-80"
        style={{ zIndex: -1 }}
        aria-hidden="true"
      />
      
      {/* Content */}
      <div className="relative min-h-screen flex flex-col">
        {children}
      </div>
    </div>
  );
}