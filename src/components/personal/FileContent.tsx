import React from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { parseFrontmatter, formatDate } from '@/lib/frontmatter';
import { remarkWikilinks, getBacklinks } from '@/lib/wikilinks';
import { remarkCallouts } from '@/lib/callouts';
import { useInternalLinkNav } from '@/lib/useInternalLinkNav';

interface FileContentProps {
  content: string;
  fileType: string;
  /** /files/... path of this file — enables the "linked from" footer. */
  filePath?: string;
}

export const FileContent: React.FC<FileContentProps> = ({ content, fileType, filePath }) => {
  const backlinks = filePath ? getBacklinks(filePath) : [];
  const onProseClick = useInternalLinkNav();
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
            <div onClick={onProseClick} className="prose prose-invert max-w-none prose-headings:text-term-fg prose-p:text-term-fg prose-li:text-term-fg prose-strong:text-term-fg prose-a:text-term-accent prose-a:no-underline hover:prose-a:underline prose-code:rounded prose-code:bg-term-elevated prose-code:px-1.5 prose-code:py-0.5 prose-code:text-term-green prose-code:before:content-none prose-code:after:content-none prose-pre:border prose-pre:border-term-border prose-pre:bg-term-inset prose-blockquote:border-l-term-accent prose-blockquote:text-term-dim prose-img:rounded-lg">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkWikilinks, remarkCallouts]}
                rehypePlugins={[[rehypeHighlight, { detect: true, ignoreMissing: true }]]}
              >
                {body}
              </ReactMarkdown>
            </div>
            {backlinks.length > 0 && (
              <div className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-t border-term-border pt-3 font-mono text-xs">
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