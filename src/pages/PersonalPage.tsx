import { File } from "@/components/personal/File";
import { Window } from "@/components/personal/Window";
import { Folder } from "@/components/personal/Folder";
import { useState, useEffect, useRef, lazy, Suspense } from "react";
const TextContent = lazy(() =>
  import("@/components/personal/TextContent").then((m) => ({ default: m.TextContent }))
);
const LineMorphCanvas = lazy(() =>
  import("@/components/ui/LineMorphCanvas").then((m) => ({ default: m.LineMorphCanvas }))
);
import { Terminal } from "@/components/personal/Terminal";
import fileSystemData from "@/content/filesystem.json";
import { Header } from "@/components/personal/Header";
import PawStampMode from "@/components/personal/PawStampMode";
import { readerPath } from "@/lib/frontmatter";
import { MetadataBar } from "@/components/personal/MetadataBar";
import { loadFileContent } from "@/lib/loadFileContent";
import { useTheme } from "@/hooks/useTheme";
import { getTheme } from "@/lib/themes";
import { useKonami } from "@/hooks/useKonami";
import { BootSequence, BOOT_FLAG } from "@/components/personal/BootSequence";
const TetrisFrame = lazy(() =>
  import("@/components/personal/TetrisFrame").then((m) => ({ default: m.TetrisFrame }))
);
const RadioApp = lazy(() =>
  import("@/components/personal/RadioApp").then((m) => ({ default: m.RadioApp }))
);
const PaintApp = lazy(() =>
  import("@/components/personal/PaintApp").then((m) => ({ default: m.PaintApp }))
);

// Desktop apps — live things, not documents. Each opens in its own window.
const APPS = [
  {
    id: "tetris",
    icon: "🕹️",
    label: "tetris",
    title: "tetris-one-thousand",
    hint: "Massively multiplayer Tetris — everyone shares one board",
    width: 900,
    height: 620,
  },
  {
    id: "radio",
    icon: "📻",
    label: "radio",
    title: "radio",
    hint: "SomaFM internet radio",
    width: 400,
    height: 480,
  },
  {
    id: "paint",
    icon: "🎨",
    label: "paint",
    title: "paint",
    hint: "Doodle in theme colors",
    width: 680,
    height: 520,
  },
] as const;

type AppId = (typeof APPS)[number]["id"];

type FileItem = {
  id: string;
  name: string;
  type: "file" | "folder";
  path: string;
  content?: string;
  children?: FileItem[];
  // Pulled from frontmatter at build time (see scripts/updateFilesystem.js).
  date?: string;
  title?: string;
};

type WindowState = {
  id: string;
  title: string;
  content: FileItem[] | string;
  zIndex: number;
  isOpen: boolean;
  windowType: "folder" | "text" | "terminal" | AppId;
  parentId?: string;
  sourceElementId?: string;
  filePath?: string;
};

// Sort a folder's children: dated files (blog posts) newest-first, folders and
// undated files keep a stable alphabetical order after them.
function sortFolderChildren(items: FileItem[]): FileItem[] {
  const dateOf = (item: FileItem): string =>
    item.type === "file" ? item.date || "" : "";
  return [...items].sort((a, b) => {
    const da = dateOf(a);
    const db = dateOf(b);
    if (da && db) return db.localeCompare(da);
    if (da) return -1;
    if (db) return 1;
    return a.name.localeCompare(b.name);
  });
}

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
  // Fake boot screen, once per browser session.
  const [booting, setBooting] = useState(() => {
    try {
      return !sessionStorage.getItem(BOOT_FLAG);
    } catch {
      return false;
    }
  });
  const finishBoot = () => {
    try {
      sessionStorage.setItem(BOOT_FLAG, "1");
    } catch {
      /* private mode — boot will just replay next visit */
    }
    setBooting(false);
  };
  // ↑↑↓↓←→←→BA — unleash the paw stamps.
  useKonami(() => setPawModeActive((prev) => !prev));
  const [clickedItem, setClickedItem] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [startupComplete] = useState(true);
  const [homeInput, setHomeInput] = useState("");
  const [terminalInitialCommand, setTerminalInitialCommand] = useState<string | undefined>(undefined);
  const [commandNonce, setCommandNonce] = useState(0);
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
        filePath: item.path,
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

  // Open a desktop app (tetris, radio, paint) in its own window. Apps are
  // singletons — reopening one focuses the existing window.
  const openApp = (appId: AppId) => {
    setClickedItem(null);
    const app = APPS.find((a) => a.id === appId);
    if (!app) return;
    const existing = windows.find((w) => w.windowType === appId);
    if (existing) {
      bringToFront(existing.id);
      return;
    }
    const newWindow: WindowState = {
      id: app.id,
      title: app.title,
      content: "",
      zIndex: maxZIndex + 1,
      isOpen: true,
      windowType: app.id,
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
      {booting && <BootSequence onDone={finishBoot} />}
      <div className="font-mono fixed top-0 left-0 w-full h-full bg-term-bg text-term-fg">
        <Header onOpenTerminal={openTerminal} pawModeActive={pawModeActive} onTogglePawMode={() => setPawModeActive(prev => !prev)} themes={themes} themeId={themeId} onSetTheme={setTheme} />

        <div className="flex h-[calc(100vh-60px)] pt-4">
          {/* Left sidebar with filesystem */}
          <div className="w-[320px] min-w-[320px] border-r border-term-border pl-6 pr-4 overflow-y-auto">
            <div className="grid grid-flow-row gap-2 pb-20">
              {fileSystem.map((item) => renderFileOrFolder(item))}

              {/* Apps — live things, not documents */}
              <div className="mt-4 mb-1 border-t border-term-border pt-3 pl-2 font-mono text-xs text-term-faint">
                apps
              </div>
              {APPS.map((app) => (
                <div
                  key={app.id}
                  id={`${app.id}-app`}
                  className={`file-container flex items-center p-2 w-full cursor-pointer ${
                    clickedItem === `${app.id}-app` ? "bg-term-elevated bg-opacity-60 rounded" : ""
                  }`}
                  onClick={() => setClickedItem(`${app.id}-app`)}
                  onDoubleClick={() => openApp(app.id)}
                  title={app.hint}
                >
                  <div className="mr-2 flex items-center justify-center w-6 h-6 flex-shrink-0">
                    <span className="text-xl">{app.icon}</span>
                  </div>
                  <p className="font-mono text-term-fg text-lg break-all">{app.label}</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Main content area */}
          <div className="flex-1 relative overflow-hidden">
            {/* Decorative enchanted-rose shader in the background, anchored right */}
            {!isMobile && (
              <Suspense fallback={null}>
                <div
                  className="pointer-events-none absolute top-0 right-0 h-full z-0 opacity-70"
                  style={{
                    width: "min(40vw, 560px)",
                    maskImage:
                      "radial-gradient(ellipse at 50% 45%, black 45%, transparent 80%)",
                    WebkitMaskImage:
                      "radial-gradient(ellipse at 50% 45%, black 45%, transparent 80%)",
                  }}
                  aria-hidden="true"
                >
                  <LineMorphCanvas className="h-full w-full" tokens={getTheme(themeId).tokens} />
                </div>
              </Suspense>
            )}
            {/* Terminal Welcome Message */}
            <div className="relative px-6 pt-4 pb-2 text-term-green">
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
                const app = APPS.find((a) => a.id === win.windowType);
                const windowWidth = isMobile
                  ? 350
                  : Math.min(app?.width ?? 600, contentAreaWidth - 100);
                const windowHeight = isMobile ? 300 : app?.height ?? 400;
                
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
                    onFocus={() => bringToFront(win.id)}
                    onClose={() => closeWindow(win.id)}
                    sourceElementId={win.sourceElementId}
                    expandUrl={
                      win.windowType === "text" && win.filePath
                        ? readerPath(win.filePath)
                        : undefined
                    }
                  >
                    {win.windowType === "folder" && Array.isArray(win.content) ? (
                      <div className="p-4 bg-term-bg">
                        <div className="mb-3 pb-2 border-b border-term-border">
                          <span className="text-term-accent font-mono">andrew@digital-garden</span>
                          <span className="text-term-dim">:</span>
                          <span className="text-term-green">~/documents/</span>
                          <span className="text-term-yellow">{win.title}</span>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                          {sortFolderChildren(win.content).map((item) => renderFileOrFolder(item, win.id))}
                        </div>
                      </div>
                    ) : win.windowType === "text" && typeof win.content === "string" ? (
                      <Suspense fallback={<div className="p-4 text-term-dim text-sm">Loading…</div>}>
                        <TextContent content={win.content} filename={win.title} />
                      </Suspense>
                    ) : win.windowType === "terminal" ? (
                      <Terminal
                        onOpenFile={openFileById}
                        onOpenApp={(id) => openApp(id as AppId)}
                        fileSystem={fileSystem}
                        initialCommand={terminalInitialCommand}
                        commandNonce={commandNonce}
                        themes={themes}
                        themeId={themeId}
                        onSetTheme={setTheme}
                        onClose={() => closeWindow(win.id)}
                      />
                    ) : win.windowType === "tetris" ? (
                      <Suspense fallback={<div className="p-4 font-mono text-sm text-term-dim">loading tetris…</div>}>
                        <TetrisFrame />
                      </Suspense>
                    ) : win.windowType === "radio" ? (
                      <Suspense fallback={<div className="p-4 font-mono text-sm text-term-dim">tuning…</div>}>
                        <RadioApp />
                      </Suspense>
                    ) : win.windowType === "paint" ? (
                      <Suspense fallback={<div className="p-4 font-mono text-sm text-term-dim">mixing paint…</div>}>
                        <PaintApp />
                      </Suspense>
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
