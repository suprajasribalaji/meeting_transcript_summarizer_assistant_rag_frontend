import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatBubbleProps {
  role: "user" | "ai";
  content: string;
}

/**
 * Normalize LLM output into clean markdown before rendering.
 * Handles every non-standard formatting pattern Groq/Llama produces.
 */
function normalizeMarkdown(raw: string): string {
  const lines = raw.split("\n");
  const out: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // ── 1. Unicode bullet characters → markdown list item ──
    // Covers: • ● · ▪ ▫ ▸ ► ◦ ‣ – (dash used as bullet at line start)
    line = line.replace(
      /^(\s*)[•●·▪▫▸►◦‣]\s+/,
      (_, indent) => `${indent}- `
    );

    // ── 2. "1) item" or "1- item" → "1. item" (numbered list normalisation) ──
    line = line.replace(/^(\s*)(\d+)[)-]\s+/, (_, indent, num) => `${indent}${num}. `);

    // ── 3. "- item" with no space → "- item" (missing space after dash) ──
    line = line.replace(/^(\s*)-(?!\s|-)(.+)/, (_, indent, rest) => `${indent}- ${rest}`);

    // ── 4. ALL CAPS standalone lines → h3 heading ──
    // e.g. "KEY DECISIONS" or "ACTION ITEMS"
    if (/^[A-Z][A-Z\s]{3,}$/.test(line.trim()) && line.trim().length < 60) {
      line = `### ${line.trim()}`;
    }

    // ── 5. "Label: value" lines that start with bold-like label ──
    // e.g.  "Summary: blah blah" → "**Summary:** blah blah"
    // Only when label is 1–4 words and no markdown already present
    line = line.replace(
      /^(\s*)([A-Z][A-Za-z\s]{1,30}):\s+(?!\*)/,
      (_, indent, label) => `${indent}**${label}:** `
    );

    // ── 6. Separator lines (----, ====, ****) → markdown hr ──
    if (/^[-=*]{3,}\s*$/.test(line.trim())) {
      out.push("---");
      continue;
    }

    // ── 7. Blank line deduplication — collapse 2+ blank lines into one ──
    if (line.trim() === "") {
      if (out.length > 0 && out[out.length - 1].trim() === "") continue;
    }

    out.push(line);
  }

  return out.join("\n");
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
        {isAI ? (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            children={normalizeMarkdown(content)}
            components={{
              // ── Headings ──
              h1: ({ children }) => (
                <h1 className="text-base font-bold mt-3 mb-1.5 first:mt-0 text-foreground">{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-sm font-bold mt-3 mb-1 first:mt-0 text-foreground">{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-sm font-semibold mt-2 mb-1 first:mt-0 text-foreground/90">{children}</h3>
              ),

              // ── Paragraph ──
              p: ({ children }) => (
                <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
              ),

              // ── Bullet list ──
              ul: ({ children }) => (
                <ul className="list-disc list-outside pl-4 mb-2 space-y-1">{children}</ul>
              ),

              // ── Numbered list ──
              ol: ({ children }) => (
                <ol className="list-decimal list-outside pl-4 mb-2 space-y-1">{children}</ol>
              ),

              // ── List item — handles nested content cleanly ──
              li: ({ children }) => (
                <li className="leading-relaxed pl-1">{children}</li>
              ),

              // ── Bold ──
              strong: ({ children }) => (
                <strong className="font-semibold text-foreground">{children}</strong>
              ),

              // ── Italic ──
              em: ({ children }) => (
                <em className="italic text-foreground/80">{children}</em>
              ),

              // ── Inline code ──
              code: ({ children }) => (
                <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono border border-border">
                  {children}
                </code>
              ),

              // ── Block quote (e.g. "I don't know." styled nicely) ──
              blockquote: ({ children }) => (
                <blockquote className="border-l-2 border-primary/40 pl-3 my-2 text-foreground/70 italic">
                  {children}
                </blockquote>
              ),

              // ── Tables (action items output) ──
              table: ({ children }) => (
                <div className="overflow-x-auto my-3 rounded-lg border border-primary/20">
                  <table className="w-full text-xs border-collapse">{children}</table>
                </div>
              ),
              thead: ({ children }) => (
                <thead className="bg-primary/10 text-foreground">{children}</thead>
              ),
              th: ({ children }) => (
                <th className="px-3 py-2 text-left font-semibold border-b border-primary/20">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="px-3 py-2 border-b border-primary/10 last:border-0">{children}</td>
              ),
              tr: ({ children }) => (
                <tr className="hover:bg-primary/5 transition-colors">{children}</tr>
              ),

              // ── Horizontal rule ──
              hr: () => <hr className="border-primary/20 my-3" />,

              // ── Links ──
              a: ({ href, children }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline underline-offset-2 hover:text-primary/80"
                >
                  {children}
                </a>
              ),
            }}
          />
        ) : (
          content
        )}
      </div>
    </motion.div>
  );
};