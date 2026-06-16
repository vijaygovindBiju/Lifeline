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
      "flex w-full mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300",
      isAssistant ? "justify-start" : "justify-end",
      className
    )}>
      <div className={cn(
        "flex max-w-[80%] items-start gap-3",
        isAssistant ? "flex-row" : "flex-row-reverse"
      )}>
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
          isAssistant ? "bg-blue-100 text-blue-600" : "bg-emerald-100 text-emerald-600"
        )}>
          {isAssistant ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
        </div>
        <div className={cn(
          "p-4 rounded-2xl text-sm md:text-base leading-relaxed",
          isAssistant 
            ? "bg-white border border-gray-100 shadow-sm text-gray-800 rounded-tl-none" 
            : "bg-blue-600 text-white rounded-tr-none shadow-md"
        )}>
          {content}
        </div>
      </div>
    </div>
  );
}
