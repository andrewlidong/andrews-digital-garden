import { useEffect, useState, RefObject } from 'react';

// Hook to detect when an element is in view
export function useInView(ref: RefObject<HTMLElement>, options = {}) {
  const [isInView, setIsInView] = useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.1,
        ...options
      }
    );
    
    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }
    
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [ref, options]);
  
  return isInView;
}

// Hook to track scroll progress within a section
export function useScrollProgress(ref: RefObject<HTMLElement>) {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;
      
      const element = ref.current;
      const rect = element.getBoundingClientRect();
      
      // Calculate how far the element is through the viewport
      // 0 = element just entered viewport at bottom
      // 1 = element just exited viewport at top
      const viewportHeight = window.innerHeight;
      const elementTop = rect.top;
      const elementHeight = rect.height;
      
      // Calculate progress (0 to 1)
      let progress = 1 - (elementTop / (viewportHeight - elementHeight));
      
      // Clamp between 0 and 1
      progress = Math.max(0, Math.min(1, progress));
      
      setProgress(progress);
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Call once to set initial value
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [ref]);
  
  return progress;
}

// Utility function to create CSS transform values based on scroll progress
export function getTransformValues(progress: number, options: {
  initialX?: number;
  initialY?: number;
  initialScale?: number;
  initialOpacity?: number;
  finalX?: number;
  finalY?: number;
  finalScale?: number;
  finalOpacity?: number;
}) {
  const {
    initialX = 0,
    initialY = 0,
    initialScale = 1,
    initialOpacity = 0,
    finalX = 0,
    finalY = 0,
    finalScale = 1,
    finalOpacity = 1
  } = options;
  
  const x = initialX + (finalX - initialX) * progress;
  const y = initialY + (finalY - initialY) * progress;
  const scale = initialScale + (finalScale - initialScale) * progress;
  const opacity = initialOpacity + (finalOpacity - initialOpacity) * progress;
  
  return {
    transform: `translate(${x}px, ${y}px) scale(${scale})`,
    opacity
  };
} 