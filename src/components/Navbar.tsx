import { Menu, User } from "lucide-react";

interface NavbarProps {
  onMenuToggle?: () => void;
}

export const Navbar = ({ onMenuToggle }: NavbarProps) => (
  <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md flex items-center justify-between px-6 shrink-0">
    <div className="flex items-center gap-3">
      <button onClick={onMenuToggle} className="md:hidden text-muted-foreground hover:text-foreground transition-colors">
        <Menu className="w-5 h-5" />
      </button>
      <p className="text-sm text-muted-foreground">
        Welcome back, <span className="text-foreground font-medium">User</span>
      </p>
    </div>
    <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
      <User className="w-4 h-4 text-muted-foreground" />
    </div>
  </header>
);
