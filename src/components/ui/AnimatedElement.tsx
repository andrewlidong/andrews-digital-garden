import React, { useRef, ReactNode } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import '../../styles/animations.css';

interface AnimatedElementProps {
  children: ReactNode;
  animation: 'fade-up' | 'fade-in' | 'slide-left' | 'slide-right' | 'scale-up' | 'none';
  className?: string;
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
  delay?: number;
}

export function AnimatedElement({
  children,
  animation = 'fade-up',
  className = '',
  threshold = 0.1,
  rootMargin = '0px',
  once = true,
  delay = 0
}: AnimatedElementProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useIntersectionObserver(ref, { threshold, rootMargin, once });
  
  // Combine animation classes
  const animationClass = animation !== 'none' ? `animate-on-scroll ${animation}` : '';
  const visibleClass = isInView ? 'is-visible' : '';
  
  // Apply delay if specified
  const style = delay ? { transitionDelay: `${delay}ms` } : {};
  
  return (
    <div 
      ref={ref}
      className={`${animationClass} ${visibleClass} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
} 