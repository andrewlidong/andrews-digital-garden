import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import "github-markdown-css/github-markdown.css";
import { parseFrontmatter, formatDate } from "@/lib/frontmatter";

interface TextContentProps {
  content: string;
  filename?: string;
}

export const TextContent: React.FC<TextContentProps> = ({ content, filename = "file.md" }) => {
  const { meta, body } = parseFrontmatter(content);
  const [displayedContent, setDisplayedContent] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [typingComplete, setTypingComplete] = useState(false);

  useEffect(() => {
    if (!body) return;

    let currentIndex = 0;
    const typingSpeed = 5; // Characters per frame

    // Reset if content changes
    setDisplayedContent("");
    setIsTyping(true);
    setTypingComplete(false);

    const typingInterval = setInterval(() => {
      if (currentIndex < body.length) {
        // Type multiple characters at once for better performance with long content
        const nextChunk = body.substring(
          currentIndex,
          Math.min(currentIndex + typingSpeed, body.length)
        );
        setDisplayedContent(prev => prev + nextChunk);
        currentIndex += typingSpeed;
      } else {
        clearInterval(typingInterval);
        setIsTyping(false);
        setTypingComplete(true);
      }
    }, 10);

    return () => clearInterval(typingInterval);
  }, [body]);

  return (
    <div className="w-full h-full markdown-body font-mono text-green-300 bg-gray-900">
      <div className="flex items-start mb-4">
        <span className="text-green-500 mr-2 whitespace-nowrap">andrew@digital-garden:~$</span>
        <span className="text-yellow-300 whitespace-nowrap">cat {filename}</span>
      </div>

      {/* Post header from frontmatter */}
      {(meta.title || meta.date) && (
        <div className="mb-4 ml-2 border-l-2 border-green-700 pl-4">
          {meta.title && (
            <h1 className="text-xl font-bold text-white">{meta.title}</h1>
          )}
          {meta.subtitle && (
            <p className="text-sm text-gray-400">{meta.subtitle}</p>
          )}
          {meta.date && (
            <p className="mt-1 text-xs text-gray-500">{formatDate(meta.date)}</p>
          )}
          <p className="mt-2 text-xs text-gray-600">
            Tip: click the green ⤢ button to read full screen.
          </p>
        </div>
      )}

      <div className="border-l-2 border-gray-700 pl-4 ml-2">
        {typingComplete ? (
          <ReactMarkdown>{body}</ReactMarkdown>
        ) : (
          <>
            <div className="whitespace-pre-wrap">{displayedContent}</div>
            {isTyping && <span className="animate-pulse">▌</span>}
          </>
        )}
      </div>
    </div>
  );
};
