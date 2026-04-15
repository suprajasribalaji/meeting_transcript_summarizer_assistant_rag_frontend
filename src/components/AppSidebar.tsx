import { MessageSquare, Clock, Settings, LogOut, Zap } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";

const menuItems = [
  { title: "Chat", url: "/chat", icon: MessageSquare },
  { title: "History", url: "/history", icon: Clock },
  { title: "Settings", url: "/settings", icon: Settings },
];

export const AppSidebar = () => {
  const location = useLocation();

  return (
    <aside className="w-64 h-screen bg-sidebar border-r border-border flex flex-col shrink-0 max-md:hidden">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <span className="font-display font-bold text-lg text-foreground">AI Transcript</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.url}
            to={item.url}
            end
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground transition-all duration-200 hover:bg-sidebar-accent hover:text-foreground"
            activeClassName="bg-primary/10 text-primary glow-red"
          >
            <item.icon className="w-4 h-4" />
            <span>{item.title}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-border">
        <NavLink
          to="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground transition-all duration-200 hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </NavLink>
      </div>
    </aside>
  );
};
