import React, { useState } from 'react';
import { AIChatMessage } from '@/types/finance';
import { StructuredResponseView } from './StructuredResponseView';
import { Bot, User, Copy, Check } from 'lucide-react';

interface ChatMessageBubbleProps {
  message: AIChatMessage;
}

export const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} mb-4 group`}>
      {/* Avatar Icon */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white ${
          isUser
            ? 'bg-slate-700 dark:bg-slate-600'
            : 'bg-emerald-600 shadow-sm shadow-emerald-950/20'
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Bubble Content */}
      <div className={`max-w-[85%] md:max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`rounded-2xl p-4 text-sm leading-relaxed ${
            isUser
              ? 'bg-emerald-600 text-white rounded-tr-xs'
              : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-tl-xs shadow-xs'
          }`}
        >
          <div className="whitespace-pre-wrap">{message.content}</div>

          {/* Embedded Structured Card */}
          {message.card && <StructuredResponseView card={message.card} />}
        </div>

        {/* Bubble Footer: Timestamp & Actions */}
        <div
          className={`flex items-center gap-2 mt-1 px-1 text-[10px] text-slate-400 ${
            isUser ? 'justify-end' : 'justify-start'
          }`}
        >
          <span>{formattedTime}</span>
          {!isUser && (
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1 hover:text-slate-600 dark:hover:text-slate-300 transition-colors opacity-0 group-hover:opacity-100"
              title="Copy answer"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

