import { useEffect, useRef } from 'react';
import p5 from 'p5';
import "../../styles/animations.css";

export function ShihTzu() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const p5Instance = useRef<p5 | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const sketch = (p: p5) => {
      let x = 0;
      let y = 0;
      let rotation = 0;
      let scale = 1;
      let lastScrollY = 0;
      let tailWag = 0;

      p.setup = () => {
        const canvas = p.createCanvas(300, 300);
        canvas.style('position', 'fixed');
        canvas.style('left', '80px');
        canvas.style('top', '0');
        canvas.style('z-index', '50');
        canvas.parent(canvasRef.current!);
        p.noStroke();
      };

      p.draw = () => {
        // Clear with a semi-transparent background
        p.clear();
        p.background(255, 255, 255, 0);
        
        p.translate(p.width / 2 + x, p.height / 2 + y);
        p.rotate(rotation);
        p.scale(scale);

        // Draw cute shih tzu
        p.fill(255, 240, 200); // Light cream color
        p.ellipse(0, 0, 150, 100); // Body - increased size
        
        // Fluffy head
        p.fill(255, 240, 200);
        p.ellipse(-45, -30, 75, 75); // Main head - increased size
        p.ellipse(-60, -35, 30, 30); // Left ear fluff - increased size
        p.ellipse(-30, -35, 30, 30); // Right ear fluff - increased size
        
        // Face
        p.fill(0);
        p.ellipse(-50, -35, 8, 8); // Left eye - increased size
        p.ellipse(-35, -35, 8, 8); // Right eye - increased size
        p.fill(255, 200, 200); // Pink nose
        p.ellipse(-45, -20, 12, 9); // Nose - increased size
        
        // Smile
        p.noFill();
        p.stroke(0);
        p.strokeWeight(3); // Increased stroke weight
        p.arc(-45, -15, 25, 15, 0, p.PI); // Smile - increased size
        p.noStroke();
        
        // Fluffy tail with wagging animation
        p.fill(255, 240, 200);
        p.push();
        p.translate(60, -15);
        p.rotate(p.sin(tailWag) * 0.5);
        p.ellipse(0, 0, 30, 25);
        p.pop();
        
        // Legs
        p.fill(255, 240, 200);
        p.ellipse(-35, 45, 25, 35); // Front left - increased size
        p.ellipse(35, 45, 25, 35); // Front right - increased size
        p.ellipse(-25, 50, 25, 35); // Back left - increased size
        p.ellipse(25, 50, 25, 35); // Back right - increased size
        
        // Add some fur texture
        p.fill(255, 240, 200, 150);
        for (let i = 0; i < 20; i++) { // Increased number of fur particles
          p.ellipse(
            p.random(-75, 75),
            p.random(-50, 50),
            p.random(8, 15),
            p.random(8, 15)
          );
        }

        // Animate tail wagging
        tailWag += 0.1;
      };

      const handleScroll = () => {
        const scrollY = window.scrollY;
        const scrollDelta = scrollY - lastScrollY;
        const direction = scrollDelta > 0 ? 1 : -1;

        // Calculate viewport dimensions
        const viewportHeight = window.innerHeight;
        
        // Keep the icon visible by making yOffset relative to viewport
        const baseYOffset = viewportHeight * 0.4;
        const yOffset = baseYOffset + (Math.sin(scrollY * 0.002) * 50);
        
        // More dramatic sine waves for movement
        const xOffset = 
          Math.sin(scrollY * 0.002) * 60 + // Larger primary wave
          Math.sin(scrollY * 0.005) * 30 + // Larger secondary wave
          Math.sin(scrollY * 0.001) * 20;  // Larger slow wave

        // Update position
        x = xOffset;
        y = yOffset;

        // Update rotation
        rotation = scrollY * 0.2 + Math.sin(scrollY * 0.003) * 30;

        // Update scale
        const baseScale = 1.2;
        const speedScale = Math.min(Math.abs(scrollDelta) * 0.01, 0.2);
        const directionScale = direction === 1 ? 1.05 : 0.95;
        scale = baseScale + speedScale * directionScale;

        lastScrollY = scrollY;
      };

      window.addEventListener('scroll', handleScroll);
      window.addEventListener('resize', handleScroll);
      handleScroll(); // Initial position

      return () => {
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleScroll);
      };
    };

    p5Instance.current = new p5(sketch);

    return () => {
      if (p5Instance.current) {
        p5Instance.current.remove();
      }
    };
  }, []);

  return (
    <div
      ref={canvasRef}
      className="pointer-events-none fixed left-0 top-0 w-full h-full"
      style={{ zIndex: 50 }}
    />
  );
} 