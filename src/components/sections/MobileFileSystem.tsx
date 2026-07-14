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
  // From frontmatter, via scripts/updateFilesystem.js.
  title?: string;
  date?: string;
  subtitle?: string;
};

function prettyName(item: FileItem): string {
  return item.title || item.name.replace(/\.(md|markdown)$/i, "").replace(/[-_]+/g, " ");
}

function shortDate(date?: string): string {
  if (!date) return "";
  const d = new Date(`${date}T00:00:00`);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// The three most recent dated files anywhere in the garden.
function recentWriting(items: FileItem[]): FileItem[] {
  const out: FileItem[] = [];
  const walk = (ns: FileItem[]) => {
    for (const n of ns) {
      if (n.type === "folder" && n.children) walk(n.children);
      else if (n.type === "file" && n.date) out.push(n);
    }
  };
  walk(items);
  return out.sort((a, b) => (b.date || "").localeCompare(a.date || "")).slice(0, 3);
}

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
        ~/garden
      </p>
      <h2 className={`text-3xl md:text-5xl font-bold tracking-tight text-term-fg mb-6 animate-on-scroll fade-up ${rv}`} style={{ transitionDelay: '100ms' }}>
        Digital Garden
      </h2>

      {/* Recent writing — surfaced above the browser so fresh growth is one
          tap away. Hidden while reading or browsing inside a folder. */}
      {!currentContent && currentPath.length === 0 && (
        <div className={`mb-6 animate-on-scroll fade-up ${rv}`} style={{ transitionDelay: '150ms' }}>
          <p className="mb-2 font-mono text-xs text-term-faint">recently planted</p>
          <div className="grid grid-cols-1 gap-2">
            {recentWriting(fileSystem).map((item) => (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className="rounded-xl border border-term-border/60 bg-term-elevated/40 px-4 py-3 text-left backdrop-blur-sm transition-all active:scale-[0.98]"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="truncate font-medium text-term-fg">{prettyName(item)}</span>
                  <span className="shrink-0 font-mono text-xs text-term-faint">{shortDate(item.date)}</span>
                </div>
                {item.subtitle && (
                  <p className="mt-0.5 truncate text-sm text-term-dim">{item.subtitle}</p>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

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
              filePath={currentFile?.path}
            />
          </Suspense>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2">
          {currentItems.map((item) => {
            const count = item.type === "folder" ? item.children?.length ?? 0 : 0;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className="group flex items-center gap-3 rounded-xl border border-term-border/50 bg-term-elevated/30 px-4 py-3 text-left backdrop-blur-sm transition-all duration-200 hover:border-term-accent/50 hover:bg-term-elevated/60 active:scale-[0.98]"
              >
                <span className="text-lg opacity-80">
                  {item.type === "folder" ? "📁" : "📄"}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-term-fg transition-colors group-hover:text-term-accent">
                    {item.type === "file" ? prettyName(item) : item.name}
                  </span>
                  {item.type === "file" && item.date && (
                    <span className="block font-mono text-xs text-term-faint">{shortDate(item.date)}</span>
                  )}
                </span>
                {item.type === "folder" ? (
                  <span className="flex shrink-0 items-center gap-2">
                    <span className="font-mono text-xs text-term-faint">{count}</span>
                    <span className="text-term-faint transition-colors group-hover:text-term-accent">→</span>
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}