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
  // The frontmost window gets a brighter border + accent glow.
  isActive?: boolean;
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
  isActive = false,
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
        className={`group/window flex flex-col h-full rounded-lg border overflow-hidden backdrop-blur-xl transition-shadow duration-200 ${
          isActive
            ? "border-[color-mix(in_srgb,var(--term-accent)_55%,transparent)] shadow-[0_16px_50px_-12px_rgba(0,0,0,0.7),0_0_0_1px_color-mix(in_srgb,var(--term-accent)_25%,transparent),0_0_40px_-8px_color-mix(in_srgb,var(--term-accent)_45%,transparent)]"
            : "border-[color-mix(in_srgb,var(--term-fg)_14%,transparent)] shadow-[0_16px_50px_-12px_rgba(0,0,0,0.6)]"
        } bg-[color-mix(in_srgb,var(--term-bg-elevated)_72%,transparent)]`}
      >
        {/* Window header */}
        <div
          className="window-drag-handle flex items-center gap-3 px-3 py-2 border-b border-[color-mix(in_srgb,var(--term-fg)_10%,transparent)] bg-[color-mix(in_srgb,var(--term-bg-inset)_55%,transparent)] text-term-fg"
        >
          {/* Traffic lights — only the red one closes. */}
          <div className="flex items-center gap-2">
            <button
              aria-label="Close window"
              className={`w-3 h-3 rounded-full flex items-center justify-center text-[8px] leading-none text-black/70 ${
                isCloseButtonPressed ? "brightness-75" : ""
              }`}
              style={{ backgroundColor: "#ff5f57" }}
              onMouseDown={() => setIsCloseButtonPressed(true)}
              onMouseUp={() => setIsCloseButtonPressed(false)}
              onMouseLeave={() => setIsCloseButtonPressed(false)}
              onClick={handleClose}
            >
              <span className="opacity-0 group-hover/window:opacity-100 transition-opacity">×</span>
            </button>
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "#febc2e" }} />
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "#28c840" }} />
          </div>
          <div className="flex items-center min-w-0">
            <span className="text-term-green mr-2">$</span>
            <span className="font-mono text-sm truncate">{title}</span>
          </div>
        </div>

        {/* File path breadcrumb */}
        <div className="px-3 py-1 border-b border-[color-mix(in_srgb,var(--term-fg)_8%,transparent)] text-xs font-mono">
          <span className="text-term-accent">andrew@digital-garden</span>
          <span className="text-term-dim">:</span>
          <span className="text-term-green">~/documents/</span>
          <span className="text-term-yellow">{title}</span>
        </div>

        {/* Window content */}
        <div className="flex-grow overflow-hidden text-term-fg">
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
