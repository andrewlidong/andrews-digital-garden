import { forwardRef, useRef, useState, useCallback, useEffect, lazy, Suspense } from "react";
import Autoplay from "embla-carousel-autoplay";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

// The WebGL morphing-line background, lazily loaded so it never blocks first
// paint. It sits behind the hero as a soft, masked backdrop and slowly morphs a
// single continuous line through a cycle of subjects.
const LineMorphCanvas = lazy(() =>
  import("../ui/LineMorphCanvas").then((m) => ({ default: m.LineMorphCanvas }))
);
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "../ui/carousel";
import * as resume from "../../content/resume.json";

type AutoplayType = {
  play: () => void;
  stop: () => void;
  reset: () => void;
  destroy: () => void;
};

interface HomeProps {
  title?: string;
  isMobile?: boolean;
}

const Home = forwardRef<HTMLElement, HomeProps>(({ isMobile = false }, ref) => {
  const [autoplay, setAutoplay] = useState<AutoplayType | null>(null);
  // Reveal the hero on scroll-in (once, so it survives parent re-renders).
  const revealRef = useRef<HTMLElement>(null);
  const rv = useIntersectionObserver(revealRef, { threshold: 0.12, once: true }) ? "is-visible" : "";
  const [typedText, setTypedText] = useState("");
  const fullName = "Andrew Li Dong";
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Simple typing effect
  useEffect(() => {
    let index = 0;
    
    // Clear any existing interval
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }
    
    // Set up typing interval
    typingIntervalRef.current = setInterval(() => {
      if (index < fullName.length) {
        setTypedText(fullName.substring(0, index + 1));
        index++;
      } else {
        // Stop the interval when done typing
        if (typingIntervalRef.current) {
          clearInterval(typingIntervalRef.current);
        }
      }
    }, 150);
    
    // Cleanup
    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
    };
  }, []);

  const plugin = useRef(
    Autoplay({
      delay: 4000,
      stopOnInteraction: true,
      stopOnMouseEnter: true,
      playOnInit: true,
    })
  );

  const handleMouseEnter = useCallback(() => {
    if (autoplay) {
      plugin.current.stop();
    }
  }, [autoplay]);

  const handleMouseLeave = useCallback(() => {
    if (autoplay) {
      plugin.current.play();
    }
  }, [autoplay]);

  useEffect(() => {
    if (plugin.current) {
      setAutoplay(plugin.current);
    }
  }, []);

  return (
    <section
      id="home"
      ref={ref}
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
    >
      {/* Desktop: the morphing-line drawing sits as a soft backdrop behind the
          hero copy, edge-faded with a radial mask and dialed back so the text
          stays legible, with a scrim over the brightest part. */}
      {!isMobile && (
        <>
          {/* A layered aurora of the theme's accent hues radiates behind the
              drawing, giving the hero a grand, luminous backdrop. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-0"
            style={{
              background:
                "radial-gradient(40% 36% at 38% 42%, color-mix(in srgb, var(--term-accent) 24%, transparent), transparent 70%)," +
                "radial-gradient(38% 34% at 64% 50%, color-mix(in srgb, var(--term-magenta) 20%, transparent), transparent 70%)," +
                "radial-gradient(46% 40% at 50% 46%, color-mix(in srgb, var(--term-cyan) 14%, transparent), transparent 72%)",
            }}
          />
          <Suspense fallback={null}>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 z-0 opacity-[0.68]"
              style={{
                maskImage:
                  "radial-gradient(70% 58% at 50% 45%, black 32%, transparent 82%)",
                WebkitMaskImage:
                  "radial-gradient(70% 58% at 50% 45%, black 32%, transparent 82%)",
              }}
            >
              <LineMorphCanvas className="h-full w-full" />
            </div>
          </Suspense>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-0"
            style={{
              background:
                "radial-gradient(55% 42% at 50% 44%, color-mix(in srgb, var(--term-bg) 74%, transparent), transparent 72%)",
            }}
          />
        </>
      )}

      {/* Mobile: give the drawing its own space above the copy (not behind it),
          so it's fully visible. Edge-faded so it blends into the page. */}
      {isMobile && (
        <Suspense fallback={null}>
          <div
            aria-hidden
            className="pointer-events-none relative z-0 w-full h-[42vh] max-h-[400px] mt-10 mb-1"
          >
            {/* Aurora glow behind the drawing for a grander presence. */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(58% 52% at 50% 48%, color-mix(in srgb, var(--term-accent) 22%, transparent), transparent 72%)," +
                  "radial-gradient(52% 46% at 62% 54%, color-mix(in srgb, var(--term-magenta) 16%, transparent), transparent 72%)",
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                maskImage:
                  "radial-gradient(72% 72% at 50% 50%, black 62%, transparent 100%)",
                WebkitMaskImage:
                  "radial-gradient(72% 72% at 50% 50%, black 62%, transparent 100%)",
              }}
            >
              <LineMorphCanvas className="h-full w-full" />
            </div>
          </div>
        </Suspense>
      )}

      <main ref={revealRef} className={`w-full flex flex-col gap-6 z-10 text-left ${isMobile ? "mt-4" : "mt-28"}`}>
        <p className={`font-mono text-sm text-term-accent animate-on-scroll fade-up ${rv}`}>
          ~/andrew
        </p>

        <h1 className={`text-5xl md:text-7xl font-bold tracking-tight text-term-fg animate-on-scroll fade-up ${rv}`} style={{ transitionDelay: '100ms' }}>
          {typedText}<span className="animate-pulse inline-block ml-1 text-term-accent">|</span>
        </h1>

        <h2 className={`text-2xl md:text-4xl font-semibold tracking-tight text-term-dim animate-on-scroll fade-up ${rv}`} style={{ transitionDelay: '200ms' }}>
          Staff Software Engineer
        </h2>

        <p className={`text-lg md:text-xl leading-relaxed text-term-dim animate-on-scroll fade-up ${rv}`} style={{ transitionDelay: '400ms' }}>
          Okay, here we go. Exterior. Cemetery. Night. The shoot-out. Yeah! The Jack O' Diamonds is waiting there with Bonny, and he's arranged to give him back and have this whole thing end because all he really wants is peace.
        </p>
      </main>

      {!isMobile && (
        <>
          <div className="animate-on-scroll fade-in is-visible z-10 px-4 w-full" style={{ transitionDelay: '600ms' }}>
            <Carousel
              plugins={[plugin.current]}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              className="text-white text-center max-w-3xl mx-auto"
            >
              <CarouselContent>
                {resume.experience.map((item) => {
                  if (item.quote) {
                    return (
                      <CarouselItem key={item.company}>
                        <span className="flex items-center justify-center h-full">
                          {item.quote}, {item.company}
                        </span>
                      </CarouselItem>
                    );
                  }
                })}
              </CarouselContent>
              <CarouselPrevious className="text-slate-500" />
              <CarouselNext className="text-slate-500" />
            </Carousel>
          </div>

          <div className="max-w-4xl mx-auto mb-6 text-center z-10 animate-on-scroll fade-up is-visible px-4" style={{ transitionDelay: '800ms' }}>
            <span className="text-white text-lg">★★★★★</span>
            <p className="text-xl text-gray-300 mt-2 text-center mb-4">
              Proudly contributed to:
            </p>
            <div className="flex flex-wrap justify-center gap-6 md:gap-10 relative z-40 stagger-children">
              {[
                {
                  href: "https://capitalone.com/",
                  src: "/capitalone.webp",
                  alt: "Capital One",
                },
                {
                  href: "https://rubrik.com/",
                  src: "/rubrik.webp",
                  alt: "Rubrik",
                },
                { href: "https://superalert.nyc/", src: "/superalert.webp", alt: "SuperAlert" },
                {
                  href: "https://www.limitless.ventures/",
                  src: "/limitlessventures.webp",
                  alt: "Limitless Ventures",
                },
                {
                  href: "https://codecademy.com/",
                  src: "/codecademy.webp",
                  alt: "Codecademy",
                },
                {
                  href: "https://equinox.com/",
                  src: "/equinox.webp",
                  alt: "Equinox",
                },
              ].map((company, index) => (
                <a
                  key={index}
                  href={company.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="opacity-50 hover:opacity-100 transition-all duration-300 hover-lift"
                >
                  <img
                    src={company.src}
                    alt={company.alt}
                    loading="lazy"
                    decoding="async"
                    className="h-10 md:h-14 relative z-10"
                  />
                </a>
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
});

export default Home;
