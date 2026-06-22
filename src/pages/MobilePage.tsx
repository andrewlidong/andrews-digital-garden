import { useState, useEffect, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import Home from "../components/sections/Home";
import Contact from "../components/sections/Contact";
import Projects from "../components/sections/Projects";
import { useNavigate } from "react-router-dom";
import { useMobileDetect } from "@/hooks/useMobileDetect";
import { useTheme } from "@/hooks/useTheme";
import { MobileFileSystem } from "../components/sections/MobileFileSystem";
import type { FileItem } from "../components/sections/MobileFileSystem";
import PawStampMode from "@/components/personal/PawStampMode";
import { MetadataBar } from "@/components/personal/MetadataBar";
import "../styles/animations.css";

function MobilePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("home");
  const [isScrolling, setIsScrolling] = useState(false);
  const [currentContent, setCurrentContent] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState<FileItem | null>(null);
  const [bannerVisible, setBannerVisible] = useState(true);
  const [bannerMounted, setBannerMounted] = useState(true);
  const [pawModeActive, setPawModeActive] = useState(false);
  const [themeSheetOpen, setThemeSheetOpen] = useState(false);
  const bannerShown = useRef(false);
  const isMobile = useMobileDetect();
  // Apply the active "rice" theme on the mobile route too, so the whole page
  // (background glow, accent, text) reflects the palette chosen on desktop
  // instead of falling back to the CSS defaults. Also drives the mobile theme
  // picker (bottom sheet) below.
  const { themeId, setTheme, themes } = useTheme();

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

  // Everything below is plain inline JSX rather than nested components defined
  // in the render body. Defining <Background>/<NavBar>/… inside the component
  // gives them a new identity on every render, so React unmounts and remounts
  // the entire subtree whenever `activeTab` changes during scroll — which reran
  // the IntersectionObservers, reloaded the shader, and made the page jitter.
  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col items-center bg-term-bg text-term-fg font-sans antialiased transition-colors duration-500">
      {/* Signature radial glow — a single soft halo of the active accent at the
          top of the page, the way maximeheckel.com lights its hero. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 transition-[background] duration-500"
        style={{
          background:
            "radial-gradient(70% 45% at 50% -5%, color-mix(in srgb, var(--term-accent) 22%, transparent), transparent 70%)",
        }}
      />

      {/* Faint film grain for depth — a signature maximeheckel touch. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.035] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Slim single-accent reading-progress bar */}
      <div className="fixed top-0 left-0 right-0 h-0.5 z-50 bg-term-border/40">
        <div ref={progressBarRef} className="h-full bg-term-accent" style={{ width: '0%' }} />
      </div>

      {/* Floating glass nav */}
      <nav
        className={`fixed ${isMobile ? 'top-3 left-3 right-3' : 'top-8 left-1/2 -translate-x-1/2'} z-50 flex items-center justify-between gap-0.5 rounded-full border border-term-border/70 bg-[color-mix(in_srgb,var(--term-bg-elevated)_72%,transparent)] px-1.5 py-1.5 backdrop-blur-md shadow-[0_8px_30px_-12px_rgba(0,0,0,0.6)]`}
      >
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavClick(item.id)}
            className={`rounded-full px-2.5 md:px-3.5 py-1.5 text-[13px] md:text-sm font-medium tracking-tight transition-all duration-300 active:scale-95 ${
              activeTab === item.id
                ? "bg-term-accent text-term-bg"
                : "text-term-dim hover:text-term-fg hover:bg-term-fg/5"
            }`}
          >
            {item.label}
          </button>
        ))}
        <button
          onClick={() => setThemeSheetOpen(true)}
          aria-label="Change theme"
          className="grid place-items-center rounded-full p-1.5 text-term-faint transition-all duration-300 hover:bg-term-fg/5 active:scale-90"
        >
          <span
            className="block w-4 h-4 rounded-full border border-term-border"
            style={{ backgroundColor: "var(--term-accent)" }}
          />
        </button>
        <button
          onClick={() => setPawModeActive((prev) => !prev)}
          aria-label="Toggle paw mode"
          className={`grid place-items-center rounded-full p-1.5 transition-all duration-300 ${
            pawModeActive
              ? "text-term-accent bg-term-accent/10"
              : "text-term-faint hover:text-term-fg hover:bg-term-fg/5"
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 64 64" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="32" cy="42" rx="14" ry="12" />
            <ellipse cx="16" cy="18" rx="7" ry="9" />
            <ellipse cx="28" cy="12" rx="7" ry="9" />
            <ellipse cx="40" cy="12" rx="7" ry="9" transform="rotate(-5 40 12)" />
            <ellipse cx="50" cy="18" rx="7" ry="9" transform="rotate(-10 50 18)" />
          </svg>
        </button>
        {!isMobile && (
          <div className="ml-1 flex items-center gap-2 rounded-full border border-term-border/70 px-3 py-1.5">
            <Switch
              id="mobile-mode"
              checked={true}
              onCheckedChange={() => navigate("/")}
              className="data-[state=checked]:bg-term-green"
            />
            <Label htmlFor="mobile-mode" className="text-sm font-medium text-term-dim">
              Mobile
            </Label>
          </div>
        )}
      </nav>

      {/* Theme picker bottom sheet */}
      {themeSheetOpen && (
        <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Choose a theme">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setThemeSheetOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[75vh] overflow-y-auto rounded-t-2xl border-t border-term-border bg-term-elevated p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-term-border" />
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-semibold tracking-tight text-term-fg">Theme</h3>
              <button
                onClick={() => setThemeSheetOpen(false)}
                className="rounded-full p-1.5 text-term-faint transition-colors hover:text-term-fg"
                aria-label="Close"
              >
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M5 5l10 10M15 5L5 15" />
                </svg>
              </button>
            </div>
            {/* Same palette set as the desktop site — both read THEMES. */}
            <div className="grid grid-cols-1 gap-2">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => {
                    setTheme(theme.id);
                    setThemeSheetOpen(false);
                  }}
                  className={`flex items-center gap-2.5 rounded-xl border p-2.5 text-left transition-all active:scale-[0.98] ${
                    theme.id === themeId
                      ? "border-term-accent/70 bg-term-accent/10"
                      : "border-term-border/70 hover:bg-term-fg/5"
                  }`}
                >
                  <span className="flex flex-shrink-0 gap-0.5">
                    <span className="h-4 w-4 rounded-sm" style={{ backgroundColor: theme.tokens.bg }} />
                    <span className="h-4 w-4 rounded-sm" style={{ backgroundColor: theme.tokens.accent }} />
                    <span className="h-4 w-4 rounded-sm" style={{ backgroundColor: theme.tokens.green }} />
                    <span className="h-4 w-4 rounded-sm" style={{ backgroundColor: theme.tokens.yellow }} />
                  </span>
                  <span className={`flex-1 truncate text-sm ${theme.id === themeId ? "text-term-accent" : "text-term-dim"}`}>
                    {theme.name}
                  </span>
                  {theme.id === themeId && <span className="text-term-accent">✓</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <PawStampMode isActive={pawModeActive} />

      {/* "Best on desktop" hint */}
      {isMobile && bannerMounted && (
        <div
          className={`fixed top-16 left-3 right-3 z-40 flex items-center justify-center gap-2 rounded-full border border-term-border/70 bg-[color-mix(in_srgb,var(--term-bg-elevated)_80%,transparent)] px-4 py-2 text-center text-xs text-term-dim backdrop-blur-md transition-all duration-500 ease-in-out ${
            bannerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
          }`}
        >
          <span className="text-term-faint">↗</span>
          <span>Best experienced on desktop.</span>
        </div>
      )}

      {/* Reading-optimized content column */}
      <div className="relative z-10 flex flex-col justify-between min-h-screen w-full px-5 sm:px-6 md:w-7/12 max-w-2xl">
        <div className="pb-10">
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
      </div>
    </div>
  );
}

export default MobilePage;
