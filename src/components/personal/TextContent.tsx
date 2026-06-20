import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import "github-markdown-css/github-markdown.css";

interface TextContentProps {
  content: string;
  filename?: string;
}

export const TextContent: React.FC<TextContentProps> = ({ content, filename = "file.md" }) => {
  const [displayedContent, setDisplayedContent] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [typingComplete, setTypingComplete] = useState(false);

  useEffect(() => {
    if (!content) return;

    let currentIndex = 0;
    const typingSpeed = 5; // Characters per frame
    
    // Reset if content changes
    setDisplayedContent("");
    setIsTyping(true);
    setTypingComplete(false);
    
    const typingInterval = setInterval(() => {
      if (currentIndex < content.length) {
        // Type multiple characters at once for better performance with long content
        const nextChunk = content.substring(
          currentIndex, 
          Math.min(currentIndex + typingSpeed, content.length)
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
  }, [content]);

  return (
    <div className="w-full h-full markdown-body font-mono text-term-fg">
      <div className="flex items-start mb-4">
        <span className="text-term-green mr-2 whitespace-nowrap">andrew@digital-garden:~$</span>
        <span className="text-term-yellow whitespace-nowrap">cat {filename}</span>
      </div>
      <div className="border-l-2 border-term-border pl-4 ml-2">
        {typingComplete ? (
          <ReactMarkdown>{content}</ReactMarkdown>
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
