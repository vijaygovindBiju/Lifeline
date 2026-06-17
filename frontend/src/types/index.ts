export type UrgencyLevel = 'low' | 'medium' | 'high';

export interface Resource {
  id: string;
  name: string;
  type: 'food' | 'housing' | 'employment' | 'legal';
  distance: string;
  address: string;
  openNow: boolean;
  statusText?: string;
  phone?: string;
  description: string;
  priority: UrgencyLevel;
}

export interface Program {
  id: string;
  name: string;
  description: string;
  recommendationReason: string;
  requirements: string[];
  confidence: UrgencyLevel;
  link: string;
}

export interface RecoveryStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  timeframe: 'today' | 'week' | 'month';
}

export interface DocumentInsight {
  id: string;
  fileName: string;
  skills: string[];
  experience: string;
  opportunities: {
    temporary: string[];
    growth: string[];
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
