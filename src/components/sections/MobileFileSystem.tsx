import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import fileSystemData from '@/content/filesystem.json';
import { loadFileContent } from '@/lib/loadFileContent';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

const FileContent = lazy(() =>
  import('../personal/FileContent').then((m) => ({ default: m.FileContent }))
);

export type FileItem = {
  id: string;
  name: string;
  type: "file" | "folder";
  path: string;
  fileType?: string;
  content?: string;
  children?: FileItem[];
};

interface MobileFileSystemProps {
  currentContent: string | null;
  setCurrentContent: (content: string | null) => void;
  currentFile: FileItem | null;
  setCurrentFile: (file: FileItem | null) => void;
}

export function MobileFileSystem({
  currentContent,
  setCurrentContent,
  currentFile,
  setCurrentFile
}: MobileFileSystemProps) {
  const [fileSystem, setFileSystem] = useState<FileItem[]>([]);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const revealRef = useRef<HTMLDivElement>(null);
  const rv = useIntersectionObserver(revealRef, { threshold: 0.1, once: true }) ? "is-visible" : "";

  useEffect(() => {
    // Set up the file tree structure. File contents are loaded lazily when a
    // file is tapped (see handleItemClick), not eagerly for every file at once.
    setFileSystem(fileSystemData as FileItem[]);
  }, []);

  const getCurrentItems = () => {
    let items = fileSystem;
    for (const path of currentPath) {
      const folder = items.find(item => item.id === path);
      if (folder?.type === "folder" && folder.children) {
        items = folder.children;
      } else {
        return [];
      }
    }
    return items;
  };

  const handleItemClick = async (item: FileItem) => {
    if (item.type === "folder") {
      setCurrentPath([...currentPath, item.id]);
      setCurrentContent(null);
      setCurrentFile(null);
    } else if (item.type === "file" && item.path) {
      const fileType = `.${item.path.split('.').pop()?.toLowerCase() || ''}`;
      // Show the file immediately with a loading placeholder, then fetch.
      setCurrentContent("Loading…");
      setCurrentFile({ ...item, fileType });
      const content = await loadFileContent(item.path);
      setCurrentContent(content);
      setCurrentFile({ ...item, content, fileType });
    }
  };

  const currentItems = getCurrentItems();

  return (
    <div ref={revealRef} className="w-full mx-auto">
      <p className={`font-mono text-sm text-term-accent mb-2 animate-on-scroll fade-up ${rv}`}>
        ~/notes
      </p>
      <h2 className={`text-3xl md:text-5xl font-bold tracking-tight text-term-fg mb-6 animate-on-scroll fade-up ${rv}`} style={{ transitionDelay: '100ms' }}>
        Notes
      </h2>

      {/* Breadcrumb navigation */}
      <div className="flex items-center gap-2 mb-4 font-mono text-sm text-term-faint">
        <button
          onClick={() => setCurrentPath([])}
          className="transition-colors hover:text-term-accent"
        >
          root
        </button>
        {currentPath.map((path, index) => {
          const item = fileSystem.find(item => item.id === path);
          return (
            <div key={path} className="flex items-center gap-2">
              <span className="text-term-border">/</span>
              <button
                onClick={() => setCurrentPath(currentPath.slice(0, index + 1))}
                className="transition-colors hover:text-term-accent"
              >
                {item?.name}
              </button>
            </div>
          );
        })}
      </div>

      {/* Content area */}
      {currentContent ? (
        <div className="rounded-xl border border-term-border/70 bg-term-elevated/40 p-5 backdrop-blur-sm shadow-lg">
          <button
            onClick={() => {
              setCurrentContent(null);
              setCurrentFile(null);
              setCurrentPath([]);
            }}
            className="mb-4 flex items-center gap-2 rounded-lg border border-term-border/70 bg-term-bg/50 px-3 py-1.5 text-sm text-term-dim transition-colors hover:text-term-accent hover:border-term-accent/50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back
          </button>
          <Suspense fallback={<div className="p-4 text-term-dim text-sm">Loading…</div>}>
            <FileContent
              content={currentContent}
              fileType={currentFile?.fileType || '.md'}
            />
          </Suspense>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-1.5">
          {currentItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item)}
              className="group flex items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 text-left transition-all duration-200 hover:border-term-border/70 hover:bg-term-elevated/50 active:scale-[0.99]"
            >
              <span className="text-lg opacity-80">
                {item.type === "folder" ? "📁" : "📄"}
              </span>
              <span className="text-term-fg group-hover:text-term-accent transition-colors">{item.name}</span>
              {item.type === "folder" && (
                <span className="ml-auto text-term-faint transition-colors group-hover:text-term-accent">→</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}