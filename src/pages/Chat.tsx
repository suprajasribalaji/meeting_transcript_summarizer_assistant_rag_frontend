import { useState, useRef, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Send, FileUp, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ChatBubble } from "@/components/ChatBubble";
import { TypingIndicator } from "@/components/Loader";
import { authService } from "@/services/authService";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
}

function mapApiRoleToBubble(role: string): "user" | "ai" {
  if (role === "assistant") return "ai";
  return "user";
}

const Chat = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionIdFromUrl = searchParams.get("session");

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(() =>
    typeof window !== "undefined"
      ? Boolean(new URLSearchParams(window.location.search).get("session"))
      : false
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!sessionIdFromUrl) {
      setMessages([]);
      setSessionLoading(false);
      return;
    }

    let cancelled = false;
    setSessionLoading(true);

    authService
      .getSessionMessages(sessionIdFromUrl)
      .then((res) => {
        if (cancelled) return;
        setSessionLoading(false);

        if (!res.success || !res.messages) {
          toast.error(res.message || "Could not load conversation");
          setMessages([]);
          setSearchParams({}, { replace: true });
          return;
        }

        setMessages(
          res.messages.map((m) => ({
            id: m.id ?? crypto.randomUUID(),
            role: mapApiRoleToBubble(m.role),
            content: m.content ?? "",
          }))
        );
      })
      .catch(() => {
        if (cancelled) return;
        setSessionLoading(false);
        toast.error("Could not load conversation");
        setMessages([]);
        setSearchParams({}, { replace: true });
      });

    return () => {
      cancelled = true;
    };
  }, [sessionIdFromUrl, setSearchParams]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;

    if (!sessionIdFromUrl) {
      toast.error("Open a conversation from History or upload a PDF first.");
      return;
    }

    setInput("");

    // ✅ Show user message immediately — don't wait for API
    const optimisticId = crypto.randomUUID();
    setMessages((prev) => [
      ...prev,
      { id: optimisticId, role: "user", content: text },
    ]);
    setIsTyping(true);

    try {
      const res = await authService.sendChatMessage(sessionIdFromUrl, text);
      if (!res.success || !res.assistant_message) {
        toast.error(res.message || "Could not send message");
        // Replace optimistic message with confirmed one if available, else keep it
        if (res.user_message) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === optimisticId
                ? { id: res.user_message!.id, role: mapApiRoleToBubble(res.user_message!.role), content: res.user_message!.content ?? "" }
                : m
            )
          );
        }
        return;
      }

      // Replace optimistic user message with confirmed DB row, then append assistant
      setMessages((prev) => [
        ...prev.map((m) =>
          m.id === optimisticId
            ? { id: res.user_message!.id, role: mapApiRoleToBubble(res.user_message!.role), content: res.user_message!.content ?? "" }
            : m
        ),
        {
          id: res.assistant_message!.id,
          role: mapApiRoleToBubble(res.assistant_message!.role),
          content: res.assistant_message!.content ?? "",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const openPdfPicker = () => {
    fileInputRef.current?.click();
  };

  const onPdfSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const lower = file.name.toLowerCase();
    if (!lower.endsWith(".pdf")) {
      toast.error("Please choose a PDF file.");
      return;
    }

    setUploading(true);
    try {
      const result = await authService.uploadMeetingPdf(file);
      if (!result.success) {
        toast.error(result.message || "Upload failed");
        return;
      }
      if (result.session_id) {
        navigate(`/chat?session=${result.session_id}`, { replace: true });
      }
      toast.success("Transcript processed");
    } finally {
      setUploading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const isEmpty =
    messages.length === 0 && !uploading && !sessionLoading && !sessionIdFromUrl;

  /** Session in URL but nothing to show (loaded, not empty-state eligible) */
  const sessionLoadedButNoMessages =
    Boolean(sessionIdFromUrl) &&
    !sessionLoading &&
    messages.length === 0 &&
    !uploading;

  return (
    <div className="flex flex-col h-full min-h-0 flex-1">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6">
        {sessionLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm">Loading conversation…</p>
          </div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse-glow"
            >
              <Upload className="w-8 h-8 text-primary" />
            </motion.div>
            <div>
              <p className="text-sm text-muted-foreground max-w-sm">
                Upload a PDF of your meeting transcript to get an AI-powered summary with key insights and action items.
              </p>
            </div>
          </div>
        ) : sessionLoadedButNoMessages ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-2 text-muted-foreground">
            <p className="text-sm">No messages in this conversation yet.</p>
            <p className="text-xs">Upload a PDF below or start from History.</p>
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
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={onPdfSelected}
        />
        <div className="max-w-3xl mx-auto flex items-center gap-2">
          <button
            type="button"
            onClick={openPdfPicker}
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
            type="button"
            onClick={() => void sendMessage()}
            disabled={!input.trim() || isTyping || !sessionIdFromUrl || sessionLoading}
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