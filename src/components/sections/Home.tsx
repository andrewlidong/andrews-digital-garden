import { forwardRef, useRef, useState, useCallback, useEffect } from "react";
import Autoplay from "embla-carousel-autoplay";
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
      className="min-h-screen flex flex-col items-center justify-around relative"
    >
      {/* Simple background elements */}
      <div className="absolute top-40 left-40 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl"></div>
      <div className="absolute bottom-40 right-40 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl"></div>
      
      <main className="text-center flex flex-col gap-8 text-white mt-36 z-10 px-4">
        <h1 className="text-4xl md:text-8xl font-bold animate-on-scroll fade-up is-visible">
           <span className="font-bold text-slate-200 relative">
            {typedText}<span className="animate-pulse inline-block ml-1">|</span>
          </span>
        </h1>
        
        <h1 className="text-3xl md:text-6xl font-bold animate-on-scroll fade-up is-visible" style={{ transitionDelay: '200ms' }}>
          Senior Software Engineer
        </h1>
        
        <p className="text-lg md:text-2xl text-slate-200 animate-on-scroll fade-up is-visible" style={{ transitionDelay: '400ms' }}>
        Okay, here we go. Exterior. Cemetery. Night. The shoot-out. Yeah! The Jack O' Diamonds is waiting there with Bonny, and he's arranged to give him back and have this whole thing end because all he really wants is <b>peace</b>. 
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
                  src: "/capitalone.png",
                  alt: "Capital One",
                },
                {
                  href: "https://rubrik.com/",
                  src: "/rubrik.jpeg",
                  alt: "Rubrik",
                },
                { href: "https://superalert.nyc/", src: "/superalert.png", alt: "SuperAlert" },
                {
                  href: "https://www.limitless.ventures/",
                  src: "/limitlessventures.jpeg",
                  alt: "Limitless Ventures",
                },
                {
                  href: "https://codecademy.com/",
                  src: "/codecademy.jpg",
                  alt: "Codecademy",
                },
                {
                  href: "https://equinox.com/",
                  src: "/equinox.png",
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
