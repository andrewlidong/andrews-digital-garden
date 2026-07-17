import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { readerPath } from '@/lib/frontmatter';
import type { Theme } from '@/lib/themes';

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
  // Launch a desktop app window (tetris, radio, paint).
  onOpenApp?: (appId: string) => void;
  fileSystem: FileItem[];
  // A command to run automatically (e.g. one typed in the home-page prompt).
  initialCommand?: string;
  // Bumped each time a new initialCommand should run, so repeated commands re-fire.
  commandNonce?: number;
  // Theme registry + active id + setter, so the `theme` command can switch the rice.
  themes?: Theme[];
  themeId?: string;
  onSetTheme?: (id: string) => void;
  // Close the terminal window (e.g. when the user presses Escape).
  onClose?: () => void;
  // Cheat codes: `grow` blooms the banner; `rm -rf` deletes the garden.
  onGrow?: () => void;
  onNuke?: () => void;
};

type TerminalHistory = {
  command: string;
  output: string;
  isError?: boolean;
};

export function Terminal({ onOpenFile, onOpenApp, fileSystem, initialCommand, commandNonce, themes, themeId, onSetTheme, onClose, onGrow, onNuke }: TerminalProps) {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<TerminalHistory[]>([
    {
      command: '',
      output: "Welcome to Andrew's Digital Garden Terminal!\nType 'help' to see available commands."
    }
  ]);
  const [currentPath, setCurrentPath] = useState('/');
  const [currentDir, setCurrentDir] = useState<FileItem[]>(fileSystem);
  // The vim trap: entered with a bare `vim`, escaped only with :q. Tracks
  // every keystroke spent inside so the exit line can report the toll.
  const [vimTrap, setVimTrap] = useState<{ keys: number; log: string[] } | null>(null);
  const trainRunning = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

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

  // `sl` — the classic typo punishment: a little steam train crosses the
  // terminal. Animates by rewriting the last history entry frame by frame.
  const runTrain = (cmd: string) => {
    if (trainRunning.current) return;
    trainRunning.current = true;
    const TRAIN = [
      '         (  ) (  )',
      '       ____    ____ _________ _________ ',
      '   ___|_||_|__|    |  o   o  |  o   o  |',
      '  | _   ___   |[]  |         |         |',
      '  |(_)-(_)-(_)|____|_(_)—(_)_|_(_)—(_)_|',
    ];
    const width = Math.max(...TRAIN.map((l) => l.length));
    // The visible track: frames are clipped to this many columns, so the
    // train steams in from the right edge instead of materializing whole
    // (and long lines never soft-wrap into soup).
    const VIEW = 58;
    setHistory((prev) => [...prev, { command: cmd, output: '' }]);
    let col = VIEW;
    const timer = setInterval(() => {
      col -= 3;
      const frame = TRAIN.map((line) => {
        const laid = col >= 0 ? ' '.repeat(col) + line : line.slice(-col);
        return laid.slice(0, VIEW);
      }).join('\n');
      setHistory((prev) => {
        const next = [...prev];
        next[next.length - 1] = { command: cmd, output: frame };
        return next;
      });
      if (col <= -width) {
        clearInterval(timer);
        trainRunning.current = false;
        setHistory((prev) => {
          const next = [...prev];
          next[next.length - 1] = {
            command: cmd,
            output: '<span class="text-term-faint">the train has left the garden. (you meant `ls`.)</span>',
          };
          return next;
        });
      }
    }, 90);
  };

  // `fortune` — the garden quotes itself: a random sentence from a random
  // blog post or note.
  const runFortune = (cmd: string) => {
    const files: FileItem[] = [];
    const collect = (ns: FileItem[]) => {
      for (const n of ns) {
        if (n.type === 'folder') collect(n.children || []);
        else if (/\.(md|markdown)$/i.test(n.name) && n.path) files.push(n);
      }
    };
    collect(fileSystem);
    if (files.length === 0) {
      setHistory((prev) => [...prev, { command: cmd, output: 'The oracle is silent.', isError: true }]);
      return;
    }
    const pick = files[Math.floor(Math.random() * files.length)];
    setHistory((prev) => [...prev, { command: cmd, output: 'consulting the garden…' }]);
    fetch(pick.path)
      .then((r) => r.text())
      .then((text) => {
        const body = text
          .replace(/^﻿?---\s*\n[\s\S]*?\n---\s*\n?/, '')
          .replace(/```[\s\S]*?```/g, ' ')
          .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
          .replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_m, a, b) => b || a)
          .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
          .replace(/[#*_`~>|]/g, '')
          .replace(/<[^>]*>/g, ' ')
          .replace(/\s+/g, ' ');
        const sentences = body.match(/[A-Z“"'][^.!?]{30,170}[.!?]/g) || [];
        const label = pick.path.replace(/^\/files\//, '~/').replace(/\.(md|markdown)$/i, '');
        const line = sentences.length
          ? sentences[Math.floor(Math.random() * sentences.length)].trim()
          : null;
        setHistory((prev) => {
          const next = [...prev];
          next[next.length - 1] = {
            command: cmd,
            output: line
              ? `“${line.replace(/</g, '&lt;')}”\n<span class="text-term-faint">— ${label}</span>`
              : 'The oracle mumbled something illegible. Try again.',
          };
          return next;
        });
      })
      .catch(() => {
        setHistory((prev) => {
          const next = [...prev];
          next[next.length - 1] = { command: cmd, output: 'The oracle is offline.', isError: true };
          return next;
        });
      });
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
  cat [file] - Open file in a window
  vim [file] - Open file full screen (alias: nvim)
  pwd - Show current directory
  theme - List or switch color themes (try 'theme list')
  graph - Visualize the garden and its wikilinks
  neofetch - Show garden system info
  clear - Clear terminal
  help - Show this help message

psst: this terminal keeps a few secrets. old cheat codes still work.`;
        break;

      case 'neofetch': {
        const countIn = (folder: string) => {
          const node = fileSystem.find((f) => f.type === 'folder' && f.name === folder);
          return node?.children?.filter((c) => c.type === 'file').length ?? 0;
        };
        const activeTheme = themes?.find((t) => t.id === themeId);
        const art = [
          '   <span class="text-term-magenta"> @..@ </span>',
          '   <span class="text-term-magenta">(----)</span>',
          '   <span class="text-term-green">( >__< )</span>',
          '   <span class="text-term-green">^^ ~~ ^^</span>',
        ];
        const info = [
          `<span class="text-term-accent">andrew</span>@<span class="text-term-accent">digital-garden</span>`,
          '----------------------',
          `<span class="text-term-yellow">OS</span>: AndrewOS (garden edition)`,
          `<span class="text-term-yellow">Host</span>: andrewlidong.xyz`,
          `<span class="text-term-yellow">Shell</span>: garden-sh`,
          `<span class="text-term-yellow">Theme</span>: ${activeTheme?.name ?? 'unknown'}`,
          `<span class="text-term-yellow">Posts</span>: ${countIn('blog')}`,
          `<span class="text-term-yellow">Projects</span>: ${countIn('projects')}`,
          `<span class="text-term-yellow">Notes</span>: ${countIn('notes')}`,
          `<span class="text-term-yellow">Webring</span>: recurse ring, member #46`,
          `<span class="text-term-yellow">Last updated</span>: ${__LAST_UPDATED__} (${__COMMIT_HASH__})`,
        ];
        const rows = Math.max(art.length, info.length);
        const lines = [];
        for (let i = 0; i < rows; i++) {
          lines.push(`${(art[i] || '        ').padEnd(8)}   ${info[i] || ''}`);
        }
        output = lines.join('\n');
        break;
      }

      case 'tetris':
      case 'radio':
      case 'paint':
      case 'graph':
        if (onOpenApp) {
          onOpenApp(command);
          output =
            command === 'tetris'
              ? 'Launching tetris-one-thousand… everyone on this site shares one board. Play nice.'
              : command === 'radio'
                ? 'Turning the dial…'
                : command === 'graph'
                  ? 'Mapping the garden…'
                  : 'Fetching brushes…';
        } else {
          output = `${command} is not available here.`;
          isError = true;
        }
        break;

      case 'theme': {
        if (!themes || !onSetTheme) {
          output = 'Themes are not available.';
          isError = true;
          break;
        }
        const sub = (args[1] || '').toLowerCase();
        const active = themes.find((t) => t.id === themeId);

        if (!sub || sub === 'list') {
          const rows = themes.map((t) => {
            const marker = t.id === themeId ? '<span class="text-term-accent">*</span>' : ' ';
            const swatch = `<span style="color:${t.tokens.accent}">●</span><span style="color:${t.tokens.green}">●</span><span style="color:${t.tokens.yellow}">●</span>`;
            return `  ${marker} ${swatch} <span class="text-term-fg">${t.id.padEnd(18)}</span><span class="text-term-faint">${t.name}</span>`;
          });
          output = `Available themes (current: <span class="text-term-accent">${active?.name ?? 'unknown'}</span>):<br/>${rows.join('<br/>')}<br/><br/>Switch with: <span class="text-term-yellow">theme set &lt;id&gt;</span>`;
        } else if (sub === 'set') {
          const id = (args[2] || '').toLowerCase();
          const match = themes.find((t) => t.id === id);
          if (!id) {
            output = "Usage: theme set &lt;id&gt;  (run 'theme list' to see ids)";
            isError = true;
          } else if (!match) {
            output = `Unknown theme: ${id}. Run 'theme list' to see available ids.`;
            isError = true;
          } else {
            onSetTheme(match.id);
            output = `Theme set to <span class="text-term-accent">${match.name}</span>.`;
          }
        } else {
          // Allow the shorthand `theme <id>`.
          const match = themes.find((t) => t.id === sub);
          if (match) {
            onSetTheme(match.id);
            output = `Theme set to <span class="text-term-accent">${match.name}</span>.`;
          } else {
            output = `Usage: theme list | theme set &lt;id&gt;`;
            isError = true;
          }
        }
        break;
      }

      case 'ls':
        if (currentDir.length === 0) {
          output = 'No files or directories found.';
        } else {
          const folders = currentDir
            .filter(item => item.type === 'folder')
            .map(item => `<span class="text-term-accent">📁 ${item.name}/</span>`);

          const files = currentDir
            .filter(item => item.type === 'file')
            .map(item => `<span class="text-term-green">📄 ${item.name}</span>`);
          
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

      case 'grow':
      case 'bloom':
        if (onGrow) {
          onGrow();
          output = `<span class="text-term-green">the garden hears you. look up. ❀</span>`;
        } else {
          output = 'nothing grows here.';
          isError = true;
        }
        break;

      case 'xyzzy':
        output = 'Nothing happens.';
        break;

      case 'sl':
        runTrain(cmd);
        return;

      case 'fortune':
        runFortune(cmd);
        return;

      case 'rm': {
        const flags = args.slice(1).filter((a) => a.startsWith('-')).join('');
        if (flags.includes('r') && flags.includes('f')) {
          if (onNuke) {
            output = 'rm: removing everything…';
            setHistory((prev) => [...prev, { command: cmd, output }]);
            setTimeout(() => onNuke(), 500);
            return;
          }
          output = 'rm: the garden is read-only here.';
          isError = true;
        } else if (args.length < 2) {
          output = 'rm: missing operand';
          isError = true;
        } else {
          output = `rm: cannot remove '${args[1]}': Permission denied (try harder)`;
          isError = true;
        }
        break;
      }

      case 'vim':
      case 'nvim':
      case 'edit':
        if (args.length < 2) {
          if (command === 'vim' || command === 'nvim') {
            // No file: welcome to the trap. Escape is :q — everything else
            // just runs up the keystroke counter.
            setVimTrap({ keys: 0, log: [] });
            return;
          }
          output = `Usage: ${command} [filename]`;
          isError = true;
        } else {
          const fileName = args[1];
          const file = currentDir.find(
            item => item.type === 'file' &&
            (item.name.toLowerCase() === fileName.toLowerCase() ||
             item.name.toLowerCase() === `${fileName.toLowerCase()}.md` ||
             item.name.toLowerCase().replace(/\.md$/, '') === fileName.toLowerCase())
          );

          if (file && file.path) {
            output = `Opening ${file.name} full screen...`;
            setHistory(prev => [...prev, { command: cmd, output, isError }]);
            setTimeout(() => navigate(readerPath(file.path)), 150);
            return;
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
    if (vimTrap) {
      const entry = input.trim();
      setInput('');
      if (/^:(q!?|quit|wq!?|x|exit)$/i.test(entry)) {
        const toll = vimTrap.keys;
        setVimTrap(null);
        setHistory((prev) => [
          ...prev,
          {
            command: 'vim',
            output: `you escaped vim after <span class="text-term-yellow">${toll}</span> keystrokes. most never do.`,
          },
        ]);
        return;
      }
      const hints = [
        "this isn't insert mode. this isn't even vim.",
        'E492: Not an editor command. (the way out rhymes with "colon q")',
        ':q',
      ];
      const line = entry.startsWith(':')
        ? `E492: Not an editor command: ${entry.slice(1).replace(/</g, '&lt;')}`
        : hints[Math.min(vimTrap.log.length, hints.length - 1)];
      setVimTrap({ ...vimTrap, log: [...vimTrap.log.slice(-3), line] });
      return;
    }
    if (!input.trim()) return;

    handleCommand(input);
    setInput('');
  };

  const COMMANDS = ['help', 'ls', 'cd', 'cat', 'vim', 'nvim', 'edit', 'pwd', 'theme', 'clear'];
  // Commands that take a file argument (for argument completion).
  const FILE_COMMANDS = ['cat', 'vim', 'nvim', 'edit'];

  // Find the longest common prefix shared by all candidate strings.
  const longestCommonPrefix = (items: string[]): string => {
    if (items.length === 0) return '';
    let prefix = items[0];
    for (const item of items.slice(1)) {
      while (!item.toLowerCase().startsWith(prefix.toLowerCase())) {
        prefix = prefix.slice(0, -1);
        if (!prefix) return '';
      }
    }
    return prefix;
  };

  // Tab completion: complete command names (first word) or file/folder names
  // (arguments to cd/cat) based on the current directory.
  const handleTabComplete = () => {
    const trimmedStart = input.replace(/^\s+/, '');
    const parts = trimmedStart.split(/\s+/);
    const completingCommand = parts.length === 1 && !/\s$/.test(input);

    let candidates: string[];
    let fragment: string;
    let prefixToKeep: string;

    if (completingCommand) {
      fragment = parts[0];
      candidates = COMMANDS.filter(c => c.startsWith(fragment.toLowerCase()));
      prefixToKeep = '';
    } else {
      // Completing an argument (file or folder name in the current directory).
      const command = parts[0].toLowerCase();
      const isFileCommand = FILE_COMMANDS.includes(command);
      if (command !== 'cd' && !isFileCommand) return;

      fragment = /\s$/.test(input) ? '' : parts[parts.length - 1];
      const matches = currentDir.filter(item =>
        item.name.toLowerCase().startsWith(fragment.toLowerCase())
      );
      // File commands only operate on files; cd only on folders.
      const filtered =
        command === 'cd'
          ? matches.filter(item => item.type === 'folder')
          : matches.filter(item => item.type === 'file');
      candidates = filtered.map(item =>
        item.type === 'folder' ? `${item.name}/` : item.name
      );
      prefixToKeep = command + ' ';
    }

    if (candidates.length === 0) return;

    if (candidates.length === 1) {
      setInput(prefixToKeep + candidates[0]);
      return;
    }

    const common = longestCommonPrefix(candidates);
    if (common.length > fragment.length) {
      setInput(prefixToKeep + common);
    } else {
      // Multiple matches with no further common prefix: list them.
      setHistory(prev => [
        ...prev,
        { command: input, output: candidates.join('    ') },
      ]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (vimTrap) {
      // Every keystroke inside the trap counts toward the toll — and Escape
      // closes nothing here. This is vim.
      setVimTrap((t) => (t ? { ...t, keys: t.keys + 1 } : t));
      if (e.key === 'Escape' || e.key === 'Tab') e.preventDefault();
      return;
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      handleTabComplete();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose?.();
    }
  };

  // Run a command handed in from outside (e.g. typed in the home-page prompt).
  // Fires whenever commandNonce changes. The ref guards against running the
  // same nonce twice (e.g. StrictMode's double-invoke of effects in dev).
  const lastRunNonceRef = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (
      initialCommand &&
      initialCommand.trim() &&
      commandNonce !== lastRunNonceRef.current
    ) {
      lastRunNonceRef.current = commandNonce;
      handleCommand(initialCommand);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commandNonce]);

  if (vimTrap) {
    return (
      <div
        ref={terminalRef}
        className="bg-term-bg p-4 font-mono text-sm h-full overflow-y-auto flex flex-col"
        onClick={() => inputRef.current?.focus()}
      >
        <div className="flex-1 text-term-accent whitespace-pre-wrap">
          {Array.from({ length: 9 }, () => '~').join('\n')}
        </div>
        {vimTrap.log.map((line, i) => (
          <div key={i} className="text-term-red" dangerouslySetInnerHTML={{ __html: line }} />
        ))}
        <div className="flex justify-between bg-term-elevated px-2 py-0.5 text-term-fg">
          <span>"[No Name]" 0 lines — i still haven't learned it bruce</span>
          <span className="text-term-faint">keystrokes: {vimTrap.keys}</span>
        </div>
        <form onSubmit={handleSubmit} className="flex">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="vim command"
            className="flex-1 bg-transparent outline-none text-term-fg"
            autoFocus
          />
        </form>
      </div>
    );
  }

  return (
    <div
      ref={terminalRef}
      className="bg-term-bg text-term-green p-4 font-mono text-sm h-full overflow-y-auto"
    >
      {history.map((item, index) => (
        <div key={index} className="mb-2">
          {item.command && (
            <div className="flex">
              <span className="text-term-accent mr-2">guest@andrews-garden:~{currentPath}$</span>
              <span className="text-term-fg">{item.command}</span>
            </div>
          )}
          <div
            className={cn(
              "whitespace-pre-wrap",
              item.isError ? "text-term-red" : ""
            )}
            dangerouslySetInnerHTML={{ __html: item.output }}
          />
        </div>
      ))}

      <form onSubmit={handleSubmit} className="flex">
        <span className="text-term-accent mr-2">guest@andrews-garden:~{currentPath}$</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent outline-none text-term-fg"
          autoFocus
        />
      </form>
    </div>
  );
} 