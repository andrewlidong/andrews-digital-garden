import React, { useRef, ReactNode } from 'react';
import { useScrollProgress } from '@/utils/scrollAnimation';

interface ParallaxBackgroundProps {
  children?: ReactNode;
  className?: string;
  speed?: number; // Speed factor for parallax effect (1 = normal, 0.5 = half speed, 2 = double speed)
  direction?: 'up' | 'down' | 'left' | 'right';
}

export function ParallaxBackground({
  children,
  className = '',
  speed = 0.5,
  direction = 'up'
}: ParallaxBackgroundProps) {
  const ref = useRef<HTMLDivElement>(null);
  const progress = useScrollProgress(ref);
  
  // Calculate transform based on direction and progress
  let transform = '';
  const moveAmount = progress * 100 * speed;
  
  switch (direction) {
    case 'up':
      transform = `translateY(${moveAmount}px)`;
      break;
    case 'down':
      transform = `translateY(-${moveAmount}px)`;
      break;
    case 'left':
      transform = `translateX(${moveAmount}px)`;
      break;
    case 'right':
      transform = `translateX(-${moveAmount}px)`;
      break;
  }
  
  return (
    <div
      ref={ref}
      className={`absolute inset-0 overflow-hidden ${className}`}
      style={{ zIndex: -1 }}
    >
      <div
        className="absolute inset-0 w-full h-full"
        style={{ transform }}
      >
        {children}
      </div>
    </div>
  );
} 