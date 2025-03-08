import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import fileSystemData from "@/content/filesystem.json";

type FileItem = {
  id: string;
  name: string;
  type: "file" | "folder";
  path: string;
  content?: string;
  children?: FileItem[];
};

type TerminalProps = {
  onOpenFile: (fileId: string) => void;
  fileSystem: FileItem[];
};

type TerminalHistory = {
  command: string;
  output: string;
  isError?: boolean;
};

export function Terminal({ onOpenFile, fileSystem }: TerminalProps) {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<TerminalHistory[]>([
    { 
      command: '', 
      output: "Welcome to Andrew's Digital Garden Terminal!\nType 'help' to see available commands." 
    }
  ]);
  const [currentPath, setCurrentPath] = useState('/');
  const [currentDir, setCurrentDir] = useState<FileItem[]>(fileSystem);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when history changes
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  // Focus input when terminal is clicked
  useEffect(() => {
    const handleClick = () => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    };

    const terminal = terminalRef.current;
    if (terminal) {
      terminal.addEventListener('click', handleClick);
    }

    return () => {
      if (terminal) {
        terminal.removeEventListener('click', handleClick);
      }
    };
  }, []);

  // Find a file or folder by path
  const findItemByPath = (path: string): FileItem[] | null => {
    if (path === '/' || path === '') {
      return fileSystem;
    }

    const parts = path.split('/').filter(Boolean);
    let current: FileItem[] = fileSystem;

    for (const part of parts) {
      if (part === '..') {
        // Go up one level
        const parentPath = '/' + parts.slice(0, parts.indexOf(part) - 1).join('/');
        return findItemByPath(parentPath);
      }

      const found = current.find(item => item.name.toLowerCase() === part.toLowerCase());
      if (!found || found.type !== 'folder') {
        return null;
      }
      current = found.children || [];
    }

    return current;
  };

  // Get current directory name
  const getCurrentDirName = (): string => {
    if (currentPath === '/') {
      return 'root';
    }
    const parts = currentPath.split('/').filter(Boolean);
    return parts[parts.length - 1];
  };

  const handleCommand = (cmd: string) => {
    const args = cmd.trim().split(' ');
    const command = args[0].toLowerCase();
    
    let output = '';
    let isError = false;

    switch (command) {
      case 'help':
        output = `Available commands:
  ls - List files and directories
  cd [path] - Change directory
  cat [file] - Display file contents
  pwd - Show current directory
  clear - Clear terminal
  help - Show this help message`;
        break;

      case 'ls':
        if (currentDir.length === 0) {
          output = 'No files or directories found.';
        } else {
          const folders = currentDir
            .filter(item => item.type === 'folder')
            .map(item => `<span class="text-blue-400">📁 ${item.name}/</span>`);
          
          const files = currentDir
            .filter(item => item.type === 'file')
            .map(item => `<span class="text-green-400">📄 ${item.name}</span>`);
          
          output = [...folders, ...files].join('<br />');
        }
        break;

      case 'cd':
        if (args.length < 2) {
          setCurrentPath('/');
          setCurrentDir(fileSystem);
          output = 'Changed to root directory.';
        } else {
          const targetPath = args[1];
          
          // Handle absolute paths
          let newPath = targetPath.startsWith('/') 
            ? targetPath 
            : currentPath === '/' 
              ? `/${targetPath}` 
              : `${currentPath}/${targetPath}`;
          
          // Handle '..'
          if (targetPath === '..') {
            const parts = currentPath.split('/').filter(Boolean);
            if (parts.length === 0) {
              output = 'Already at root directory.';
              break;
            }
            parts.pop();
            newPath = '/' + parts.join('/');
          }
          
          // Handle '.'
          if (targetPath === '.') {
            output = `Still in ${getCurrentDirName()}.`;
            break;
          }
          
          // Find the directory
          const newDir = findItemByPath(newPath);
          
          if (newDir) {
            setCurrentPath(newPath);
            setCurrentDir(newDir);
            output = `Changed to ${newPath === '/' ? 'root' : newPath} directory.`;
          } else {
            output = `Directory not found: ${targetPath}`;
            isError = true;
          }
        }
        break;

      case 'cat':
        if (args.length < 2) {
          output = 'Usage: cat [filename]';
          isError = true;
        } else {
          const fileName = args[1];
          const file = currentDir.find(
            item => item.type === 'file' && 
            (item.name.toLowerCase() === fileName.toLowerCase() || 
             item.name.toLowerCase() === `${fileName.toLowerCase()}.txt` ||
             item.name.toLowerCase().replace(/\.txt$/, '') === fileName.toLowerCase())
          );
          
          if (file) {
            // Open the file in a window
            onOpenFile(file.id);
            output = `Opening ${file.name}...`;
          } else {
            output = `File not found: ${fileName}`;
            isError = true;
          }
        }
        break;

      case 'pwd':
        output = currentPath;
        break;

      case 'clear':
        setHistory([]);
        return;

      default:
        output = `Command not found: ${command}. Type 'help' for available commands.`;
        isError = true;
    }

    setHistory(prev => [...prev, { command: cmd, output, isError }]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    handleCommand(input);
    setInput('');
  };

  return (
    <div 
      ref={terminalRef}
      className="bg-gray-900 text-green-400 p-4 font-mono text-sm h-full overflow-y-auto"
    >
      {history.map((item, index) => (
        <div key={index} className="mb-2">
          {item.command && (
            <div className="flex">
              <span className="text-blue-400 mr-2">guest@andrews-garden:~{currentPath}$</span>
              <span>{item.command}</span>
            </div>
          )}
          <div 
            className={cn(
              "whitespace-pre-wrap", 
              item.isError ? "text-red-400" : ""
            )}
            dangerouslySetInnerHTML={{ __html: item.output }}
          />
        </div>
      ))}
      
      <form onSubmit={handleSubmit} className="flex">
        <span className="text-blue-400 mr-2">guest@andrews-garden:~{currentPath}$</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-transparent outline-none"
          autoFocus
        />
      </form>
    </div>
  );
} 