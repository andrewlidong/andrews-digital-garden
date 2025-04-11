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
        
        // Apply all transforms and effects
        iconRef.current.style.transform = `
          translate(${xOffset}px, ${yOffset}px)
          rotate(${rotation}deg)
          scale(${scale})
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
        <span className="text-amber-200 filter brightness-150">🐶</span>
      </div>
    </div>
  );
}; 