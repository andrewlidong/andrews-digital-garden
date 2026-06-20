import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import Home from "../components/sections/Home";
import Contact from "../components/sections/Contact";
import Projects from "../components/sections/Projects";
import { useNavigate } from "react-router-dom";
import { useMobileDetect } from "@/hooks/useMobileDetect";
import { MobileFileSystem } from "../components/sections/MobileFileSystem";
import type { FileItem } from "../components/sections/MobileFileSystem";
import PawStampMode from "@/components/personal/PawStampMode";
import { MetadataBar } from "@/components/personal/MetadataBar";
import "../styles/animations.css";

const ShaderFlower = lazy(() =>
  import("@/components/ui/ShaderFlower").then((m) => ({ default: m.ShaderFlower }))
);

function MobilePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("home");
  const [isScrolling, setIsScrolling] = useState(false);
  const [currentContent, setCurrentContent] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState<FileItem | null>(null);
  const [bannerVisible, setBannerVisible] = useState(true);
  const [bannerMounted, setBannerMounted] = useState(true);
  const [pawModeActive, setPawModeActive] = useState(false);
  const bannerShown = useRef(false);
  const isMobile = useMobileDetect();

  // Ref for the scroll progress bar
  const progressBarRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { id: "home", label: "Home" },
    { id: "projects", label: "Projects" },
    { id: "notes", label: "Notes" },
    { id: "contact", label: "Contact" },
  ];

  const sectionRefs = useRef<{
    home: HTMLElement | null;
    projects: HTMLElement | null;
    notes: HTMLElement | null;
    contact: HTMLElement | null;
  }>({
    home: null,
    projects: null,
    notes: null,
    contact: null,
  });

  // Improved scroll handling with throttling
  useEffect(() => {
    let lastScrollTime = 0;
    const throttleTime = 100; // ms between scroll event processing

    const handleScroll = () => {
      const now = Date.now();

      // Update progress bar directly with DOM manipulation for better performance
      if (progressBarRef.current) {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight;
        const winHeight = window.innerHeight;
        const scrollPercent = Math.min(scrollTop / (docHeight - winHeight), 1);
        progressBarRef.current.style.width = `${scrollPercent * 100}%`;
      }

      // Throttle the more expensive section detection
      if (now - lastScrollTime > throttleTime && !isScrolling) {
        lastScrollTime = now;

        // Find the section that's currently in view
        let currentSection = "home";
        for (const [id, ref] of Object.entries(sectionRefs.current)) {
          if (ref) {
            const rect = ref.getBoundingClientRect();
            if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
              currentSection = id;
              break;
            }
          }
        }

        setActiveTab(currentSection);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Call once to set initial values

    return () => window.removeEventListener("scroll", handleScroll);
  }, [isScrolling]);

  useEffect(() => {
    if (isMobile && !bannerShown.current) {
      const fadeOutTimer = setTimeout(() => {
        setBannerVisible(false);
      }, 3000);

      const removeTimer = setTimeout(() => {
        setBannerMounted(false);
      }, 3500);

      bannerShown.current = true;

      return () => {
        clearTimeout(fadeOutTimer);
        clearTimeout(removeTimer);
      };
    }
  }, [isMobile]);

  const handleNavClick = (id: string) => {
    setIsScrolling(true);
    setActiveTab(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => {
        setIsScrolling(false);
      }, 1000);
    }
  };

  const Background = ({ children }: { children: React.ReactNode }) => {
    return (
      <div className="relative min-h-screen overflow-hidden flex flex-col items-center bg-gray-900">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 bg-gray-800 opacity-50 pattern-grid-dark"></div>

        {/* Decorative enchanted-rose shader behind the hero. Anchored to the top
            viewport so it sits behind the Home section and scrolls away; it
            pauses rendering once it leaves the screen. */}
        <Suspense fallback={null}>
          <div
            className="pointer-events-none absolute top-0 left-0 z-0 w-full h-screen opacity-50"
            style={{
              maskImage:
                "radial-gradient(ellipse at 50% 42%, black 30%, transparent 72%)",
              WebkitMaskImage:
                "radial-gradient(ellipse at 50% 42%, black 30%, transparent 72%)",
            }}
            aria-hidden="true"
          >
            <ShaderFlower className="h-full w-full" />
          </div>
        </Suspense>

        {/* Simple progress bar - using ref for direct DOM manipulation */}
        <div className="fixed top-0 left-0 right-0 h-1 z-50 bg-gray-800">
          <div
            ref={progressBarRef}
            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
            style={{ width: '0%' }}
          ></div>
        </div>

        {/* Responsive Content */}
        <div className="relative z-10 flex flex-col justify-between min-h-screen w-full px-4 md:px-0 md:w-9/12">
          {children}
        </div>
      </div>
    );
  };

  const NavBar = () => {
    return (
      <nav className={`fixed ${isMobile ? 'top-4 left-4 right-4' : 'top-10 left-60 right-60'} z-50 bg-gray-800/90 backdrop-blur-sm border border-gray-700 shadow-md rounded-full p-1 flex justify-between items-center`}>
        {navItems.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            className={`text-sm md:text-lg px-2 md:px-6 py-2 md:py-6 rounded-full transition-all duration-300 ${
              activeTab === item.id
                ? "text-gray-900 bg-gray-100 hover:bg-white"
                : "text-gray-100 hover:bg-gray-700 hover:text-white"
            }`}
            onClick={() => handleNavClick(item.id)}
          >
            {item.label}
          </Button>
        ))}
        <Button
          variant="ghost"
          className={`px-2 md:px-4 py-2 md:py-6 rounded-full transition-all duration-300 ${
            pawModeActive
              ? "text-blue-400 bg-gray-700"
              : "text-gray-100 hover:bg-gray-700 hover:text-white"
          }`}
          onClick={() => setPawModeActive((prev) => !prev)}
        >
          <svg width="18" height="18" viewBox="0 0 64 64" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="32" cy="42" rx="14" ry="12" />
            <ellipse cx="16" cy="18" rx="7" ry="9" />
            <ellipse cx="28" cy="12" rx="7" ry="9" />
            <ellipse cx="40" cy="12" rx="7" ry="9" transform="rotate(-5 40 12)" />
            <ellipse cx="50" cy="18" rx="7" ry="9" transform="rotate(-10 50 18)" />
          </svg>
        </Button>
        {!isMobile && (
          <div className="flex items-center space-x-3 mx-4 bg-white px-5 py-3 rounded-full">
            <Switch
              id="mobile-mode"
              checked={true}
              onCheckedChange={() => navigate("/")}
              className="data-[state=checked]:bg-green-500 scale-150"
            />
            <Label htmlFor="mobile-mode" className="text-lg font-bold text-black">
              Mobile Mode
            </Label>
          </div>
        )}
      </nav>
    );
  };

  const MobileBanner = () => {
    if (!bannerMounted) return null;

    return (
      <div
        className={`fixed top-20 left-4 right-4 z-40 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-lg shadow-lg text-center text-sm transition-all duration-500 ease-in-out ${
          bannerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
        }`}
      >
        💻 For the full experience with interactive elements and more content, try visiting on desktop!
      </div>
    );
  };

  return (
    <Background>
      <NavBar />
      <PawStampMode isActive={pawModeActive} />
      {isMobile && <MobileBanner />}
      <div className="text-white pb-10">
        <Home ref={(el) => (sectionRefs.current.home = el)} isMobile={true} />
        <Projects ref={(el) => (sectionRefs.current.projects = el)} />
        <div id="notes" ref={(el) => (sectionRefs.current.notes = el)} className="min-h-screen py-20">
          <MobileFileSystem
            currentContent={currentContent}
            setCurrentContent={setCurrentContent}
            currentFile={currentFile}
            setCurrentFile={setCurrentFile}
          />
        </div>
        <Contact ref={(el) => (sectionRefs.current.contact = el)} />
      </div>
      <MetadataBar compact />
    </Background>
  );
}

export default MobilePage;
