import { MessageSquare, Clock, Settings, LogOut, Zap, X } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/authService";

const menuItems = [
  { title: "Chat", url: "/chat", icon: MessageSquare },
  { title: "History", url: "/history", icon: Clock },
  { title: "Settings", url: "/settings", icon: Settings },
];

interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;
}

export const MobileSidebar = ({ open, onClose }: MobileSidebarProps) => {
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    await authService.signout();
    navigate("/login");
  };

  return (
  <AnimatePresence>
    {open && (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
        <motion.aside
          initial={{ x: -280 }}
          animate={{ x: 0 }}
          exit={{ x: -280 }}
          transition={{ type: "spring", damping: 25 }}
          className="fixed left-0 top-0 w-64 h-screen bg-sidebar border-r border-border z-50 flex flex-col md:hidden"
        >
          <div className="p-6 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <span className="font-display font-bold text-lg text-foreground">Meeting Summarizer Assistant</span>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {menuItems.map((item) => (
              <NavLink
                key={item.url}
                to={item.url}
                end
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground transition-all duration-200 hover:bg-sidebar-accent hover:text-foreground"
                activeClassName="bg-primary/10 text-primary"
                onClick={onClose}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.title}</span>
              </NavLink>
            ))}
          </nav>
          <div className="p-4 border-t border-border">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </motion.aside>
      </>
    )}
  </AnimatePresence>
  );
}
