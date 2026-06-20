import React, { useState, useEffect, useRef } from "react";
import { Rnd } from "react-rnd";
import ClassicScrollbar from "./Scrollbar";

interface WindowProps {
  id: string;
  title: string;
  initialPosition?: { x: number; y: number };
  width?: number;
  height?: number;
  zIndex: number;
  onFocus: () => void;
  onClose: () => void;
  children: React.ReactNode;
  sourceElementId?: string;
}

export const Window: React.FC<WindowProps> = ({
  id,
  title,
  width = 600,
  height = 450,
  initialPosition,
  zIndex,
  onFocus,
  onClose,
  children,
}) => {
  const [size, setSize] = useState({ width, height });
  const [isCloseButtonPressed, setIsCloseButtonPressed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const windowRef = useRef<Rnd>(null);

  // Calculate initial position if not provided
  const getInitialPosition = () => {
    if (initialPosition) return initialPosition;
    
    // For terminal, position it in the center bottom
    if (id === 'terminal') {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      return {
        x: (windowWidth - width) / 2,
        y: (windowHeight - height) / 2,
      };
    }
    
    // Default position with slight randomization for other windows
    return {
      x: Math.max(50, Math.min(window.innerWidth - 400, 100 + Math.random() * 100)),
      y: Math.max(50, Math.min(window.innerHeight - 300, 100 + Math.random() * 100)),
    };
  };

  // Simple fade-in animation
  useEffect(() => {
    // Short delay to allow for DOM updates
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);
    
    return () => clearTimeout(timer);
  }, []);

  // Handle close with simple fade-out
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 200); // Short delay for animation
  };

  // Adjust size for terminal
  useEffect(() => {
    if (id === 'terminal') {
      setSize({
        width: Math.min(800, window.innerWidth * 0.8),
        height: Math.min(500, window.innerHeight * 0.6),
      });
    }
  }, [id]);

  // Render the window with simple fade animation
  return (
    <Rnd
      ref={windowRef}
      default={{
        ...getInitialPosition(),
        width: size.width,
        height: size.height,
      }}
      style={{
        zIndex,
        opacity: isVisible ? 1 : 0,
        transition: "opacity 200ms ease-in-out",
      }}
      onMouseDown={onFocus}
      dragHandleClassName="window-drag-handle"
      bounds="parent"
      minWidth={300}
      minHeight={200}
      onResize={(e, direction, ref) => {
        setSize({
          width: parseInt(ref.style.width),
          height: parseInt(ref.style.height),
        });
      }}
    >
      <div
        className={`flex flex-col h-full border border-term-border bg-term-elevated shadow-lg overflow-hidden`}
      >
        {/* Window header */}
        <div
          className="window-drag-handle flex items-center justify-between px-3 py-2 bg-term-inset border-b border-term-border text-term-fg"
        >
          <div className="flex items-center">
            <span className="text-term-green mr-2">$</span>
            <span className="font-mono text-sm">{title}</span>
          </div>
          <button
            className={`w-5 h-5 flex items-center justify-center rounded-full ${
              isCloseButtonPressed ? "opacity-70" : ""
            } bg-term-red text-term-inset text-xs`}
            onMouseDown={() => setIsCloseButtonPressed(true)}
            onMouseUp={() => setIsCloseButtonPressed(false)}
            onMouseLeave={() => setIsCloseButtonPressed(false)}
            onClick={handleClose}
          >
            ×
          </button>
        </div>

        {/* File path breadcrumb */}
        <div className="bg-term-elevated px-3 py-1 border-b border-term-border text-xs font-mono">
          <span className="text-term-accent">andrew@digital-garden</span>
          <span className="text-term-dim">:</span>
          <span className="text-term-green">~/documents/</span>
          <span className="text-term-yellow">{title}</span>
        </div>

        {/* Window content */}
        <div className="flex-grow overflow-hidden bg-term-bg text-term-fg">
          {id === 'terminal' ? (
            <div className="h-full">{children}</div>
          ) : (
            <ClassicScrollbar alwaysShow={true}>
              <div className="p-4 font-mono h-full">{children}</div>
            </ClassicScrollbar>
          )}
        </div>
      </div>
    </Rnd>
  );
};
