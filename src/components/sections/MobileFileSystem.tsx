import { useState, useEffect } from 'react';
import fileSystemData from '@/content/filesystem.json';
import { FileContent } from '../personal/FileContent';

type FileItem = {
  id: string;
  name: string;
  type: "file" | "folder";
  path: string;
  fileType?: string;
  content?: string;
  children?: FileItem[];
};

export function MobileFileSystem() {
  const [fileSystem, setFileSystem] = useState<FileItem[]>([]);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [currentContent, setCurrentContent] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState<FileItem | null>(null);

  useEffect(() => {
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

    const initializeFileSystem = async () => {
      const processedFileSystem = await loadContent(fileSystemData as FileItem[]);
      setFileSystem(processedFileSystem);
    };

    initializeFileSystem();
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

  const handleItemClick = (item: FileItem) => {
    if (item.type === "folder") {
      setCurrentPath([...currentPath, item.id]);
      setCurrentContent(null);
      setCurrentFile(null);
    } else if (item.type === "file" && item.content) {
      setCurrentContent(item.content);
      setCurrentFile(item);
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
            onClick={() => setCurrentContent(null)}
            className="mb-4 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back
          </button>
          <FileContent
            content={currentContent}
            fileType={currentFile?.fileType || '.md'}
          />
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