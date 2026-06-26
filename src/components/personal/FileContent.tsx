import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { parseFrontmatter, formatDate } from '@/lib/frontmatter';

interface FileContentProps {
  content: string;
  fileType: string;
}

export const FileContent: React.FC<FileContentProps> = ({ content, fileType }) => {
  const renderContent = () => {
    switch (fileType.toLowerCase()) {
      case '.md':
      case '.markdown': {
        const { meta, body } = parseFrontmatter(content);
        return (
          <div>
            {(meta.title || meta.date) && (
              <div className="mb-5 border-l-2 border-term-green pl-4">
                {meta.title && (
                  <h1 className="text-2xl font-bold text-term-fg">{meta.title}</h1>
                )}
                {meta.subtitle && (
                  <p className="mt-1 text-sm text-term-dim">{meta.subtitle}</p>
                )}
                {meta.date && (
                  <p className="mt-1 text-xs text-term-faint">{formatDate(meta.date)}</p>
                )}
              </div>
            )}
            <div className="prose prose-invert max-w-none prose-headings:text-term-fg prose-p:text-term-fg prose-li:text-term-fg prose-strong:text-term-fg prose-a:text-term-accent prose-a:no-underline hover:prose-a:underline prose-code:rounded prose-code:bg-term-elevated prose-code:px-1.5 prose-code:py-0.5 prose-code:text-term-green prose-code:before:content-none prose-code:after:content-none prose-pre:border prose-pre:border-term-border prose-pre:bg-term-inset prose-blockquote:border-l-term-accent prose-blockquote:text-term-dim prose-img:rounded-lg">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[[rehypeHighlight, { detect: true, ignoreMissing: true }]]}
              >
                {body}
              </ReactMarkdown>
            </div>
          </div>
        );
      }
      case '.txt':
      case '.log':
        return (
          <pre className="whitespace-pre-wrap font-mono text-term-fg bg-term-inset p-4 rounded-lg">
            {content}
          </pre>
        );
      case '.json':
        return (
          <pre className="whitespace-pre-wrap font-mono text-term-fg bg-term-inset p-4 rounded-lg">
            {JSON.stringify(JSON.parse(content), null, 2)}
          </pre>
        );
      case '.js':
      case '.ts':
      case '.jsx':
      case '.tsx':
      case '.py':
      case '.java':
      case '.cpp':
      case '.c':
      case '.h':
      case '.hpp':
        return (
          <pre className="whitespace-pre-wrap font-mono text-term-fg bg-term-inset p-4 rounded-lg">
            {content}
          </pre>
        );
      default:
        return (
          <div className="text-term-dim italic">
            Preview not available for {fileType} files
          </div>
        );
    }
  };

  return (
    <div className="bg-term-bg rounded-lg p-6 border border-term-border shadow-lg">
      {renderContent()}
    </div>
  );
};