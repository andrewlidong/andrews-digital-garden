import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface FileContentProps {
  content: string;
  fileType: string;
}

export const FileContent: React.FC<FileContentProps> = ({ content, fileType }) => {
  const renderContent = () => {
    switch (fileType.toLowerCase()) {
      case '.md':
      case '.markdown':
        return (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({...props}) => <h1 className="text-3xl font-bold mb-4 text-white" {...props} />,
              h2: ({...props}) => <h2 className="text-2xl font-bold mb-3 text-white" {...props} />,
              h3: ({...props}) => <h3 className="text-xl font-bold mb-2 text-white" {...props} />,
              p: ({...props}) => <p className="mb-4 text-gray-200 leading-relaxed" {...props} />,
              ul: ({...props}) => <ul className="list-disc pl-6 mb-4 text-gray-200" {...props} />,
              ol: ({...props}) => <ol className="list-decimal pl-6 mb-4 text-gray-200" {...props} />,
              li: ({...props}) => <li className="mb-2 text-gray-200" {...props} />,
              code: ({className, ...props}) =>
                className?.includes('inline') ? (
                  <code className="bg-gray-800 px-1.5 py-0.5 rounded text-gray-200" {...props} />
                ) : (
                  <code className="block bg-gray-800 p-4 rounded-lg text-gray-200 mb-4" {...props} />
                ),
              pre: ({...props}) => <pre className="bg-gray-800 p-4 rounded-lg mb-4 overflow-x-auto" {...props} />,
              blockquote: ({...props}) => <blockquote className="border-l-4 border-gray-600 pl-4 italic text-gray-300 mb-4" {...props} />,
              a: ({...props}) => <a className="text-blue-400 hover:text-blue-300 underline" {...props} />,
              table: ({...props}) => <table className="w-full border-collapse mb-4" {...props} />,
              th: ({...props}) => <th className="border border-gray-600 px-4 py-2 text-left bg-gray-800" {...props} />,
              td: ({...props}) => <td className="border border-gray-600 px-4 py-2" {...props} />,
            }}
          >
            {content}
          </ReactMarkdown>
        );
      case '.txt':
      case '.log':
        return (
          <pre className="whitespace-pre-wrap font-mono text-gray-200 bg-gray-800 p-4 rounded-lg">
            {content}
          </pre>
        );
      case '.json':
        return (
          <pre className="whitespace-pre-wrap font-mono text-gray-200 bg-gray-800 p-4 rounded-lg">
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
          <pre className="whitespace-pre-wrap font-mono text-gray-200 bg-gray-800 p-4 rounded-lg">
            {content}
          </pre>
        );
      default:
        return (
          <div className="text-gray-400 italic">
            Preview not available for {fileType} files
          </div>
        );
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10 shadow-lg">
      {renderContent()}
    </div>
  );
};