import { useState, useEffect, lazy, Suspense } from 'react';
import fileSystemData from '@/content/filesystem.json';
import { loadFileContent } from '@/lib/loadFileContent';

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
    <div className="w-full max-w-4xl mx-auto p-4">
      {/* Breadcrumb navigation */}
      <div className="flex items-center gap-2 mb-4 text-gray-400">
        <button
          onClick={() => setCurrentPath([])}
          className="hover:text-white"
        >
          root
        </button>
        {currentPath.map((path, index) => {
          const item = fileSystem.find(item => item.id === path);
          return (
            <div key={path} className="flex items-center gap-2">
              <span>/</span>
              <button
                onClick={() => setCurrentPath(currentPath.slice(0, index + 1))}
                className="hover:text-white"
              >
                {item?.name}
              </button>
            </div>
          );
        })}
      </div>

      {/* Content area */}
      {currentContent ? (
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10 shadow-lg">
          <button
            onClick={() => {
              setCurrentContent(null);
              setCurrentFile(null);
              setCurrentPath([]);
            }}
            className="mb-4 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back
          </button>
          <Suspense fallback={<div className="p-4 text-gray-400 text-sm">Loading…</div>}>
            <FileContent
              content={currentContent}
              fileType={currentFile?.fileType || '.md'}
            />
          </Suspense>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2">
          {currentItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item)}
              className="flex items-center gap-2 p-3 rounded-lg hover:bg-gray-800 text-left"
            >
              <span className="text-xl">
                {item.type === "folder" ? "📁" : "📄"}
              </span>
              <span className="text-white">{item.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}