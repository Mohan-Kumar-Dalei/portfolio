import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, X, Send, Loader2 } from "lucide-react";
import api from "../lib/api";

const clean = (t = "") =>
  t
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^\s*[*-]\s+/gm, "• ")
    .replace(/^#{1,6}\s+/gm, "");

const TypingText = ({ text }) => {
  const clet = clean(text);
  const [shown, setShown] = useState("");
  useEffect(() => {
    setShown("");
    let i = 0;
    const id = setInterval(() => {
      i += 2;
      setShown(clet.slice(0, i));
      if (i >= clet.length) clearInterval(id);
    }, 14);
    return () => clearInterval(id);
  }, [clet]);
  return <span>{shown}</span>;
};

const ChatBot = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I'm SARHA ✦ Ask me anything about Mohan's work, skills or how to hire him." },
  ]);
  const sessionId = useRef(localStorage.getItem("mkd_chat_session") || Math.random().toString(36).slice(2));
  useEffect(() => {
    localStorage.setItem("mkd_chat_session", sessionId.current);
  }, []);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = async () => {
    const msg = input.trim();
    if (!msg || loading) return;
    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    setMessages((m) => [...m, { role: "user", content: msg }]);
    setInput("");
    setLoading(true);
    try {
      const { data } = await api.post("/chat", { message: msg, history, sessionId: sessionId.current });
      setMessages((m) => [...m, { role: "assistant", content: data.reply, typing: true }]);
    } catch (e) {
      setMessages((m) => [...m, { role: "assistant", content: "I'm having trouble right now. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, type: "spring" }}
        onClick={() => setOpen((v) => !v)}
        data-testid="chatbot-toggle"
        aria-label="Open AI assistant"
        className="fixed bottom-6 right-6 z-[85] grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg"
      >
        <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20" />
        <motion.span animate={{ y: [0, -3, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
          {open ? <X size={24} /> : <Bot size={26} />}
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-24 right-6 z-[85] w-[calc(100vw-3rem)] sm:w-[23.75rem] h-[32.5rem] max-h-[70vh] glass rounded-3xl flex flex-col overflow-hidden"
            data-testid="chatbot-panel"
            data-lenis-prevent
          >
            <div className="flex items-center gap-3 p-5 border-b border-border">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-primary/15 text-primary"><Bot size={20} /></span>
              <div>
                <div className="font-display font-medium leading-none">SARHA</div>
                <div className="text-xs text-ink-muted mt-1 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" /> Mohan's AI Assistant
                </div>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-chip border border-border text-ink"}`} data-testid={`chat-msg-${m.role}`}>
                    {m.typing ? <TypingText text={m.content} /> : m.role === "assistant" ? clean(m.content) : m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl px-4 py-3 bg-chip border border-border flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.span key={i} className="h-1.5 w-1.5 rounded-full bg-ink-muted" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-border flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Ask about Mohan…"
                data-testid="chat-input"
                className="flex-1 rounded-full bg-chip border border-border px-4 py-2.5 text-sm focus:border-primary outline-none transition-colors duration-200"
              />
              <button onClick={send} disabled={loading} data-testid="chat-send" className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground disabled:opacity-60">
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBot;
