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

const Home = forwardRef<HTMLElement, { title: string }>((props, ref) => {
  const [autoplay, setAutoplay] = useState<AutoplayType | null>(null);

  const Title = () => {
    return (
      <span className="font-bold text-slate-200">
        {props.title}
        <span className="animate-pulse">|</span>
      </span>
    );
  };

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
      className="min-h-screen flex flex-col items-center justify-around"
    >
      <main className="text-center flex flex-col gap-8 text-white mt-36">
        <h1 className="text-8xl font-bold">
          Introducing <Title />
        </h1>
        <h1 className="text-6xl font-bold">Senior Software Engineer.</h1>
        {/* <p className="text-2xl">
          Developer, community builder, filmmaker, amateur musician - you can
          guarantee his value is <b>not just code.</b>
        </p> */}
        <p className="text-2xl text-slate-200">
        A versatile developer with a track record of building innovative solutions, fostering communities, and delivering meaningful impact - <b>bringing value that goes far beyond just code.</b>
        </p>
      </main>

      <Carousel
        plugins={[plugin.current]}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="text-white text-center max-w-3xl"
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

      <div className="max-w-4xl mx-auto mb-6 text-center">
        <span className="text-white text-lg">★★★★★</span>
        <p className="text-xl text-gray-300 mt-2 text-center mb-4">
        Proudly contributed to:
        </p>
        <div className="flex justify-center space-x-10 relative z-40">
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
              className="opacity-50 hover:opacity-100 transition-opacity duration-200"
            >
              <img
                src={company.src}
                alt={company.alt}
                className="h-14 relative z-10"
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
});

export default Home;
