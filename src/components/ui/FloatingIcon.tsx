import { useEffect, useRef } from 'react';

export const FloatingIcon = () => {
  const iconRef = useRef<HTMLDivElement>(null);
  const dogRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (iconRef.current && dogRef.current) {
        const scrollY = window.scrollY;
        const viewportHeight = window.innerHeight;
        
        // More erratic vertical movement
        const bounce = Math.sin(scrollY * 0.02) * 30 + Math.cos(scrollY * 0.03) * 20;
        const yOffset = (viewportHeight * 0.4) + bounce;
        
        // More chaotic horizontal movement
        const xOffset = 
          Math.sin(scrollY * 0.003) * 100 + // Primary wave
          Math.cos(scrollY * 0.007) * 50 +  // Secondary wave
          Math.sin(scrollY * 0.001) * 30;   // Slow wave
        
        // More unpredictable rotation
        const wag = Math.sin(scrollY * 0.03) * 30 + Math.cos(scrollY * 0.05) * 20;
        const rotation = scrollY * 0.2 + wag;
        
        // More dramatic scale changes
        const scale = 1.3 + Math.sin(scrollY * 0.01) * 0.4;
        
        // Apply transforms to the container
        iconRef.current.style.transform = `
          translate(${xOffset}px, ${yOffset}px)
          rotate(${rotation}deg)
          scale(${scale})
        `;

        // Add a more erratic wagging animation
        dogRef.current.style.transform = `
          rotate(${Math.sin(scrollY * 0.08) * 20}deg)
          scaleX(${1 + Math.sin(scrollY * 0.15) * 0.2})
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
      className="pointer-events-none fixed left-20 z-30 transition-all duration-75 ease-out"
      style={{ top: '0' }}
    >
      <div className="relative text-5xl">
        <span 
          ref={dogRef}
          className="text-red-500 filter brightness-150 drop-shadow-[0_0_8px_rgba(255,0,0,0.5)] inline-block transition-transform duration-100"
        >
          🐶
        </span>
      </div>
    </div>
  );
}; 