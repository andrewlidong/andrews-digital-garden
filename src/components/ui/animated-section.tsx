import React, { useRef, ReactNode, forwardRef, ForwardedRef } from 'react';
import { useInView, useScrollProgress } from '@/utils/scrollAnimation';

interface AnimatedSectionProps {
  id: string;
  children: ReactNode;
  className?: string;
  animationVariant?: 'fade-up' | 'fade-in' | 'slide-left' | 'slide-right' | 'zoom-in' | 'parallax';
  delay?: number;
  threshold?: number;
}

const AnimatedSection = forwardRef<HTMLElement, AnimatedSectionProps>(
  ({ id, children, className = '', animationVariant = 'fade-up', delay = 0, threshold = 0.1 }, ref) => {
    const innerRef = useRef<HTMLElement>(null);
    const sectionRef = (ref || innerRef) as React.RefObject<HTMLElement>;
    
    const isInView = useInView(sectionRef, { threshold });
    const progress = useScrollProgress(sectionRef);
    
    // Base animation classes
    let animationClass = '';
    let style: React.CSSProperties = {};
    
    // Apply different animation styles based on variant
    switch (animationVariant) {
      case 'fade-up':
        style = {
          opacity: isInView ? 1 : 0,
          transform: isInView ? 'translateY(0)' : 'translateY(50px)',
          transition: `opacity 0.8s ease-out ${delay}s, transform 0.8s ease-out ${delay}s`
        };
        break;
        
      case 'fade-in':
        style = {
          opacity: isInView ? 1 : 0,
          transition: `opacity 0.8s ease-out ${delay}s`
        };
        break;
        
      case 'slide-left':
        style = {
          opacity: isInView ? 1 : 0,
          transform: isInView ? 'translateX(0)' : 'translateX(100px)',
          transition: `opacity 0.8s ease-out ${delay}s, transform 0.8s ease-out ${delay}s`
        };
        break;
        
      case 'slide-right':
        style = {
          opacity: isInView ? 1 : 0,
          transform: isInView ? 'translateX(0)' : 'translateX(-100px)',
          transition: `opacity 0.8s ease-out ${delay}s, transform 0.8s ease-out ${delay}s`
        };
        break;
        
      case 'zoom-in':
        style = {
          opacity: isInView ? 1 : 0,
          transform: isInView ? 'scale(1)' : 'scale(0.8)',
          transition: `opacity 0.8s ease-out ${delay}s, transform 0.8s ease-out ${delay}s`
        };
        break;
        
      case 'parallax':
        // Parallax effect based on scroll progress
        style = {
          transform: `translateY(${(0.5 - progress) * 100}px)`,
          opacity: Math.min(1, progress * 2)
        };
        break;
        
      default:
        break;
    }
    
    return (
      <section
        id={id}
        ref={sectionRef as ForwardedRef<HTMLElement>}
        className={`min-h-screen ${className}`}
        style={style}
      >
        {children}
      </section>
    );
  }
);

AnimatedSection.displayName = 'AnimatedSection';

export { AnimatedSection }; 