import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import Home from "../components/sections/Home";
import Experience from "../components/sections/Experience";
import Contact from "../components/sections/Contact";
import Projects from "../components/sections/Projects";
import { useNavigate } from "react-router-dom";

function RecruiterPage() {
  const navigate = useNavigate();

  const [index, setIndex] = useState(0);
  const [title, setTitle] = useState("");
  const fullTitle = "Andrew Dong";

  const [activeTab, setActiveTab] = useState("home");
  const [isScrolling, setIsScrolling] = useState(false);
  const navItems = [
    { id: "home", label: "Home" },
    { id: "experience", label: "Experience" },
    { id: "projects", label: "Projects" },
    { id: "contact", label: "Contact" },
  ];
  const sectionRefs = useRef<{
    home: HTMLElement | null;
    experience: HTMLElement | null;
    projects: HTMLElement | null;
    contact: HTMLElement | null;
  }>({
    home: null,
    experience: null,
    projects: null,
    contact: null,
  });

  // TODO: handle mobile

  // TODO: change this to CSS animation
  useEffect(() => {
    if (index < fullTitle.length) {
      const timeout = setTimeout(() => {
        setTitle((prevTitle) => prevTitle + fullTitle[index]);
        setIndex((prevIndex) => prevIndex + 1);
      }, 300); // Adjust this value to change the typing speed

      return () => clearTimeout(timeout);
    }
  }, [index]);

  useEffect(() => {
    const handleScroll = () => {
      if (isScrolling) return;

      const scrollPosition = window.scrollY + window.innerHeight / 2;

      for (const [id, ref] of Object.entries(sectionRefs.current)) {
        if (
          ref &&
          ref.offsetTop <= scrollPosition &&
          ref.offsetTop + ref.offsetHeight > scrollPosition
        ) {
          setActiveTab(id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Call once to set initial active tab

    return () => window.removeEventListener("scroll", handleScroll);
  }, [isScrolling]);

  const handleNavClick = (id: string) => {
    setIsScrolling(true);
    setActiveTab(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => {
        setIsScrolling(false);
      }, 1500);
    }
  };

  const Background = ({ children }: { children: React.ReactNode }) => {
    return (
      <div className="relative min-h-screen overflow-hidden flex flex-col items-center">
        {/* Base gradient - changed to softer, natural green colors */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-700 via-teal-800 to-green-900"></div>

        {/* Metallic overlay */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white to-transparent opacity-10"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white to-transparent opacity-10"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-10"></div>
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-white to-transparent opacity-10"></div>
        </div>

        {/* Shine effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white to-transparent opacity-5"></div>

        <div className="fixed inset-0 bg-gray-900 text-white p-6 flex flex-col items-center justify-center md:hidden">
          <h1 className="text-2xl font-bold mb-4">Desktop Only</h1>
          <p className="text-center mb-4">
            Sorry, but this portfolio is optimized for desktop use only.
          </p>
          <p className="text-center">
            Please visit on a desktop or laptop computer for the best
            experience. 
          </p>
        </div>

        {/* Desktop Content */}
        <div className="hidden md:block relative z-10 flex flex-col justify-between min-h-screen w-9/12">
          {children}
        </div>
      </div>
    );
  };

  const NavBar = () => {
    return (
      <nav className="fixed top-10 left-60 right-60 z-50 bg-teal-800 bg-opacity-30 backdrop-filter backdrop-blur-lg rounded-full p-1 flex justify-between items-center">
        {navItems.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            className={`text-lg px-6 py-6 rounded-full transition-colors duration-200 ${
              activeTab === item.id
                ? "text-teal-100 bg-teal-700 hover:text-white"
                : "text-white hover:bg-teal-700 hover:bg-opacity-50 hover:text-white"
            }`}
            onClick={() => handleNavClick(item.id)}
          >
            {item.label}
          </Button>
        ))}
        <div className="flex items-center space-x-2 mx-4">
          <Switch
            id="recruiter-mode"
            checked={true}
            onCheckedChange={() => navigate("/")}
            className="data-[state=checked]:bg-teal-600"
          />
          <Label htmlFor="recruiter-mode" className="text-lg text-white">
            Recruiter Mode
          </Label>
        </div>
      </nav>
    );
  };

  return (
    <Background>
      <NavBar />
      <Home title={title} ref={(el) => (sectionRefs.current.home = el)} />
      <Experience ref={(el) => (sectionRefs.current.experience = el)} />
      <Projects ref={(el) => (sectionRefs.current.projects = el)} />
      <Contact ref={(el) => (sectionRefs.current.contact = el)} />
    </Background>
  );
}

export default RecruiterPage;
