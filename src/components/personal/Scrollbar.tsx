import React, { useState, useEffect, useRef, useCallback } from "react";

interface ClassicScrollbarProps {
  children: React.ReactNode;
}

interface ScrollState {
  isOverflowing: boolean;
  scrollPosition: number;
}

export default function ClassicScrollbar({ children }: ClassicScrollbarProps) {
  const [scrollState, setScrollState] = useState<ScrollState>({
    isOverflowing: false,
    scrollPosition: 0,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const dragStart = useRef({ y: 0, scrollTop: 0 });

  const contentRef = useRef<HTMLDivElement>(null);
  const scrollTrackRef = useRef<HTMLDivElement>(null);
  const scrollThumbRef = useRef<HTMLDivElement>(null);

  // Check if device supports touch
  useEffect(() => {
    setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  const checkOverflow = useCallback((): void => {
    const content = contentRef.current;
    if (!content) return;

    const hasOverflow = content.scrollHeight > content.clientHeight;
    setScrollState((prev) => ({
      ...prev,
      isOverflowing: hasOverflow,
    }));
  }, []);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(checkOverflow);
    if (contentRef.current) {
      resizeObserver.observe(contentRef.current);
    }
    return () => resizeObserver.disconnect();
  }, [checkOverflow]);

  const handleScroll = useCallback((): void => {
    const content = contentRef.current;
    const track = scrollTrackRef.current;
    const thumb = scrollThumbRef.current;
    if (!content || !track || !thumb) return;

    const trackHeight = track.clientHeight;
    const thumbHeight = thumb.offsetHeight;
    const availableSpace = trackHeight - thumbHeight;

    const scrollPercentage =
      content.scrollTop / (content.scrollHeight - content.clientHeight);
    const thumbPosition = scrollPercentage * availableSpace;

    setScrollState((prev) => ({
      ...prev,
      scrollPosition: thumbPosition,
    }));
  }, []);

  const handleTouchStart = useCallback((): void => {
    const content = contentRef.current;
    if (!content) return;

    // Allow native touch scrolling
    content.style.overflowY = "auto";
  }, []);

  const handleTouchEnd = useCallback((): void => {
    const content = contentRef.current;
    if (!content) return;

    // Restore overflow behavior
    content.style.overflowY = "hidden";
  }, []);

  const handleDragStart = useCallback(
    (e: React.PointerEvent): void => {
      if (isTouchDevice) return; // Disable drag on touch devices
      e.preventDefault();
      setIsDragging(true);
      dragStart.current = {
        y: e.clientY,
        scrollTop: contentRef.current?.scrollTop || 0,
      };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [isTouchDevice]
  );

  const handleDragMove = useCallback(
    (e: React.PointerEvent): void => {
      if (!isDragging || isTouchDevice) return;

      const content = contentRef.current;
      const track = scrollTrackRef.current;
      const thumb = scrollThumbRef.current;
      if (!content || !track || !thumb) return;

      const deltaY = e.clientY - dragStart.current.y;
      const trackHeight = track.clientHeight - thumb.offsetHeight;
      const scrollRange = content.scrollHeight - content.clientHeight;

      const newThumbPosition = Math.max(
        0,
        Math.min(
          trackHeight,
          (deltaY / trackHeight) * scrollRange + dragStart.current.scrollTop
        )
      );

      const scrollPercentage = newThumbPosition / trackHeight;
      content.scrollTop = scrollPercentage * scrollRange;
    },
    [isDragging, isTouchDevice]
  );

  const handleDragEnd = useCallback(
    (e: React.PointerEvent): void => {
      if (!isDragging || isTouchDevice) return;
      setIsDragging(false);
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    },
    [isDragging, isTouchDevice]
  );

  const handleArrowClick = useCallback((direction: "up" | "down"): void => {
    const content = contentRef.current;
    if (!content) return;

    const scrollAmount = direction === "up" ? -20 : 20;
    content.scrollBy({ top: scrollAmount, behavior: "smooth" });
  }, []);

  const getThumbHeight = useCallback((): string => {
    const content = contentRef.current;
    const track = scrollTrackRef.current;
    if (!content || !track) return "20%";

    const viewportToContentRatio = content.clientHeight / content.scrollHeight;
    const trackHeight = track.clientHeight;
    const thumbHeight = Math.max(
      viewportToContentRatio * trackHeight,
      trackHeight * 0.1
    );
    return `${thumbHeight}px`;
  }, []);

  return (
    <div className="relative flex h-full">
      <div
        ref={contentRef}
        onScroll={handleScroll}
        className={`flex-grow overflow-hidden ${
          isTouchDevice ? "overflow-y-auto" : "hover:overflow-y-auto"
        } no-scrollbar pr-4`}
      >
        {children}
      </div>

      {scrollState.isOverflowing && !isTouchDevice && (
        <div className="w-8 flex flex-col border-l-2 border-black">
          <button
            onClick={() => handleArrowClick("up")}
            className="border-b-2 border-black h-8 flex items-center justify-center"
          >
            <img src="/macos_assets/arrow_up.png" alt="Scroll up" />
          </button>

          <div
            ref={scrollTrackRef}
            className="flex-grow relative bg-neutral-100"
          >
            <div
              ref={scrollThumbRef}
              onPointerDown={handleDragStart}
              onPointerMove={handleDragMove}
              onPointerUp={handleDragEnd}
              onPointerCancel={handleDragEnd}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              style={{
                top: `${scrollState.scrollPosition}px`,
                height: getThumbHeight(),
                touchAction: "none",
              }}
              className="absolute w-full bg-neutral-300 hover:bg-neutral-400 cursor-pointer"
            />
          </div>

          <button
            onClick={() => handleArrowClick("down")}
            className="border-t-2 border-black flex w-8 items-center justify-center"
          >
            <img src="/macos_assets/arrow_down.png" alt="Scroll down" />
          </button>
        </div>
      )}
    </div>
  );
}
