import { File } from "@/components/personal/File";
import { Window } from "@/components/personal/Window";
import { Folder } from "@/components/personal/Folder";
import { useState, useEffect, useRef } from "react";
import { TextContent } from "@/components/personal/TextContent";
import fileSystemData from "@/content/filesystem.json";
import { Header } from "@/components/personal/Header";
import StartupScreen from "@/components/personal/StartupScreen";

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
  windowType: "folder" | "text";
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
  const [clickedItem, setClickedItem] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isStarting, setIsStarting] = useState(true);
  const [startupComplete, setStartupComplete] = useState(false);
  const readmeOpenedRef = useRef(false);

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
      const newWindow: WindowState = {
        id: item.id,
        title: item.name,
        content: item.content || "Error: Content not loaded",
        zIndex: maxZIndex + 1,
        isOpen: true,
        windowType: "text",
        parentId,
        sourceElementId: item.id,
      };
      setWindows([...windows, newWindow]);
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
    const processedFileSystem = processFileSystem(fileSystemData as FileItem[]);
    setFileSystem(processedFileSystem);

    // Load all file contents
    const loadAllContents = async () => {
      const loadContent = async (items: FileItem[]): Promise<FileItem[]> => {
        const promises = items.map(async (item) => {
          if (item.type === "file" && item.path) {
            try {
              const response = await fetch(item.path);
              const content = await response.text();
              return { ...item, content };
            } catch (error) {
              console.error(`Error loading file: ${item.path}`, error);
              return { ...item, content: "Error loading content" };
            }
          }
          if (item.type === "folder" && item.children) {
            const children = await loadContent(item.children);
            return { ...item, children };
          }
          return item;
        });

        return Promise.all(promises);
      };

      const updatedFileSystem = await loadContent(processedFileSystem);
      setFileSystem(updatedFileSystem);
    };

    loadAllContents();
  }, []);

  // Auto-open README.txt when startup is complete
  useEffect(() => {
    if (startupComplete && fileSystem.length > 0 && !readmeOpenedRef.current) {
      const readmeFile = fileSystem.find(item => item.id === "readme");
      if (readmeFile) {
        openWindow(readmeFile);
        readmeOpenedRef.current = true;
      }
    }
  }, [startupComplete, fileSystem]);

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
      <div className="font-mono fixed top-0 left-0 w-full h-full bg-gray-900 text-white">
        <Header />

        <div className="flex h-[calc(100vh-60px)] pt-4">
          {/* Left sidebar with filesystem */}
          <div className="w-[320px] min-w-[320px] border-r border-gray-700 pl-6 pr-4 overflow-y-auto">
            <div className="grid grid-flow-row gap-2 pb-20">
              {fileSystem.map((item) => renderFileOrFolder(item))}
            </div>
          </div>
          
          {/* Main content area */}
          <div className="flex-1 relative overflow-hidden">
            {/* Terminal Welcome Message */}
            <div className="px-6 pt-4 pb-2 text-green-400">
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
              <div className="mt-1 text-gray-300 text-sm">
                <p>Welcome to Andrew's Digital Garden v1.0.0</p>
                <p className="text-xs text-gray-500 mt-1 mb-2">A personal space for projects, interests, and creative explorations.</p>
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">andrew@digital-garden:~$</span>
                  <span className="text-yellow-300 animate-pulse">▌</span>
                </div>
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
                  >
                    {win.windowType === "folder" && Array.isArray(win.content) ? (
                      <div className="p-4 bg-gray-900">
                        <div className="mb-3 pb-2 border-b border-gray-700">
                          <span className="text-blue-400 font-mono">andrew@digital-garden</span>
                          <span className="text-gray-400">:</span>
                          <span className="text-green-400">~/documents/</span>
                          <span className="text-yellow-300">{win.title}</span>
                          <span className="text-gray-400">$</span>
                          <span className="text-white ml-2">ls -la</span>
                        </div>
                        <div className="grid gap-2">
                          <div className="flex text-gray-500 text-sm mb-1">
                            <span className="w-6 mr-2">Type</span>
                            <span className="flex-1">Name</span>
                          </div>
                          {win.content.map((item) => (
                            <div 
                              key={item.id}
                              className="flex items-center hover:bg-gray-800 p-1 rounded cursor-pointer"
                              onClick={() => !isDisabled(item.id) && openWindow(item, win.id)}
                            >
                              <span className="w-6 mr-2">
                                {item.type === 'folder' ? 
                                  <span className="text-yellow-500">📁</span> : 
                                  <span className="text-blue-400">📄</span>
                                }
                              </span>
                              <span className={`flex-1 ${isDisabled(item.id) ? 'text-gray-500' : 'text-white'}`}>
                                {item.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <TextContent content={win.content as string} />
                    )}
                  </Window>
                );
              })}
          </div>
        </div>
      </div>
    </>
  );
}

export default PersonalPage;
