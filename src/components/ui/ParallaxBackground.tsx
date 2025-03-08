import React, { useRef, useEffect, useState, ReactNode } from 'react';
import '../../styles/animations.css';

interface ParallaxBackgroundProps {
  children: ReactNode;
  className?: string;
  speed?: number; // Speed factor: 1 = normal, 0.5 = half speed, 2 = double speed
  direction?: 'up' | 'down' | 'left' | 'right';
}

export function ParallaxBackground({
  children,
  className = '',
  speed = 0.2,
  direction = 'up'
}: ParallaxBackgroundProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;
      
      // Get the element's position relative to the viewport
      const rect = ref.current.getBoundingClientRect();
      const elementTop = rect.top;
      const windowHeight = window.innerHeight;
      
      // Calculate how far the element is from the center of the viewport
      // Normalized to a value between -1 and 1
      const viewportCenter = windowHeight / 2;
      const distanceFromCenter = (elementTop - viewportCenter) / viewportCenter;
      
      // Set the offset based on the distance and speed
      setOffset(distanceFromCenter * speed * 100); // Multiply by 100 for pixels
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Call once to set initial value
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  // Calculate transform based on direction
  let transform = '';
  switch (direction) {
    case 'up':
      transform = `translateY(${offset}px)`;
      break;
    case 'down':
      transform = `translateY(${-offset}px)`;
      break;
    case 'left':
      transform = `translateX(${offset}px)`;
      break;
    case 'right':
      transform = `translateX(${-offset}px)`;
      break;
    default:
      transform = `translateY(${offset}px)`;
  }

  return (
    <div 
      ref={ref}
      className={`parallax-bg ${className}`}
      style={{ transform }}
    >
      {children}
    </div>
  );
} 