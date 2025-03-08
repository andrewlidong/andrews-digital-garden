import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import "github-markdown-css/github-markdown.css";

interface TextContentProps {
  content: string;
}

export const TextContent: React.FC<TextContentProps> = ({ content }) => {
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
    <>
      <div className="markdown-body p-4 font-mono text-green-300 bg-gray-900">
        <div className="flex items-start mb-4">
          <span className="text-green-500 mr-2 whitespace-nowrap">andrew@digital-garden:~$</span>
          <span className="text-yellow-300 whitespace-nowrap">cat file.md</span>
        </div>
        <div className="border-l-2 border-gray-700 pl-4 ml-2">
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
    </>
  );
};
