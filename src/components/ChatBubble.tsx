import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Bot, User } from "lucide-react";

interface ChatBubbleProps {
  role: "user" | "ai";
  content: string;
}

export const ChatBubble = ({ role, content }: ChatBubbleProps) => {
  const isAI = role === "ai";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex gap-3 max-w-[85%]", isAI ? "self-start" : "self-end flex-row-reverse")}
    >
      <div
        className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
          isAI ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
        )}
      >
        {isAI ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
      </div>
      <div
        className={cn(
          "rounded-xl px-4 py-3 text-sm leading-relaxed",
          isAI
            ? "bg-secondary border border-primary/20 text-foreground"
            : "bg-muted text-foreground"
        )}
      >
        {content}
      </div>
    </motion.div>
  );
};
