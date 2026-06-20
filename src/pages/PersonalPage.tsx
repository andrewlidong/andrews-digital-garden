import { File } from "@/components/personal/File";
import { Window } from "@/components/personal/Window";
import { Folder } from "@/components/personal/Folder";
import { useState, useEffect, useRef } from "react";
import { TextContent } from "@/components/personal/TextContent";
import { Terminal } from "@/components/personal/Terminal";
import fileSystemData from "@/content/filesystem.json";
import { Header } from "@/components/personal/Header";
import StartupScreen from "@/components/personal/StartupScreen";
import PawStampMode from "@/components/personal/PawStampMode";
import { MetadataBar } from "@/components/personal/MetadataBar";
import { AmbientBackground } from "@/components/personal/AmbientBackground";
import { loadFileContent } from "@/lib/loadFileContent";
import { useTheme } from "@/hooks/useTheme";

type FileItem = {
  id: string;
  name: string;
  type: "file" | "folder";
  path: string;
  content?: string;
  children?: FileItem[];
};

type WindowState = {
  id: string;
  title: string;
  content: FileItem[] | string;
  zIndex: number;
  isOpen: boolean;
  windowType: "folder" | "text" | "terminal";
  parentId?: string;
  sourceElementId?: string;
};

// Helper function to recursively process the file system
function processFileSystem(items: FileItem[]): FileItem[] {
  return items.map((item) => {
    if (item.type === "folder" && item.children) {
      return { ...item, children: processFileSystem(item.children) };
    }
    if (item.type === "file" && item.path) {
      // For files, we'll load the content here
      return { ...item, content: "" }; // Initialize with empty content
    }
    return item;
  });
}

function PersonalPage() {
  const [fileSystem, setFileSystem] = useState<FileItem[]>([]);
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [maxZIndex, setMaxZIndex] = useState(0);
  const [disabledItems, setDisabledItems] = useState<Set<string>>(new Set());
  const [pawModeActive, setPawModeActive] = useState(false);
  const [clickedItem, setClickedItem] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isStarting, setIsStarting] = useState(true);
  const [startupComplete, setStartupComplete] = useState(false);
  const [homeInput, setHomeInput] = useState("");
  const [terminalInitialCommand, setTerminalInitialCommand] = useState<string | undefined>(undefined);
  const [commandNonce, setCommandNonce] = useState(0);
  const readmeOpenedRef = useRef(false);
  // Active terminal "rice" theme. Applied as CSS variables; shared with the
  // Header (palette dropdown) and Terminal (`theme` command) so users can switch.
  const { themeId, setTheme, themes } = useTheme();
  // Cache of successfully loaded file contents, keyed by path. Failures are not
  // cached so reopening a file retries the fetch.
  const contentCache = useRef<Record<string, string>>({});

  const isDisabled = (id: string) => disabledItems.has(id);

  const openWindow = (item: FileItem, parentId?: string) => {
    // Remove click
    setClickedItem(null);

    // Check if window is already open
    const existingWindow = windows.find((w) => w.id === item.id);
    if (existingWindow) {
      bringToFront(item.id);
      return;
    }

    // Mark the item as disabled
    setDisabledItems((prev) => {
      const newSet = new Set(prev);
      newSet.add(item.id);
      return newSet;
    });

    if (item.type === "file") {
      const cached = item.path ? contentCache.current[item.path] : undefined;
      const newWindow: WindowState = {
        id: item.id,
        title: item.name,
        content: cached ?? "Loading…",
        zIndex: maxZIndex + 1,
        isOpen: true,
        windowType: "text",
        parentId,
        sourceElementId: item.id,
      };
      setWindows([...windows, newWindow]);

      // Lazily fetch the content the first time the file is opened.
      if (item.path && cached === undefined) {
        const path = item.path;
        loadFileContent(path).then((text) => {
          if (text !== "Error loading content") {
            contentCache.current[path] = text;
          }
          setWindows((prev) =>
            prev.map((w) => (w.id === item.id ? { ...w, content: text } : w))
          );
        });
      }
    } else if (item.type === "folder") {
      const newWindow: WindowState = {
        id: item.id,
        title: item.name,
        content: item.children || [],
        zIndex: maxZIndex + 1,
        isOpen: true,
        windowType: "folder",
        parentId,
        sourceElementId: item.id,
      };
      setWindows([...windows, newWindow]);
    }
    setMaxZIndex(maxZIndex + 1);
  };

  const bringToFront = (id: string) => {
    setWindows(
      windows.map((win) => ({
        ...win,
        zIndex: win.id === id ? maxZIndex + 1 : win.zIndex,
      }))
    );
    setMaxZIndex(maxZIndex + 1);
  };

  const closeWindow = (id: string) => {
    // Remove the disabled state when closing the window
    setDisabledItems((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });

    // Close the window and any child windows
    setWindows((prevWindows) => {
      const windowToClose = prevWindows.find((w) => w.id === id);
      if (!windowToClose) return prevWindows;

      // Find all child windows that need to be closed
      const childWindows = prevWindows.filter((w) => w.parentId === id);

      // Remove disabled state for all child items
      setDisabledItems((prev) => {
        const newSet = new Set(prev);
        childWindows.forEach((child) => newSet.delete(child.id));
        return newSet;
      });

      // Remove the window and all its children
      return prevWindows.filter((w) => w.id !== id && w.parentId !== id);
    });
  };

  // handle clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".file-container")) {
        setClickedItem(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    // Set up the file tree structure. File contents are loaded lazily when a
    // file is opened (see openWindow), rather than eagerly fetching every file
    // at once.
    const processedFileSystem = processFileSystem(fileSystemData as FileItem[]);
    setFileSystem(processedFileSystem);
  }, []);

  useEffect(() => {
    window.addEventListener("resize", handleWindowResize);
    return () => window.removeEventListener("resize", handleWindowResize);
  }, []);

  const handleWindowResize = () => {
    if (window.innerWidth < 768) {
      setIsMobile(true);
    } else {
      setIsMobile(false);
    }
  };

  // Add a function to open the terminal
  const openTerminal = () => {
    // Opened directly (Header button / welcome link): no command to auto-run.
    setTerminalInitialCommand(undefined);

    // Check if terminal is already open
    const existingTerminal = windows.find((w) => w.windowType === "terminal");
    if (existingTerminal) {
      bringToFront(existingTerminal.id);
      return;
    }

    const newWindow: WindowState = {
      id: "terminal",
      title: "Terminal",
      content: "",
      zIndex: maxZIndex + 1,
      isOpen: true,
      windowType: "terminal",
    };
    setWindows([...windows, newWindow]);
    setMaxZIndex(maxZIndex + 1);
  };

  // Open the terminal and run a command typed in the home-page prompt.
  const openTerminalWithCommand = (cmd: string) => {
    setTerminalInitialCommand(cmd);
    setCommandNonce((n) => n + 1);

    const existingTerminal = windows.find((w) => w.windowType === "terminal");
    if (existingTerminal) {
      bringToFront(existingTerminal.id);
      return;
    }

    const newWindow: WindowState = {
      id: "terminal",
      title: "Terminal",
      content: "",
      zIndex: maxZIndex + 1,
      isOpen: true,
      windowType: "terminal",
    };
    setWindows([...windows, newWindow]);
    setMaxZIndex(maxZIndex + 1);
  };

  const handleHomeCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!homeInput.trim()) return;
    openTerminalWithCommand(homeInput);
    setHomeInput("");
  };

  // Function to open a file by ID (used by terminal)
  const openFileById = (fileId: string) => {
    // Find the file in the filesystem
    const findFile = (items: FileItem[]): FileItem | null => {
      for (const item of items) {
        if (item.id === fileId) {
          return item;
        }
        if (item.type === "folder" && item.children) {
          const found = findFile(item.children);
          if (found) return found;
        }
      }
      return null;
    };

    const file = findFile(fileSystem);
    if (file) {
      openWindow(file);
    }
  };

  const renderFileOrFolder = (item: FileItem, parentId?: string) => {
    const isItemDisabled = isDisabled(item.id);

    if (item.type === "folder") {
      return (
        <Folder
          key={item.id}
          id={item.id}
          name={item.name}
          disabled={isItemDisabled}
          onOpen={() => !isItemDisabled && openWindow(item, parentId)}
          clicked={clickedItem === item.id}
          onClick={() => setClickedItem(item.id)}
        />
      );
    }
    return (
      <File
        key={item.id}
        id={item.id}
        name={item.name}
        disabled={isItemDisabled}
        onOpen={() => !isItemDisabled && openWindow(item, parentId)}
        clicked={clickedItem === item.id}
        onClick={() => setClickedItem(item.id)}
      />
    );
  };

  return (
    <>
      {isStarting && <StartupScreen onComplete={() => {
        setIsStarting(false);
        setStartupComplete(true);
      }} />}
      <div className="font-mono fixed top-0 left-0 w-full h-full text-term-fg">
        <AmbientBackground />
        <Header onOpenTerminal={openTerminal} pawModeActive={pawModeActive} onTogglePawMode={() => setPawModeActive(prev => !prev)} themes={themes} themeId={themeId} onSetTheme={setTheme} />

        <div className="flex h-[calc(100vh-60px)] pt-4">
          {/* Left sidebar with filesystem */}
          <div className="w-[320px] min-w-[320px] border-r border-term-border pl-6 pr-4 overflow-y-auto">
            <div className="grid grid-flow-row gap-2 pb-20">
              {fileSystem.map((item) => renderFileOrFolder(item))}
            </div>
          </div>
          
          {/* Main content area */}
          <div className="flex-1 relative overflow-hidden">
            {/* Terminal Welcome Message */}
            <div className="px-6 pt-4 pb-2 text-term-green">
              <pre className="text-xs">
{`
  █████╗ ███╗   ██╗██████╗ ██████╗ ███████╗██╗    ██╗███████╗
 ██╔══██╗████╗  ██║██╔══██╗██╔══██╗██╔════╝██║    ██║██╔════╝
 ███████║██╔██╗ ██║██║  ██║██████╔╝█████╗  ██║ █╗ ██║███████╗
 ██╔══██║██║╚██╗██║██║  ██║██╔══██╗██╔══╝  ██║███╗██║╚════██║
 ██║  ██║██║ ╚████║██████╔╝██║  ██║███████╗╚███╔███╔╝███████║
 ╚═╝  ╚═╝╚═╝  ╚═══╝╚═════╝ ╚═╝  ╚═╝╚══════╝ ╚══╝╚══╝ ╚══════╝
                                                              
  ██████╗  █████╗ ██████╗ ██████╗ ███████╗███╗   ██╗         
 ██╔════╝ ██╔══██╗██╔══██╗██╔══██╗██╔════╝████╗  ██║         
 ██║  ███╗███████║██████╔╝██║  ██║█████╗  ██╔██╗ ██║         
 ██║   ██║██╔══██║██╔══██╗██║  ██║██╔══╝  ██║╚██╗██║         
 ╚██████╔╝██║  ██║██║  ██║██████╔╝███████╗██║ ╚████║         
  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝ ╚══════╝╚═╝  ╚═══╝         
`}
              </pre>
              <div className="mt-1 text-term-dim text-sm">
                <p>Welcome to Andrew's Digital Garden v1.0.0</p>
                <p className="text-xs text-term-faint mt-1 mb-2">A personal space for projects, interests, and creative explorations.</p>
                <form onSubmit={handleHomeCommandSubmit} className="flex items-center">
                  <span className="text-term-green mr-2">andrew@digital-garden:~$</span>
                  <input
                    type="text"
                    value={homeInput}
                    onChange={(e) => setHomeInput(e.target.value)}
                    placeholder="type a command (try 'help') and press enter…"
                    aria-label="Terminal command input"
                    className="flex-1 bg-transparent outline-none text-term-fg placeholder-term-faint caret-term-yellow"
                  />
                </form>
              </div>
            </div>
            
            {/* Windows */}
            {windows
              .filter((w) => w.isOpen)
              .map((win, index) => {
                // Fixed position for windows in the main content area
                // This ensures the animation preview matches the final position
                const baseX = 50; // Fixed margin from the left of the content area
                const baseY = 180; // Fixed position below the welcome message
                
                // Add offset based on window index (25px per window)
                const offsetX = index * 25;
                const offsetY = index * 25;
                
                // Limit window width to fit in the content area
                const contentAreaWidth = window.innerWidth - 350; // Account for sidebar
                const windowWidth = isMobile ? 350 : Math.min(600, contentAreaWidth - 100);
                const windowHeight = isMobile ? 300 : 400;
                
                return (
                  <Window
                    key={win.id}
                    id={win.id}
                    title={win.title}
                    width={windowWidth}
                    height={windowHeight}
                    initialPosition={{
                      x: baseX + offsetX,
                      y: baseY + offsetY,
                    }}
                    zIndex={win.zIndex}
                    isActive={win.zIndex === maxZIndex}
                    onFocus={() => bringToFront(win.id)}
                    onClose={() => closeWindow(win.id)}
                    sourceElementId={win.sourceElementId}
                  >
                    {win.windowType === "folder" && Array.isArray(win.content) ? (
                      <div className="p-4">
                        <div className="mb-3 pb-2 border-b border-term-border">
                          <span className="text-term-accent font-mono">andrew@digital-garden</span>
                          <span className="text-term-dim">:</span>
                          <span className="text-term-green">~/documents/</span>
                          <span className="text-term-yellow">{win.title}</span>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                          {win.content.map((item) => renderFileOrFolder(item, win.id))}
                        </div>
                      </div>
                    ) : win.windowType === "text" && typeof win.content === "string" ? (
                      <TextContent content={win.content} filename={win.title} />
                    ) : win.windowType === "terminal" ? (
                      <Terminal
                        onOpenFile={openFileById}
                        fileSystem={fileSystem}
                        initialCommand={terminalInitialCommand}
                        commandNonce={commandNonce}
                        themes={themes}
                        themeId={themeId}
                        onSetTheme={setTheme}
                      />
                    ) : null}
                  </Window>
                );
              })}
          </div>
        </div>

        {/* Terminal Welcome Message */}
        {startupComplete && !isMobile && (
          <div className="fixed bottom-10 left-4 right-4 bg-term-inset bg-opacity-80 border border-term-border p-3 rounded-md text-sm max-w-md">
            <p>
              Welcome to my digital garden! Explore my projects and interests by clicking on the folders above.
            </p>
            <p className="mt-2">
              <button
                onClick={openTerminal}
                className="text-term-accent hover:underline focus:outline-none"
              >
                Click here
              </button> to open the terminal for a more interactive experience.
            </p>
          </div>
        )}
        {startupComplete && !isMobile && <MetadataBar />}
      </div>
    <PawStampMode isActive={pawModeActive} />
    </>
  );
}

export default PersonalPage;
