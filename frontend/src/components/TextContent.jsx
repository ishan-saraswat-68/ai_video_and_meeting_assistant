import React from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  FileText, 
  ListChecks, 
  HelpCircle, 
  Layers,
  CheckSquare,
  Video
} from 'lucide-react';

// Simple formatted text display for action items, decisions, open questions
export function TextContent({ content, emptyMessage = 'No content available.' }) {
  if (!content || content.trim() === '') {
    return (
      <p className="text-sm text-[#71717A] italic">{emptyMessage}</p>
    );
  }
  return (
    <div className="prose prose-sm prose-invert max-w-none text-[#A1A1AA] leading-relaxed">
      <ReactMarkdown
        components={{
          h1: ({ children }) => <h1 className="text-lg font-bold text-[#F8FAFC] mt-4 mb-2">{children}</h1>,
          h2: ({ children }) => <h2 className="text-base font-semibold text-[#F8FAFC] mt-3 mb-2">{children}</h2>,
          h3: ({ children }) => <h3 className="text-sm font-semibold text-[#D4D4D8] mt-3 mb-1.5">{children}</h3>,
          p: ({ children }) => <p className="text-sm text-[#A1A1AA] leading-relaxed mb-2">{children}</p>,
          ul: ({ children }) => <ul className="list-disc list-inside space-y-1 mb-3">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 mb-3">{children}</ol>,
          li: ({ children }) => <li className="text-sm text-[#A1A1AA] leading-relaxed">{children}</li>,
          strong: ({ children }) => <strong className="font-semibold text-[#F8FAFC]">{children}</strong>,
          em: ({ children }) => <em className="text-[#C4B5FD]">{children}</em>,
          code: ({ children }) => <code className="px-1 py-0.5 rounded bg-[#14151C] text-xs font-mono text-[#C084FC] border border-[#292A33]">{children}</code>,
          pre: ({ children }) => <pre className="p-4 rounded-xl bg-[#0D0E14] border border-[#292A33] overflow-x-auto text-xs font-mono text-[#D4D4D8] mb-3">{children}</pre>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
