import { useEffect, useRef } from 'react';

export const FloatingIcon = () => {
  const iconRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (iconRef.current) {
        const scrollY = window.scrollY;
        const viewportHeight = window.innerHeight;
        
        // Keep the icon visible by making yOffset relative to viewport
        const yOffset = (viewportHeight * 0.4) + (Math.sin(scrollY * 0.002) * 50);
        
        // More dramatic sine waves for movement
        const xOffset = 
          Math.sin(scrollY * 0.002) * 60 + // Larger primary wave
          Math.sin(scrollY * 0.005) * 30 + // Larger secondary wave
          Math.sin(scrollY * 0.001) * 20;  // Larger slow wave
        
        // More dramatic rotation
        const rotation = scrollY * 0.2 + Math.sin(scrollY * 0.003) * 30;
        
        // More dramatic scale pulsing
        const scale = 1.2 + Math.sin(scrollY * 0.005) * 0.2;
        
        // Color hue rotation for rainbow effect
        const hueRotate = (scrollY * 0.1) % 360;
        
        // Apply all transforms and effects
        iconRef.current.style.transform = `
          translate(${xOffset}px, ${yOffset}px)
          rotate(${rotation}deg)
          scale(${scale})
        `;
        iconRef.current.style.filter = `
          drop-shadow(0 0 20px rgba(255, 0, 0, 0.5))
          drop-shadow(0 0 40px rgba(255, 0, 0, 0.3))
          hue-rotate(${hueRotate}deg)
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
      <div className="relative text-9xl animate-float group">
        <span className="text-red-600 filter brightness-150">♦️</span>
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-4xl font-bold text-white mix-blend-difference">
          J
        </span>
        {/* Add sparkle effects */}
        <div className="absolute -inset-4 animate-sparkle">
          <span className="absolute top-0 left-1/2 -translate-x-1/2 text-yellow-400">✨</span>
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-yellow-400">✨</span>
          <span className="absolute left-0 top-1/2 -translate-y-1/2 text-yellow-400">✨</span>
          <span className="absolute right-0 top-1/2 -translate-y-1/2 text-yellow-400">✨</span>
        </div>
      </div>
    </div>
  );
}; 