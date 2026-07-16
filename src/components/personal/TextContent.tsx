import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { parseFrontmatter, formatDate } from "@/lib/frontmatter";
import { remarkWikilinks, getBacklinks } from "@/lib/wikilinks";
import { remarkCallouts } from "@/lib/callouts";
import { useInternalLinkNav } from "@/lib/useInternalLinkNav";

interface TextContentProps {
  content: string;
  filename?: string;
  /** /files/... path of this file — enables the "linked from" footer. */
  filePath?: string;
  /**
   * When set, wikilinks to garden pages open via this callback (the desktop
   * opens them in a new window — parallel browsing) instead of navigating
   * to the reader. Return false to fall back to navigation.
   */
  onOpenWikilink?: (filePath: string) => boolean;
}

export const TextContent: React.FC<TextContentProps> = ({ content, filename = "file.md", filePath, onOpenWikilink }) => {
  const { meta, body } = parseFrontmatter(content);
  const backlinks = filePath ? getBacklinks(filePath) : [];
  const navFallback = useInternalLinkNav();
  const onProseClick = (e: React.MouseEvent) => {
    if (onOpenWikilink && e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
      const a = (e.target as HTMLElement).closest("a");
      const href = a?.getAttribute("href") || "";
      if (a && href.startsWith("/read/")) {
        const rel = href.replace(/^\/read\//, "").split("/").map(decodeURIComponent).join("/");
        if (onOpenWikilink(`/files/${rel}.md`)) {
          e.preventDefault();
          return;
        }
      }
    }
    navFallback(e);
  };
  const [displayedContent, setDisplayedContent] = useState("");
  const [typingComplete, setTypingComplete] = useState(false);

  useEffect(() => {
    if (!body) {
      setTypingComplete(true);
      return;
    }

    let currentIndex = 0;
    // A quick reveal: large chunks so even long notes finish in well under a
    // second, then we swap to fully rendered markdown.
    const typingSpeed = Math.max(20, Math.ceil(body.length / 60));

    setDisplayedContent("");
    setTypingComplete(false);

    const typingInterval = setInterval(() => {
      if (currentIndex < body.length) {
        currentIndex += typingSpeed;
        setDisplayedContent(body.substring(0, currentIndex));
      } else {
        clearInterval(typingInterval);
        setTypingComplete(true);
      }
    }, 16);

    return () => clearInterval(typingInterval);
  }, [body]);

  return (
    <div className="w-full h-full bg-term-bg">
      {/* Terminal flourish */}
      <div className="flex items-start mb-4 font-mono text-sm">
        <span className="text-term-green mr-2 whitespace-nowrap">andrew@digital-garden:~$</span>
        <span className="text-term-yellow whitespace-nowrap">cat {filename}</span>
      </div>

      {/* Post header from frontmatter */}
      {(meta.title || meta.date) && (
        <div className="mb-5 border-l-2 border-term-green pl-4">
          {meta.title && (
            <h1 className="text-xl font-bold text-term-fg">{meta.title}</h1>
          )}
          {meta.subtitle && (
            <p className="mt-1 text-sm text-term-dim">{meta.subtitle}</p>
          )}
          {meta.date && (
            <p className="mt-1 text-xs text-term-faint">{formatDate(meta.date)}</p>
          )}
          <p className="mt-2 text-xs text-term-faint font-mono">
            Tip: click the green ⤢ button to read full screen.
          </p>
        </div>
      )}

      {typingComplete ? (
        <div onClick={onProseClick} className="prose prose-invert prose-sm max-w-none prose-headings:text-term-fg prose-p:text-term-fg prose-li:text-term-fg prose-strong:text-term-fg prose-a:text-term-accent prose-a:no-underline hover:prose-a:underline prose-code:rounded prose-code:bg-term-elevated prose-code:px-1.5 prose-code:py-0.5 prose-code:text-term-green prose-code:before:content-none prose-code:after:content-none prose-pre:border prose-pre:border-term-border prose-pre:bg-term-inset prose-blockquote:border-l-term-accent prose-blockquote:text-term-dim prose-img:rounded-lg">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkWikilinks, remarkCallouts]}
            rehypePlugins={[[rehypeHighlight, { detect: true, ignoreMissing: true }]]}
          >
            {body}
          </ReactMarkdown>
          {filePath && /^\/files\/(blog|notes)\//.test(filePath) && (
            <p className="not-prose mt-8 select-none text-right font-mono text-sm text-term-faint">
              — andrew dong
            </p>
          )}
          {backlinks.length > 0 && (
            <div className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-t border-term-border pt-3 font-mono text-xs not-prose">
              <span className="text-term-faint">linked from:</span>
              {backlinks.map((bl) => (
                <Link
                  key={bl.path}
                  to={bl.to}
                  className="text-term-dim no-underline hover:text-term-accent"
                >
                  ~/{bl.section}/{bl.title}
                </Link>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="font-mono text-sm text-term-green">
          <span className="whitespace-pre-wrap">{displayedContent}</span>
          <span className="animate-pulse">▌</span>
        </div>
      )}
    </div>
  );
};
