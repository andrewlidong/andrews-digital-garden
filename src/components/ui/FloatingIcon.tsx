import { useEffect, useRef } from 'react';

export const FloatingIcon = () => {
  const iconRef = useRef<HTMLDivElement>(null);
  const dogRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (iconRef.current && dogRef.current) {
        const scrollY = window.scrollY;
        const viewportHeight = window.innerHeight;
        
        // More dynamic vertical movement with bouncing
        const bounce = Math.sin(scrollY * 0.01) * 20;
        const yOffset = (viewportHeight * 0.4) + bounce;
        
        // More playful horizontal movement
        const xOffset = 
          Math.sin(scrollY * 0.002) * 80 + // Primary wave
          Math.sin(scrollY * 0.005) * 40 + // Secondary wave
          Math.sin(scrollY * 0.001) * 20;  // Slow wave
        
        // More dynamic rotation with wagging effect
        const wag = Math.sin(scrollY * 0.02) * 15;
        const rotation = scrollY * 0.1 + wag;
        
        // More dramatic scale pulsing
        const scale = 1.2 + Math.sin(scrollY * 0.005) * 0.3;
        
        // Apply transforms to the container
        iconRef.current.style.transform = `
          translate(${xOffset}px, ${yOffset}px)
          rotate(${rotation}deg)
          scale(${scale})
        `;

        // Add a wagging animation to the dog emoji
        dogRef.current.style.transform = `
          rotate(${Math.sin(scrollY * 0.05) * 10}deg)
          scaleX(${1 + Math.sin(scrollY * 0.1) * 0.1})
        `;
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial position

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div 
      ref={iconRef}
      className="fixed left-20 z-30 transition-all duration-100 ease-out"
      style={{ top: '0' }}
    >
      <div className="relative text-9xl">
        <span 
          ref={dogRef}
          className="text-amber-200 filter brightness-150 inline-block transition-transform duration-200"
        >
          🐶
        </span>
      </div>
    </div>
  );
}; 