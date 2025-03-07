import React from "react";
import ReactMarkdown from "react-markdown";
import "github-markdown-css/github-markdown.css";

interface TextContentProps {
  content: string;
}

export const TextContent: React.FC<TextContentProps> = ({ content }) => {
  return (
    <>
      <div className="markdown-body p-4 font-macos text-lg">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </>
  );
};
