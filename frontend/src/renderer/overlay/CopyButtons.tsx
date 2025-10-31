import React, { useState } from 'react';

interface CopyButtonsProps {
  answerText: string;
  codeSnippets?: { language: string; code: string }[];
}

export default function CopyButtons({ answerText, codeSnippets }: CopyButtonsProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = async (text: string, type: string) => {
    try {
      await window.electronAPI.copyToClipboard(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  const handleCopyAnswer = () => {
    handleCopy(answerText, 'answer');
  };

  const handleCopyCode = (code: string, idx: number) => {
    handleCopy(code, `code-${idx}`);
  };

  return (
    <div className="copy-buttons">
      <button
        onClick={handleCopyAnswer}
        className={`btn-copy ${copied === 'answer' ? 'copied' : ''}`}
        title="Copy answer to clipboard"
      >
        {copied === 'answer' ? '✓ Copied!' : '📋 Copy Answer'}
      </button>

      {codeSnippets && codeSnippets.length > 0 && (
        <div className="code-copy-buttons">
          {codeSnippets.map((snippet, idx) => (
            <button
              key={idx}
              onClick={() => handleCopyCode(snippet.code, idx)}
              className={`btn-copy-code ${copied === `code-${idx}` ? 'copied' : ''}`}
              title={`Copy ${snippet.language} code`}
            >
              {copied === `code-${idx}`
                ? '✓ Copied!'
                : `📄 Copy ${snippet.language}`}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
