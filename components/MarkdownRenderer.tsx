import React from 'react';

// Basic processor to handle headers, bold, and lists for the AI output
const MarkdownRenderer: React.FC<{ content: string; className?: string }> = ({ content, className }) => {
  if (!content) return null;

  const lines = content.split('\n');
  
  return (
    <div className={`space-y-3 leading-relaxed ${className}`}>
      {lines.map((line, index) => {
        // Headers
        if (line.startsWith('### ')) {
          return <h3 key={index} className="text-xl font-semibold text-blue-200 mt-6 mb-2">{line.replace('### ', '')}</h3>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={index} className="text-2xl font-bold text-white mt-8 mb-4">{line.replace('## ', '')}</h2>;
        }
        if (line.startsWith('# ')) {
          return <h1 key={index} className="text-3xl font-extrabold text-white mb-6">{line.replace('# ', '')}</h1>;
        }

        // Bullet points
        if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
            const text = line.trim().substring(2);
            // Handle bolding within bullets
            const parts = text.split(/(\*\*.*?\*\*)/g);
            return (
              <div key={index} className="flex items-start ml-2 mb-1">
                <span className="mr-2 text-blue-400 mt-1.5">•</span>
                <span className="text-slate-300">
                    {parts.map((part, i) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
                        }
                        return part;
                    })}
                </span>
              </div>
            );
        }

        // Numbered lists
         if (/^\d+\./.test(line.trim())) {
             const [num, ...rest] = line.trim().split('.');
             const text = rest.join('.').trim();
             const parts = text.split(/(\*\*.*?\*\*)/g);
            return (
              <div key={index} className="flex items-start ml-2 mb-2">
                 <span className="mr-2 text-blue-400 font-mono">{num}.</span>
                 <span className="text-slate-300">
                    {parts.map((part, i) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
                        }
                        return part;
                    })}
                </span>
              </div>
            );
         }

        // Empty lines
        if (line.trim() === '') {
          return <div key={index} className="h-2"></div>;
        }

        // Paragraphs with bold support
        const parts = line.split(/(\*\*.*?\*\*)/g);
        return (
          <p key={index} className="text-slate-300">
             {parts.map((part, i) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
                }
                return part;
            })}
          </p>
        );
      })}
    </div>
  );
};

export default MarkdownRenderer;