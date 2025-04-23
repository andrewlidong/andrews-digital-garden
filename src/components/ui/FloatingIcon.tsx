import { useEffect, useRef } from 'react';
import '../../styles/animations.css';

export function FloatingIcon() {
  const containerRef = useRef<HTMLDivElement>(null);
  const dogRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current || !dogRef.current) return;

      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const maxScroll = documentHeight - windowHeight;
      const scrollProgress = scrollY / maxScroll;

      // Calculate vertical position (follows scroll with slight delay)
      const targetY = scrollY * 0.8; // 0.8 creates a slight lag effect
      const currentY = containerRef.current.offsetTop;
      const newY = currentY + (targetY - currentY) * 0.1; // Smooth interpolation

      // Keep the dog within viewport bounds
      const boundedY = Math.max(0, Math.min(newY, maxScroll));

      // Set position with smooth transition
      containerRef.current.style.transform = `translateY(${boundedY}px)`;

      // Subtle wagging effect based on scroll progress
      const wagAngle = Math.sin(scrollProgress * Math.PI * 2) * 5;
      dogRef.current.style.transform = `rotate(${wagAngle}deg)`;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed right-4 top-0 z-50 transition-transform duration-300 ease-out"
      style={{
        transform: 'translateY(0)',
      }}
    >
      <span
        ref={dogRef}
        className="text-4xl inline-block transition-transform duration-300"
        style={{
          textShadow: '0 0 10px rgba(255, 255, 255, 0.5)',
          filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.3))',
        }}
      >
        🐶
      </span>
    </div>
  );
}