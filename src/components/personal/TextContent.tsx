import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { parseFrontmatter, formatDate } from "@/lib/frontmatter";

interface TextContentProps {
  content: string;
  filename?: string;
}

export const TextContent: React.FC<TextContentProps> = ({ content, filename = "file.md" }) => {
  const { meta, body } = parseFrontmatter(content);
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
        <div className="prose prose-invert prose-sm max-w-none prose-headings:text-white prose-a:text-green-400 prose-a:no-underline hover:prose-a:underline prose-code:rounded prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-green-300 prose-code:before:content-none prose-code:after:content-none prose-pre:border prose-pre:border-gray-800 prose-pre:bg-gray-950 prose-blockquote:border-l-green-700 prose-blockquote:text-gray-300 prose-img:rounded-lg">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[[rehypeHighlight, { detect: true, ignoreMissing: true }]]}
          >
            {body}
          </ReactMarkdown>
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
