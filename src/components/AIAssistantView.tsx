import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  Send,
  Loader2,
  Bot,
  User,
  Lightbulb,
  AlertTriangle,
  Info,
  Trash2,
  HelpCircle
} from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const QUICK_PROMPTS = [
  {
    icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />,
    text: "Which issues are critical today?",
    label: "Critical Issues"
  },
  {
    icon: <Trash2 className="w-3.5 h-3.5 text-emerald-500" />,
    text: "Who is responsible for clearing garbage heaps?",
    label: "Garbage Division"
  },
  {
    icon: <Sparkles className="w-3.5 h-3.5 text-amber-500" />,
    text: "Summarize active reports logged in SpotFix Indore.",
    label: "Map Summary"
  },
  {
    icon: <Lightbulb className="w-3.5 h-3.5 text-yellow-600" />,
    text: "What reports are pending in Palasia Ward?",
    label: "Palasia Status"
  }
];

export const AIAssistantView: React.FC = () => {
  const { triggerAIChat } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `Namaste! I am **Indore Civic AI Friend**, your intelligent helper for SpotFix. 

I am grounded with live data from the active reports database. Ask me anything, such as:
* Status of local complaints
* Which departments are assigned to potholes
* Identifying duplicate hazards near your coordinates
* A quick summary of critical Indore issues today`
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    setError(null);
    const userMessage: ChatMessage = { role: 'user', content: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      // Exclude greeting message for historical consistency or feed full message list
      const historyPayload = messages.slice(1).map(m => ({
        role: m.role,
        content: m.content
      }));

      const responseText = await triggerAIChat(textToSend, historyPayload);
      
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: responseText }
      ]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Chat assistant temporarily unavailable. Please verify Gemini API Key in Settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  // Helper: Basic robust Markdown styling in standard React to avoid dependency issues
  const renderFormattedText = (text: string) => {
    return text.split('\n').map((line, lineIndex) => {
      // Check if it's a bullet point
      let cleanLine = line;
      let isBullet = false;
      if (line.startsWith('* ') || line.startsWith('- ')) {
        cleanLine = line.substring(2);
        isBullet = true;
      }

      // Regex replace **bold** with <strong>
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;

      while ((match = boldRegex.exec(cleanLine)) !== null) {
        if (match.index > lastIndex) {
          parts.push(cleanLine.substring(lastIndex, match.index));
        }
        parts.push(<strong key={match.index} className="text-blue-600 font-bold">{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }
      
      if (lastIndex < cleanLine.length) {
        parts.push(cleanLine.substring(lastIndex));
      }

      const content = parts.length > 0 ? parts : cleanLine;

      if (isBullet) {
        return (
          <li key={lineIndex} className="ml-5 list-disc text-slate-600 text-xs my-1 leading-relaxed">
            {content}
          </li>
        );
      }

      return (
        <p key={lineIndex} className="text-slate-600 text-xs my-2 leading-relaxed min-h-[12px]">
          {content}
        </p>
      );
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-slate-800 min-h-[calc(100vh-4rem)] flex flex-col justify-between">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5 mb-6">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-amber-500 animate-pulse" />
          <span>Indore Civic AI Friend</span>
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Ground-truth smart citizen assistance. Powered by Google Gemini.
        </p>
      </div>

      {/* Messages Thread box */}
      <div className="flex-1 bg-white border border-slate-100 rounded-[32px] p-5 md:p-6 overflow-y-auto max-h-[460px] space-y-4 mb-6 shadow-sm">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex gap-4 p-4 rounded-2xl border transition-colors ${
              msg.role === 'assistant'
                ? 'bg-slate-50 border-slate-100 text-slate-700'
                : 'bg-blue-50/70 border-blue-100 self-end ml-12 text-slate-800'
            }`}
          >
            {/* Avatar block */}
            <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center border ${
              msg.role === 'assistant'
                ? 'bg-amber-50 border-amber-100 text-amber-600'
                : 'bg-blue-50 border-blue-100 text-blue-600'
            }`}>
              {msg.role === 'assistant' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
            </div>

            {/* Chat content bubble */}
            <div className="flex-1 overflow-hidden">
              <span className="block text-[9px] font-mono text-slate-400 uppercase font-bold mb-1">
                {msg.role === 'assistant' ? 'Indore Civic AI Friend' : 'YOU'}
              </span>
              <div className="space-y-1">
                {renderFormattedText(msg.content)}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 animate-pulse">
            <div className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center bg-slate-100 border border-slate-200 text-slate-400">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
            <div className="flex-1 space-y-2 mt-1">
              <div className="h-2.5 bg-slate-200 rounded w-24"></div>
              <div className="h-2 bg-slate-200 rounded w-full"></div>
              <div className="h-2 bg-slate-200 rounded w-4/5"></div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex gap-2.5 items-center p-3.5 rounded-2xl bg-rose-50 border border-rose-100 text-xs text-rose-600">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick prompts panel */}
      {messages.length < 4 && (
        <div className="space-y-2.5 mb-5">
          <span className="block text-[10px] font-mono text-slate-400 font-bold uppercase">
            Suggested questions for evaluation:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {QUICK_PROMPTS.map((prompt, pIdx) => (
              <button
                key={pIdx}
                onClick={() => handleSendMessage(prompt.text)}
                disabled={loading}
                className="flex items-center gap-2.5 p-3 rounded-2xl bg-white border border-slate-100 hover:border-slate-200 text-slate-600 hover:text-slate-800 text-xs text-left transition-all font-semibold shadow-sm disabled:opacity-50"
              >
                <div className="p-1 rounded-lg bg-slate-50 border border-slate-100">{prompt.icon}</div>
                <span className="truncate">{prompt.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input box */}
      <form onSubmit={handleSubmit} className="flex gap-3 bg-white border border-slate-100 p-2.5 rounded-2xl items-center shadow-sm">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask about active streetlights, garbage heaps, or assigned departments..."
          className="flex-1 px-4 py-2.5 bg-transparent border-none text-xs text-slate-800 focus:outline-none focus:ring-0 placeholder:text-slate-400"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || loading}
          className="p-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 transition-colors shrink-0 shadow-md shadow-blue-100"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
