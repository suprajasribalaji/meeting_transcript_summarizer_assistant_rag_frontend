import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText, Clock, ArrowRight, Inbox, Trash2, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { authService } from "../services/authService";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

interface Session {
  id: string;
  title: string;
  file_name?: string;
  file_url?: string;
  message_count: number;
  updated_at: string;
  created_at: string;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const History = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingDelete, setPendingDelete] = useState<Session | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchHistory = async () => {
    try {
      const token = authService.getAccessToken();
      if (!token) {
        setError("Not authenticated");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/sessions/history`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) return;
        throw new Error("Failed to fetch history");
      }

      const data = await response.json();
      setSessions(data.sessions || []);
    } catch {
      setError("Failed to load history. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const id = pendingDelete.id;
    setDeletingId(id);
    try {
      const result = await authService.deleteSession(id);
      if (!result.success) {
        toast.error(result.message || "Could not delete");
        return;
      }
      setSessions((prev) => prev.filter((s) => s.id !== id));
      toast.success("Conversation deleted");
      setPendingDelete(null);
    } finally {
      setDeletingId(null);
    }
  };

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-display font-bold mb-1">Chat History</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Your previous transcript summaries
        </p>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-20 rounded-xl bg-muted/40 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-display font-bold mb-1">Chat History</h1>
        <p className="text-sm text-red-500 mt-4">{error}</p>
      </div>
    );
  }

  // ── Empty state ────────────────────────────────────────────────────────────
  if (sessions.length === 0) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-display font-bold mb-1">Chat History</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Your previous transcript summaries
        </p>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Inbox className="w-10 h-10 text-muted-foreground mb-3" />
          <p className="text-sm font-medium">No history yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Upload a transcript and start chatting to see it here.
          </p>
        </div>
      </div>
    );
  }

  // ── Sessions list ──────────────────────────────────────────────────────────
  return (
    <>
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-display font-bold mb-1">Chat History</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Your previous transcript summaries
        </p>

        <div className="space-y-3">
          {sessions.map((session, i) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-stretch gap-2 rounded-xl bg-card border border-border hover:border-primary/30 transition-all duration-300 hover:glow-red group"
            >
              <Link
                to={`/chat?session=${session.id}`}
                className="flex flex-1 items-center gap-4 p-4 min-w-0 rounded-l-xl"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium truncate">{session.title}</h3>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(session.updated_at)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {session.message_count} messages
                    </span>
                    {session.file_name && (
                      <span className="text-xs text-muted-foreground truncate max-w-[160px]">
                        📎 {session.file_name}
                      </span>
                    )}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 hidden sm:block" />
              </Link>
              <div className="flex items-center pr-3 shrink-0">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={deletingId === session.id}
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  aria-label="Delete conversation"
                  onClick={(e) => {
                    e.preventDefault();
                    setPendingDelete(session);
                  }}
                >
                  {deletingId === session.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open && deletingId) return;
          if (!open) setPendingDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the session, all messages, and the uploaded PDF from storage. This cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!deletingId}>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={!!deletingId}
              onClick={() => void confirmDelete()}
            >
              {deletingId ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting…
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default History;
