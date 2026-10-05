import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Bot, 
  Sparkles, 
  Send, 
  X, 
  Minimize2, 
  Maximize2, 
  RotateCcw, 
  ChevronRight, 
  ExternalLink, 
  HelpCircle,
  Code2,
  Users,
  Trophy,
  FileCheck2,
  Cpu,
  Layers,
  Search
} from "lucide-react";
import { supportService } from "../services/api";

const DEFAULT_WELCOME_MESSAGE = {
  id: "welcome-1",
  sender: "bot",
  title: "👋 Welcome to HackFlow AI Assistant!",
  text: "I am your personal AI guide. I can help you register for hackathons, build teams, submit repositories, use the **AI Code Detector**, evaluate rubrics, and claim certificates.",
  quickSteps: [
    "🚀 **Register & Browse**: Find hackathons and review track criteria.",
    "👥 **Team Formation**: Create or join squads using team invite codes.",
    "💻 **Project Submission**: Submit GitHub repos, live demos, and video walkthroughs.",
    "🧠 **AI Code Detector Lab**: Inspect code snippets for synthetic AI signatures and security risks."
  ],
  actionLinks: [
    { label: "Explore Hackathons", path: "/hackathons" },
    { label: "Form a Team", path: "/teams" },
    { label: "Judges & AI Detector", path: "/judges" }
  ],
  suggestedQuestions: [
    "How do I register for a hackathon?",
    "How do I create or join a team?",
    "How do I submit my GitHub repository?",
    "How does the AI Code Detector work in Judges panel?"
  ],
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
};

export default function AISupportBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputQuery, setInputQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasUnreadNotice, setHasUnreadNotice] = useState(true);
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem("hackflow_ai_support_chat");
      return saved ? JSON.parse(saved) : [DEFAULT_WELCOME_MESSAGE];
    } catch {
      return [DEFAULT_WELCOME_MESSAGE];
    }
  });

  const navigate = useNavigate();
  const location = useLocation();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, loading]);

  // Save chat history
  useEffect(() => {
    try {
      localStorage.setItem("hackflow_ai_support_chat", JSON.stringify(messages));
    } catch {
      // ignore
    }
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setHasUnreadNotice(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || loading) return;

    const userMsg = {
      id: `u_${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery("");
    setLoading(true);

    try {
      const userRaw = localStorage.getItem("user");
      const user = userRaw ? JSON.parse(userRaw) : null;
      const role = user?.role || "participant";

      const res = await supportService.askAssistant(query, role, location.pathname);

      const botMsg = {
        id: `b_${Date.now()}`,
        sender: "bot",
        title: res.title || "HackFlow AI Guidance",
        text: res.reply || "Here is what you need to know:",
        quickSteps: res.quickSteps || [],
        actionLinks: res.actionLinks || [],
        suggestedQuestions: res.suggestedQuestions || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const errorMsg = {
        id: `e_${Date.now()}`,
        sender: "bot",
        title: "Connection Notice",
        text: "I am having a brief network issue, but here are the key platform guidelines:\n\n- **Teams**: Create or join teams with 6-char codes on the `/teams` page.\n- **Submissions**: Submit live demo & GitHub repos on `/submissions`.\n- **Judges**: Use the AI Code Detector to audit code originality and score rubrics on `/judges`.",
        actionLinks: [
          { label: "Go to Dashboard", path: "/dashboard" },
          { label: "Judges Panel", path: "/judges" }
        ],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([DEFAULT_WELCOME_MESSAGE]);
    localStorage.removeItem("hackflow_ai_support_chat");
  };

  const handleLinkClick = (path) => {
    navigate(path);
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  // Contextual quick chips based on location
  const getContextualQuickChips = () => {
    const path = location.pathname;
    if (path.includes("judges")) {
      return [
        { label: "🧠 AI Code Detector Guide", query: "How does the AI Code Detector work in Judges panel?" },
        { label: "📝 How to Submit Rubrics", query: "How do judges submit evaluation scores?" },
        { label: "🛡️ Security Secret Scan", query: "What security issues does the code analyzer detect?" }
      ];
    }
    if (path.includes("submissions")) {
      return [
        { label: "🚀 How to Submit", query: "How do I submit my hackathon project?" },
        { label: "🔗 GitHub & Video Specs", query: "What links and details are required for submission?" },
        { label: "⏳ Edit Deadline", query: "Can I edit my project after submitting?" }
      ];
    }
    if (path.includes("teams")) {
      return [
        { label: "👥 Create a Team", query: "How do I create a new team?" },
        { label: "🔑 Join with Code", query: "How do I join an existing team with invite code?" },
        { label: "🧑‍💻 Member Limits", query: "What is the maximum team size?" }
      ];
    }
    if (path.includes("hackathons")) {
      return [
        { label: "🏆 Register for Event", query: "How do I register for a hackathon?" },
        { label: "🎯 Track Selection", query: "How do hackathon tracks work?" },
        { label: "💰 Prizes & Timeline", query: "Where do I see prize distributions and deadlines?" }
      ];
    }
    return [
      { label: "🚀 Getting Started", query: "What is HackFlow AI and how do I start?" },
      { label: "👥 Team Setup", query: "How do I create or join a team?" },
      { label: "🧠 AI Code Detector", query: "How do judges detect AI-generated code?" },
      { label: "🏆 Certificates", query: "How do I claim my hackathon certificate?" }
    ];
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center">
        {!isOpen && (
          <div 
            onClick={() => setIsOpen(true)}
            className="hidden sm:flex items-center gap-2 mr-3 px-3.5 py-1.5 rounded-full bg-[#140c0b]/95 text-zinc-200 text-xs font-bold backdrop-blur-md border border-red-900/50 shadow-xl shadow-red-950/40 cursor-pointer hover:bg-red-950 hover:text-white transition-all transform hover:scale-105"
          >
            <Sparkles className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
            <span>Need Help? Ask AI Copilot</span>
          </div>
        )}

        <button
          id="hackflow-ai-support-btn"
          onClick={() => setIsOpen((prev) => !prev)}
          className={`relative p-3.5 sm:p-4 rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center ${
            isOpen 
              ? "bg-[#1f1311] text-white border border-red-900/60 hover:bg-[#2c1714]" 
              : "bg-gradient-to-tr from-red-600 via-orange-600 to-amber-600 text-white shadow-red-600/30 hover:shadow-red-600/60 border border-orange-400/40"
          }`}
          title="HackFlow AI Assistant"
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <>
              <div className="relative">
                <Bot className="w-6 h-6 animate-pulse" />
                <Sparkles className="w-3.5 h-3.5 text-yellow-300 absolute -top-1.5 -right-2" />
              </div>
              {hasUnreadNotice && (
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500 border-2 border-black"></span>
                </span>
              )}
            </>
          )}
        </button>
      </div>

      {/* Interactive Chat Window */}
      {isOpen && (
        <div
          className={`fixed z-50 bottom-24 right-4 sm:right-6 bg-[#0f0b0a]/95 border border-red-900/50 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/80 flex flex-col overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-6 ${
            isExpanded 
              ? "w-[94vw] sm:w-[680px] h-[85vh] max-h-[820px]" 
              : "w-[94vw] sm:w-[420px] h-[600px] max-h-[80vh]"
          }`}
        >
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-[#170e0d] via-[#1f1311] to-[#170e0d] border-b border-red-950/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 to-orange-600 flex items-center justify-center shadow-lg shadow-red-600/30 text-white border border-orange-400/30">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white tracking-wide">HackFlow Copilot</h3>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-950 text-orange-400 border border-red-800/60">
                    Online
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400">AI Platform Guide & Assistant</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClearChat}
                title="Reset conversation"
                className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-red-950/40 rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsExpanded((prev) => !prev)}
                title={isExpanded ? "Collapse" : "Expand"}
                className="hidden sm:inline-flex p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-red-950/40 rounded-lg transition-colors"
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close"
                className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-red-950/40 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Context Banner */}
          <div className="px-4 py-2 bg-[#090707] border-b border-red-950/60 flex items-center justify-between text-xs text-zinc-400">
            <div className="flex items-center gap-1.5 truncate">
              <Sparkles className="w-3.5 h-3.5 text-orange-400 shrink-0" />
              <span className="truncate">
                Active Page: <span className="text-orange-300 font-bold">{location.pathname}</span>
              </span>
            </div>
            <span className="text-[10px] text-red-400/80 font-mono shrink-0">v1.2 AI Active</span>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender === "bot" && (
                  <div className="w-8 h-8 rounded-xl bg-[#1c1110] border border-red-900/50 flex items-center justify-center text-orange-400 shrink-0 mt-1 shadow-sm">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-br-none shadow-md shadow-red-950/50 font-medium"
                      : "bg-[#181110] text-zinc-200 border border-red-900/40 rounded-bl-none shadow-md"
                  }`}
                >
                  {msg.title && (
                    <div className="font-bold text-white mb-1.5 pb-1 border-b border-red-950/60 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      {msg.title}
                    </div>
                  )}

                  <div className="whitespace-pre-wrap text-zinc-200">{msg.text}</div>

                  {/* Step list if provided */}
                  {msg.quickSteps && msg.quickSteps.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-red-950/50 space-y-1.5">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-orange-300">
                        Step-by-Step Instructions:
                      </p>
                      {msg.quickSteps.map((step, idx) => (
                        <div key={idx} className="text-xs text-zinc-300 flex items-start gap-1.5">
                          <span className="text-red-400 font-mono mt-0.5">•</span>
                          <span dangerouslySetInnerHTML={{ __html: step.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>') }} />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Action Direct Links */}
                  {msg.actionLinks && msg.actionLinks.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-red-950/50 flex flex-wrap gap-1.5">
                      {msg.actionLinks.map((link, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleLinkClick(link.path)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-950/60 hover:bg-red-900/60 text-orange-300 border border-red-800/60 text-[11px] font-bold transition-all"
                        >
                          <span>{link.label}</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Suggested follow-up queries */}
                  {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-red-950/50 space-y-1">
                      <span className="text-[10px] text-zinc-400 block font-bold">Suggested Next Questions:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.suggestedQuestions.map((q, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSendMessage(q)}
                            className="text-left text-[11px] px-2 py-1 rounded-md bg-[#0d0909] hover:bg-red-950 text-zinc-300 hover:text-orange-200 border border-red-950/80 transition-colors"
                          >
                            💬 {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className={`text-[10px] mt-2 text-right ${msg.sender === "user" ? "text-orange-200/80" : "text-zinc-500"}`}>
                    {msg.timestamp}
                  </div>
                </div>

                {msg.sender === "user" && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-red-600 to-orange-600 flex items-center justify-center text-white shrink-0 mt-1 shadow-sm font-bold text-xs">
                    You
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 justify-start items-center">
                <div className="w-8 h-8 rounded-xl bg-[#1c1110] border border-red-900/50 flex items-center justify-center text-orange-400 shrink-0">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="bg-[#181110] border border-red-900/40 rounded-2xl rounded-bl-none p-3.5 text-xs text-zinc-300 flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-red-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span>Analyzing HackFlow AI platform knowledge...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Contextual Quick Chips Bar */}
          <div className="px-3 py-2 bg-[#0a0707] border-t border-red-950/60 overflow-x-auto flex gap-1.5 custom-scrollbar">
            {getContextualQuickChips().map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(chip.query)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-[#1c1110] hover:bg-gradient-to-r hover:from-red-600 hover:to-orange-600 hover:text-white text-zinc-300 text-[11px] font-bold border border-red-900/50 transition-all shrink-0 flex items-center gap-1"
              >
                <span>{chip.label}</span>
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-[#0d0909] border-t border-red-950/70 flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask anything (e.g. how to use AI code detector, form a team...)"
              className="flex-1 bg-[#18100f] border border-red-900/40 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition shadow-inner"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || loading}
              className="p-2.5 rounded-xl bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 text-white hover:from-red-500 hover:to-amber-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-red-600/30 shrink-0 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
