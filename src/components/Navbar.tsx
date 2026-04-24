import { Menu, User } from "lucide-react";
import { useState, useEffect } from "react";
import { authService } from "@/services/authService";

interface NavbarProps {
  onMenuToggle?: () => void;
}

export const Navbar = ({ onMenuToggle }: NavbarProps) => {
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    // Keep navbar name in sync with the latest local session data.
    const syncName = () => {
      const currentUser = authService.getCurrentUser();
      if (currentUser && currentUser.username?.trim()) {
        setUserName(currentUser.username.trim());
      } else {
        setUserName("User");
      }
    };

    syncName();
    window.addEventListener("focus", syncName);
    window.addEventListener("storage", syncName);
    window.addEventListener("auth-user-updated", syncName);
    return () => {
      window.removeEventListener("focus", syncName);
      window.removeEventListener("storage", syncName);
      window.removeEventListener("auth-user-updated", syncName);
    };
  }, []);

  return (
  <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md flex items-center justify-between px-6 shrink-0">
    <div className="flex items-center gap-3">
      <button onClick={onMenuToggle} className="md:hidden text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted/50">
        <Menu className="w-5 h-5" />
      </button>
    </div>
    <div className="flex items-center gap-3">
      <div className="flex flex-col items-end">
        <p className="text-sm font-medium text-foreground">
          Welcome back, {userName} !
        </p>
        <p className="text-xs text-muted-foreground">
          Ready to process your meeting transcripts
        </p>
      </div>
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border border-primary/20">
        <User className="w-4 h-4 text-primary" />
      </div>
    </div>
  </header>
  );
};
