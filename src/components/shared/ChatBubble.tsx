import React from 'react';
import { cn } from '@/lib/utils';
import { User, Bot } from 'lucide-react';

interface ChatBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  className?: string;
}

export function ChatBubble({ role, content, className }: ChatBubbleProps) {
  const isAssistant = role === 'assistant';
  
  return (
    <div className={cn(
      "flex w-full mb-6 animate-in fade-in slide-in-from-bottom-3 duration-500",
      isAssistant ? "justify-start" : "justify-end",
      className
    )}>
      <div className={cn(
        "flex max-w-[85%] items-end gap-3",
        isAssistant ? "flex-row" : "flex-row-reverse"
      )}>
        <div className={cn(
          "w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
          isAssistant ? "bg-blue-600 text-white" : "bg-emerald-500 text-white"
        )}>
          {isAssistant ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
        </div>
        <div className={cn(
          "px-5 py-4 rounded-[1.5rem] text-sm md:text-[15px] leading-relaxed shadow-sm border",
          isAssistant 
            ? "bg-white border-slate-100 text-slate-700 rounded-bl-none" 
            : "bg-blue-600 border-blue-500 text-white rounded-br-none shadow-blue-100 shadow-lg"
        )}>
          {content}
        </div>
      </div>
    </div>
  );
}
