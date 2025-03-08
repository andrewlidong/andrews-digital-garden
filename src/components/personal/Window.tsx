import React, { useState, useEffect, useRef } from "react";
import { Rnd } from "react-rnd";
import ClassicScrollbar from "./Scrollbar";

interface WindowProps {
  title: string;
  initialPosition: { x: number; y: number };
  width?: number;
  height?: number;
  zIndex: number;
  onFocus: () => void;
  onClose: () => void;
  children: React.ReactNode;
  sourceElementId?: string; // Optional: ID of element that triggered window open
}

export const Window: React.FC<WindowProps> = ({
  title,
  width = 600,
  height = 450,
  initialPosition,
  zIndex,
  onFocus,
  onClose,
  children,
  sourceElementId,
}) => {
  const [size, setSize] = useState({ width, height });
  const [isCloseButtonPressed, setIsCloseButtonPressed] = useState(false);
  const [showOutline, setShowOutline] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [animationStyle, setAnimationStyle] = useState({});
  const windowRef = useRef<Rnd>(null);
  const animationTimersRef = useRef<number[]>([]);

  // Helper to clear all animation timers
  const clearAllTimers = () => {
    animationTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    animationTimersRef.current = [];
  };

  // Helper to add a timer to the tracking array
  const addTimer = (timer: number) => {
    animationTimersRef.current.push(timer);
    return timer;
  };

  useEffect(() => {
    // Start the open animation
    const sourceElement = sourceElementId
      ? document.getElementById(sourceElementId)
      : null;

    let startRect;

    if (sourceElement) {
      // Animation starts from source element (file or folder)
      // Use getBoundingClientRect and adjust for scroll position to ensure mobile compatibility
      const rect = sourceElement.getBoundingClientRect();
      startRect = {
        left: rect.left + window.scrollX,
        top: rect.top + window.scrollY,
        width: rect.width,
        height: rect.height,
      };
    } else {
      // Default animation starts from a small centered point
      startRect = {
        left: window.innerWidth / 2 - 30,
        top: window.innerHeight / 2 - 30,
        width: 60,
        height: 60,
      };
    }

    // Calculate final position
    const finalRect = {
      left: initialPosition.x,
      top: initialPosition.y,
      width: width,
      height: height,
    };

    // Calculate the center points for both
    const startCenter = {
      x: startRect.left + startRect.width / 2,
      y: startRect.top + startRect.height / 2,
    };

    const finalCenter = {
      x: finalRect.left + finalRect.width / 2,
      y: finalRect.top + finalRect.height / 2,
    };

    // Calculate translation needed
    const translateX = finalCenter.x - startCenter.x;
    const translateY = finalCenter.y - startCenter.y;

    // Clear any existing timers
    clearAllTimers();

    // Set initial style to match the source
    setAnimationStyle({
      position: "fixed",
      left: `${startRect.left}px`,
      top: `${startRect.top}px`,
      width: `${startRect.width}px`,
      height: `${startRect.height}px`,
      transform: "none",
      transition: "none",
      pointerEvents: "none",
    });

    // Start the animation sequence
    const animationFrame = requestAnimationFrame(() => {
      // First phase: Move to center position
      setAnimationStyle({
        position: "fixed",
        left: `${startRect.left}px`,
        top: `${startRect.top}px`,
        width: `${startRect.width}px`,
        height: `${startRect.height}px`,
        transform: `translate(${translateX}px, ${translateY}px)`,
        transition: "transform 200ms cubic-bezier(0.3, 0, 0.2, 1)",
        zIndex: zIndex,
        pointerEvents: "none",
      });

      // Second phase: Expand to final size
      addTimer(
        window.setTimeout(() => {
          setAnimationStyle({
            position: "fixed",
            left: `${finalRect.left}px`,
            top: `${finalRect.top}px`,
            width: `${finalRect.width}px`,
            height: `${finalRect.height}px`,
            transform: "none",
            transition: "all 300ms cubic-bezier(0.2, 0, 0.2, 1)",
            zIndex: zIndex,
            pointerEvents: "none",
          });

          // Final phase: Show actual window content
          addTimer(
            window.setTimeout(() => {
              setShowOutline(false);
              setShowContent(true);
            }, 300)
          );
        }, 200)
      );
    });

    return () => {
      // Cleanup timers to prevent memory leaks
      cancelAnimationFrame(animationFrame);
      clearAllTimers();
    };
  }, [initialPosition, width, height, zIndex, sourceElementId]);

  // Close animation
  const handleClose = () => {
    // Get current position of window for animation
    if (!windowRef.current) {
      onClose();
      return;
    }

    const rndElement = windowRef.current.resizableElement.current;
    if (!rndElement) {
      onClose();
      return;
    }

    const currentRect = rndElement.getBoundingClientRect();

    // Adjust for scroll position
    const adjustedCurrentRect = {
      left: currentRect.left + window.scrollX,
      top: currentRect.top + window.scrollY,
      width: currentRect.width,
      height: currentRect.height,
    };

    // Find the source element if it exists
    const sourceElement = sourceElementId
      ? document.getElementById(sourceElementId)
      : null;

    if (!sourceElement) {
      // No source element, just close
      onClose();
      return;
    }

    const targetRectRaw = sourceElement.getBoundingClientRect();
    // Adjust for scroll position
    const targetRect = {
      left: targetRectRaw.left + window.scrollX,
      top: targetRectRaw.top + window.scrollY,
      width: targetRectRaw.width,
      height: targetRectRaw.height,
    };

    // Clear any existing timers
    clearAllTimers();

    // Create a temporary div for the animation
    const animationDiv = document.createElement("div");
    animationDiv.className = "fixed border-2 border-black bg-transparent";
    animationDiv.style.position = "fixed";
    animationDiv.style.left = `${adjustedCurrentRect.left}px`;
    animationDiv.style.top = `${adjustedCurrentRect.top}px`;
    animationDiv.style.width = `${adjustedCurrentRect.width}px`;
    animationDiv.style.height = `${adjustedCurrentRect.height}px`;
    animationDiv.style.zIndex = `${zIndex}`;
    animationDiv.style.pointerEvents = "none";
    document.body.appendChild(animationDiv);

    // Hide the actual window immediately
    setShowContent(false);
    setShowOutline(false);

    // Calculate position to shrink while maintaining center position
    const centerOffsetX = (adjustedCurrentRect.width - targetRect.width) / 2;
    const centerOffsetY = (adjustedCurrentRect.height - targetRect.height) / 2;

    // Use direct DOM manipulation for the animation
    // First phase: Shrink in place
    requestAnimationFrame(() => {
      // Force reflow
      void animationDiv.offsetHeight;

      // Apply transition
      animationDiv.style.transition = "all 250ms cubic-bezier(0.2, 0, 0.2, 1)";
      animationDiv.style.left = `${adjustedCurrentRect.left + centerOffsetX}px`;
      animationDiv.style.top = `${adjustedCurrentRect.top + centerOffsetY}px`;
      animationDiv.style.width = `${targetRect.width}px`;
      animationDiv.style.height = `${targetRect.height}px`;

      // Second phase: Move to target position
      setTimeout(() => {
        animationDiv.style.transition =
          "all 180ms cubic-bezier(0.3, 0, 0.2, 1)";
        animationDiv.style.left = `${targetRect.left}px`;
        animationDiv.style.top = `${targetRect.top}px`;

        // Remove the animation div and complete close
        setTimeout(() => {
          document.body.removeChild(animationDiv);
          onClose();
        }, 200);
      }, 250);
    });
  };

  // Render the actual window content
  return (
    <>
      {/* Animated outline for opening/closing effects */}
      {showOutline && (
        <div
          className="fixed border-2 border-gray-700 bg-transparent"
          style={animationStyle as React.CSSProperties}
        />
      )}

      {/* Actual window content */}
      {showContent && (
        <Rnd
          ref={windowRef}
          default={{
            x: initialPosition.x,
            y: initialPosition.y,
            width: size.width,
            height: size.height,
          }}
          style={{
            zIndex,
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
            className={`flex flex-col h-full border border-gray-700 bg-gray-800 shadow-lg overflow-hidden`}
          >
            {/* Window header */}
            <div
              className="window-drag-handle flex items-center justify-between px-3 py-2 bg-gray-900 border-b border-gray-700 text-white"
            >
              <div className="flex items-center">
                <span className="text-green-500 mr-2">$</span>
                <span className="font-mono text-sm">{title}</span>
              </div>
              <button
                className={`w-5 h-5 flex items-center justify-center rounded-full ${
                  isCloseButtonPressed ? "bg-red-700" : "bg-red-500"
                } text-white text-xs`}
                onMouseDown={() => setIsCloseButtonPressed(true)}
                onMouseUp={() => setIsCloseButtonPressed(false)}
                onMouseLeave={() => setIsCloseButtonPressed(false)}
                onClick={handleClose}
              >
                ×
              </button>
            </div>

            {/* Window content */}
            <div className="flex-grow overflow-hidden bg-gray-900 text-white">
              <ClassicScrollbar>
                <div className="p-4 font-mono">{children}</div>
              </ClassicScrollbar>
            </div>
          </div>
        </Rnd>
      )}
    </>
  );
};
