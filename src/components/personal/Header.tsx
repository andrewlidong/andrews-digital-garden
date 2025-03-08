import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface MenuItem {
  name: string;
  onClick?: () => void;
}

interface HeaderProps {
  onOpenTerminal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenTerminal }) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<string>("");
  const navigate = useNavigate();

  // Update the clock every second
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setCurrentTime(timeString);
    };
    
    updateClock(); // Initial call
    const intervalId = setInterval(updateClock, 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  const handleMenuClick = (menu: string) => {
    setActiveDropdown(activeDropdown === menu ? null : menu);
  };

  const contactMenuItems: MenuItem[] = [
    {
      name: "Twitter",
      onClick: () => {
        window.open("https://twitter.com/AndrewDong1994");
      },
    },
    {
      name: "LinkedIn",
      onClick: () => {
        window.open("https://www.linkedin.com/in/andrew-dong/");
      },
    },
    {
      name: "Github",
      onClick: () => {
        window.open("https://github.com/andrewlidong");
      },
    },
    {
      name: "Letterboxd",
      onClick: () => {
        window.open("https://letterboxd.com/andrewdong1994/");
      },
    },
    {
      name: "Email",
      onClick: () => {
        window.open("mailto:andrewdong1994@gmail.com");
      },
    },
  ];

  const recruiterMenuItems: MenuItem[] = [
    {
      name: "Off",
    },
    {
      name: "On",
      onClick: () => {
        navigate("/recruiter");
      },
    },
  ];

  const MenuDropdown: React.FC<{ items: MenuItem[] }> = ({ items }) => (
    <div className="absolute top-full left-0 bg-gray-800 border border-gray-700 shadow-md min-w-[160px] z-20">
      {items.map((item, index) => (
        <div
          key={index}
          className="px-4 py-1 hover:bg-gray-700 text-gray-200 hover:text-white cursor-pointer border-b border-gray-700 last:border-b-0 font-mono"
          onClick={() => {
            if (item.onClick) {
              item.onClick();
              setActiveDropdown(null);
            }
          }}
        >
          {item.name}
        </div>
      ))}
    </div>
  );

  return (
    <>
      {/* Header */}
      <div className="bg-gray-900 text-white border-b border-gray-700 py-2 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="font-mono text-green-500 flex items-center">
              <span className="mr-2">andrew@digital-garden:~$</span>
            </div>
            <div className="relative">
              <button
                onClick={() => handleMenuClick("contact")}
                className={`px-2 py-1 rounded ${activeDropdown === "contact" ? "bg-gray-700 text-green-400" : "text-gray-300 hover:text-white"}`}
              >
                contact
              </button>
              {activeDropdown === "contact" && (
                <MenuDropdown items={contactMenuItems} />
              )}
            </div>
            <div className="relative">
              <button
                onClick={() => handleMenuClick("recruiter")}
                className={`px-2 py-1 rounded ${activeDropdown === "recruiter" ? "bg-gray-700 text-green-400" : "text-gray-300 hover:text-white"}`}
              >
                recruiter-mode
              </button>
              {activeDropdown === "recruiter" && (
                <MenuDropdown items={recruiterMenuItems} />
              )}
            </div>
            {onOpenTerminal && (
              <div className="relative">
                <button
                  onClick={onOpenTerminal}
                  className="px-2 py-1 rounded text-gray-300 hover:text-white hover:bg-gray-700"
                >
                  terminal
                </button>
              </div>
            )}
          </div>
          
          {/* Terminal Clock */}
          <div className="font-mono text-yellow-300 bg-gray-800 px-3 py-1 rounded border border-gray-700">
            {currentTime}
          </div>
        </div>
      </div>

      {/* Click anywhere else to close dropdowns */}
      {activeDropdown && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setActiveDropdown(null)}
        />
      )}
    </>
  );
};
