import React, { useState, useEffect, useRef } from 'react';
import { askQuestion } from '../api/client';
import { Sparkles, SendHorizonal, Loader2, AlertCircle, User, MessageSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const SUGGESTED_QUESTIONS = [
  'What were the main decisions made?',
  'Summarize the most important points.',
  'What action items were identified?',
  'Are there any open questions that need follow-up?',
  'What was the core conclusion?',
];

export default function ChatPane({ sessionId }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (question = null) => {
    const text = (question || inputValue).trim();
    if (!text || isLoading) return;

    setError('');
    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', text }]);
    setIsLoading(true);

    try {
      const res = await askQuestion(sessionId, text);
      const answer = res.answer || 'The AI returned an empty response.';
      setMessages(prev => [...prev, { role: 'assistant', text: answer }]);
    } catch (err) {
      setError(err.message || 'Failed to get a response. Please try again.');
      // Remove the user message on failure
      setMessages(prev => prev.slice(0, -1));
      setInputValue(text);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaInput = (e) => {
    setInputValue(e.target.value);
    // Auto-resize
    const ta = e.target;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
  };

  return (
    <div className="flex flex-col h-full">

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
        
        {/* Empty state with suggestions */}
        {messages.length === 0 && !isLoading && (
          <div className="text-center py-10 space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-[#A855F7] mx-auto">
              <Sparkles className="w-7 h-7" />
            </div>
            <div>
              <p className="text-base font-semibold text-[#F8FAFC] mb-1">Ask anything about this video</p>
              <p className="text-sm text-[#71717A]">Answers are grounded in the transcript — no hallucinations.</p>
            </div>

            <div className="grid grid-cols-1 gap-2 max-w-lg mx-auto">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => handleSend(q)}
                  className="px-4 py-3 rounded-xl bg-[#0D0E14] hover:bg-[#191A23] border border-[#292A33] hover:border-purple-500/30 text-sm text-[#A1A1AA] hover:text-[#F8FAFC] text-left transition-all cursor-pointer"
                >
                  "{q}"
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message History */}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-purple-500/20 flex items-center justify-center text-[#A855F7] shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-[#191A23] border border-[#292A33] text-[#F8FAFC] rounded-tr-sm'
                  : 'bg-purple-950/20 border border-purple-500/20 text-[#D8B4FE] rounded-tl-sm'
              }`}
            >
              {msg.role === 'assistant' ? (
                <div className="prose prose-sm prose-invert max-w-none">
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="text-sm text-[#D8B4FE] mb-1.5 last:mb-0">{children}</p>,
                      ul: ({ children }) => <ul className="list-disc list-inside space-y-1 mb-2">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 mb-2">{children}</ol>,
                      li: ({ children }) => <li className="text-sm text-[#D8B4FE]">{children}</li>,
                      strong: ({ children }) => <strong className="font-semibold text-[#E9D5FF]">{children}</strong>,
                      code: ({ children }) => <code className="px-1 py-0.5 rounded bg-purple-950/50 text-xs font-mono text-[#C4B5FD]">{children}</code>,
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                </div>
              ) : (
                <p>{msg.text}</p>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center text-[#3B82F6] shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-7 h-7 rounded-lg bg-purple-500/20 flex items-center justify-center text-[#A855F7] shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="bg-purple-950/20 border border-purple-500/20 rounded-2xl rounded-tl-sm px-5 py-3.5 flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
              <span className="text-xs text-purple-300">Searching transcript & generating response...</span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mx-4 p-3 rounded-xl bg-red-950/30 border border-red-500/20 text-red-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-[#292A33] bg-[#14151C] shrink-0">
        <div className="flex items-end gap-3 p-3 rounded-xl bg-[#191A23] border border-[#292A33] focus-within:border-purple-500/50 focus-within:ring-1 focus-within:ring-purple-500/20 transition-all">
          <textarea
            ref={textareaRef}
            rows={1}
            disabled={isLoading}
            value={inputValue}
            onChange={handleTextareaInput}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about this video... (Enter to send, Shift+Enter for new line)"
            className="flex-1 bg-transparent text-sm text-[#F8FAFC] placeholder-[#71717A] resize-none focus:outline-none max-h-40 leading-relaxed disabled:opacity-50"
          />
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={isLoading || !inputValue.trim()}
            className="w-9 h-9 rounded-xl btn-gradient flex items-center justify-center text-white shrink-0 disabled:opacity-40 hover:scale-105 transition-all cursor-pointer"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <SendHorizonal className="w-4 h-4" />
            )}
          </button>
        </div>
        <p className="text-[10px] text-[#71717A] mt-2 text-center">
          AI responses are grounded in the video transcript. Powered by Gemini RAG.
        </p>
      </div>
    </div>
  );
}
