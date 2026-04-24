import { motion } from "framer-motion";

export const Loader = ({ text }: { text?: string }) => (
  <div className="flex flex-col items-center gap-3">
    <motion.div
      className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full"
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
    {text && <span className="text-sm text-muted-foreground">{text}</span>}
  </div>
);

export const TypingIndicator = () => (
  <div className="flex items-center gap-1.5 px-4 py-3">
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        className="w-2 h-2 rounded-full bg-primary"
        animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
        transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.2 }}
      />
    ))}
  </div>
);
