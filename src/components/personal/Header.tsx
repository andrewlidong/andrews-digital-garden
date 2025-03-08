import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

interface MenuItem {
  name: string;
  onClick?: () => void;
}

export const Header: React.FC = () => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleMenuClick = (menu: string) => {
    setActiveDropdown(activeDropdown === menu ? null : menu);
  };

  const webRingItems: MenuItem[] = [
    {
      name: "Digital Garden",
      onClick: () => {
        window.open("https://yourdomain.com");
      },
    },
    {
      name: "←",
      onClick: () => {
        window.open("https://yourdomain.com/prev");
      },
    },
    {
      name: "→",
      onClick: () => {
        window.open("https://yourdomain.com/next");
      },
    },
  ];

  const contactMenuItems: MenuItem[] = [
    {
      name: "Twitter",
      onClick: () => {
        window.open("https://twitter.com/yourusername");
      },
    },
    {
      name: "LinkedIn",
      onClick: () => {
        window.open("https://linkedin.com/in/yourusername");
      },
    },
    {
      name: "Github",
      onClick: () => {
        window.open("https://github.com/yourusername");
      },
    },
    {
      name: "Letterboxd",
      onClick: () => {
        window.open("https://letterboxd.com/yourusername");
      },
    },
    {
      name: "Email",
      onClick: () => {
        window.open("mailto:your.email@example.com");
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
        <div className="flex items-center gap-6">
          <div className="font-mono text-green-500 flex items-center">
            <span className="mr-2">andrew@digital-garden:~$</span>
          </div>
          <div className="relative">
            <button
              onClick={() => handleMenuClick("webRing")}
              className={`px-2 py-1 rounded ${activeDropdown === "webRing" ? "bg-gray-700 text-green-400" : "text-gray-300 hover:text-white"}`}
            >
              webring
            </button>
            {activeDropdown === "webRing" && (
              <MenuDropdown items={webRingItems} />
            )}
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
