import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Theme } from "@/lib/themes";

interface MenuItem {
  name: string;
  onClick?: () => void;
}

interface HeaderProps {
  onOpenTerminal?: () => void;
  pawModeActive?: boolean;
  onTogglePawMode?: () => void;
  themes?: Theme[];
  themeId?: string;
  onSetTheme?: (id: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenTerminal, pawModeActive, onTogglePawMode, themes, themeId, onSetTheme }) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const navigate = useNavigate();

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

  const mobileMenuItems: MenuItem[] = [
    {
      name: "Off",
    },
    {
      name: "On",
      onClick: () => {
        navigate("/mobile");
      },
    },
  ];

  const MenuDropdown: React.FC<{ items: MenuItem[] }> = ({ items }) => (
    <div className="absolute top-full left-0 bg-term-elevated border border-term-border shadow-md min-w-[160px] z-20">
      {items.map((item, index) => (
        <div
          key={index}
          className="px-4 py-1 hover:bg-term-inset text-term-dim hover:text-term-fg cursor-pointer border-b border-term-border last:border-b-0 font-mono"
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
      <div className="bg-term-inset text-term-fg border-b border-term-border py-2 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="font-mono text-term-green flex items-center">
              <span className="mr-2">andrew@digital-garden:~$</span>
            </div>
            <div className="relative">
              <button
                onClick={() => handleMenuClick("contact")}
                className={`px-2 py-1 rounded ${activeDropdown === "contact" ? "bg-term-elevated text-term-green" : "text-term-dim hover:text-term-fg"}`}
              >
                contact
              </button>
              {activeDropdown === "contact" && (
                <MenuDropdown items={contactMenuItems} />
              )}
            </div>
            <div className="relative">
              <button
                onClick={() => handleMenuClick("mobile")}
                className={`px-2 py-1 rounded ${activeDropdown === "mobile" ? "bg-term-elevated text-term-green" : "text-term-dim hover:text-term-fg"}`}
              >
                mobile-mode
              </button>
              {activeDropdown === "mobile" && (
                <MenuDropdown items={mobileMenuItems} />
              )}
            </div>
            <div className="relative">
              <button
                onClick={() => navigate("/blog")}
                className="px-2 py-1 rounded text-gray-300 hover:text-white hover:bg-gray-700"
              >
                blog
              </button>
            </div>
            {onOpenTerminal && (
              <div className="relative">
                <button
                  onClick={onOpenTerminal}
                  className="px-2 py-1 rounded text-term-dim hover:text-term-fg hover:bg-term-elevated"
                >
                  terminal
                </button>
              </div>
            )}
            {themes && onSetTheme && (
              <div className="relative">
                <button
                  onClick={() => handleMenuClick("theme")}
                  className={`px-2 py-1 rounded flex items-center gap-1.5 ${activeDropdown === "theme" ? "bg-term-elevated text-term-accent" : "text-term-dim hover:text-term-fg hover:bg-term-elevated"}`}
                >
                  <span
                    className="w-3 h-3 rounded-full border border-term-border"
                    style={{ backgroundColor: "var(--term-accent)" }}
                  />
                  theme
                </button>
                {activeDropdown === "theme" && (
                  <div className="absolute top-full left-0 mt-1 bg-term-elevated border border-term-border shadow-md min-w-[180px] max-h-[70vh] overflow-y-auto z-20">
                    {themes.map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => {
                          onSetTheme(theme.id);
                          setActiveDropdown(null);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-1.5 cursor-pointer border-b border-term-border last:border-b-0 font-mono text-left ${
                          theme.id === themeId ? "text-term-accent" : "text-term-dim hover:text-term-fg hover:bg-term-inset"
                        }`}
                      >
                        <span className="flex gap-0.5 flex-shrink-0">
                          <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: theme.tokens.bg }} />
                          <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: theme.tokens.accent }} />
                          <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: theme.tokens.green }} />
                          <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: theme.tokens.yellow }} />
                        </span>
                        <span className="flex-1">{theme.name}</span>
                        {theme.id === themeId && <span className="text-term-accent">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            {onTogglePawMode && (
              <div className="relative">
                <button
                  onClick={onTogglePawMode}
                  className={`px-2 py-1 rounded flex items-center gap-1 ${
                    pawModeActive ? "bg-term-elevated text-term-accent" : "text-term-dim hover:text-term-fg hover:bg-term-elevated"
                  }`}
                >
                  <svg width="14" height="14" viewBox="0 0 64 64" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <ellipse cx="32" cy="42" rx="14" ry="12" />
                    <ellipse cx="16" cy="18" rx="7" ry="9" />
                    <ellipse cx="28" cy="12" rx="7" ry="9" />
                    <ellipse cx="40" cy="12" rx="7" ry="9" transform="rotate(-5 40 12)" />
                    <ellipse cx="50" cy="18" rx="7" ry="9" transform="rotate(-10 50 18)" />
                  </svg>
                  paw
                </button>
              </div>
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
