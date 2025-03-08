import React, { useRef, ReactNode } from 'react';
import { useInView } from '@/utils/scrollAnimation';

interface AnimatedElementProps {
  children: ReactNode;
  className?: string;
  animationVariant?: 'fade-up' | 'fade-in' | 'slide-left' | 'slide-right' | 'zoom-in';
  delay?: number;
  duration?: number;
  threshold?: number;
  once?: boolean;
}

export function AnimatedElement({
  children,
  className = '',
  animationVariant = 'fade-up',
  delay = 0,
  duration = 0.8,
  threshold = 0.1,
  once = true
}: AnimatedElementProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { threshold, once });
  
  // Base styles
  let style: React.CSSProperties = {
    transition: `opacity ${duration}s ease-out ${delay}s, transform ${duration}s ease-out ${delay}s`
  };
  
  // Apply different animation styles based on variant
  switch (animationVariant) {
    case 'fade-up':
      style = {
        ...style,
        opacity: isInView ? 1 : 0,
        transform: isInView ? 'translateY(0)' : 'translateY(30px)'
      };
      break;
      
    case 'fade-in':
      style = {
        ...style,
        opacity: isInView ? 1 : 0
      };
      break;
      
    case 'slide-left':
      style = {
        ...style,
        opacity: isInView ? 1 : 0,
        transform: isInView ? 'translateX(0)' : 'translateX(50px)'
      };
      break;
      
    case 'slide-right':
      style = {
        ...style,
        opacity: isInView ? 1 : 0,
        transform: isInView ? 'translateX(0)' : 'translateX(-50px)'
      };
      break;
      
    case 'zoom-in':
      style = {
        ...style,
        opacity: isInView ? 1 : 0,
        transform: isInView ? 'scale(1)' : 'scale(0.9)'
      };
      break;
      
    default:
      break;
  }
  
  return (
    <div
      ref={ref}
      className={className}
      style={style}
    >
      {children}
    </div>
  );
} 