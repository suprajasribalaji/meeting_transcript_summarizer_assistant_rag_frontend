import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, FileUp, Upload } from "lucide-react";
import { ChatBubble } from "@/components/ChatBubble";
import { TypingIndicator } from "@/components/Loader";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [uploading, setUploading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // placeholder: POST /api/chat
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "ai",
          content: "Here's a summary of the key points from your transcript:\n\n• Action items were assigned to the engineering team\n• Q2 targets were reviewed and approved\n• Next meeting scheduled for Friday at 2 PM",
        },
      ]);
      setIsTyping(false);
    }, 2000);
  };

  const handleUpload = () => {
    setUploading(true);
    // placeholder: POST /api/upload
    setTimeout(() => {
      setUploading(false);
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "user", content: "📄 Uploaded: meeting_transcript.pdf" },
      ]);
      setIsTyping(true);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "ai",
            content: "I've processed your transcript. Here are the highlights:\n\n• 3 participants discussed the product roadmap\n• Budget allocation was finalized at $150K\n• Design review is pending approval\n\nWould you like me to elaborate on any of these points?",
          },
        ]);
        setIsTyping(false);
      }, 2500);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const isEmpty = messages.length === 0 && !uploading;

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse-glow"
            >
              <Upload className="w-8 h-8 text-primary" />
            </motion.div>
            <div>
              <h2 className="font-display font-semibold text-lg mb-1">Upload your meeting transcript</h2>
              <p className="text-sm text-muted-foreground max-w-sm">
                Upload a PDF of your meeting transcript to get an AI-powered summary with key insights and action items.
              </p>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto flex flex-col gap-4">
            <AnimatePresence>
              {messages.map((msg) => (
                <ChatBubble key={msg.id} role={msg.role} content={msg.content} />
              ))}
            </AnimatePresence>
            {isTyping && (
              <div className="self-start flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                  <span className="text-xs text-primary font-bold">AI</span>
                </div>
                <div className="bg-secondary border border-primary/20 rounded-xl">
                  <TypingIndicator />
                </div>
              </div>
            )}
          </div>
        )}

        {uploading && (
          <div className="flex items-center justify-center gap-2 py-4">
            <motion.div
              className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <span className="text-sm text-muted-foreground">Processing transcript...</span>
          </div>
        )}
      </div>

      {/* Input bar */}
      <div className="border-t border-border bg-background/80 backdrop-blur-md p-4">
        <div className="max-w-3xl mx-auto flex items-center gap-2">
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="p-2.5 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-all disabled:opacity-50"
            title="Upload PDF"
          >
            <FileUp className="w-5 h-5" />
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your transcript..."
            className="flex-1 bg-muted/50 border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isTyping}
            className="p-2.5 rounded-lg bg-primary hover:bg-accent text-primary-foreground transition-all glow-red hover:glow-red-strong disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
