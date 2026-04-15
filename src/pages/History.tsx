import { motion } from "framer-motion";
import { FileText, Clock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const historyItems = [
  { id: 1, title: "Q2 Planning Meeting", date: "Apr 12, 2026", messages: 14 },
  { id: 2, title: "Product Roadmap Review", date: "Apr 10, 2026", messages: 22 },
  { id: 3, title: "Engineering Standup", date: "Apr 8, 2026", messages: 8 },
  { id: 4, title: "Client Onboarding Call", date: "Apr 5, 2026", messages: 18 },
  { id: 5, title: "Budget Approval Meeting", date: "Apr 3, 2026", messages: 11 },
];

const History = () => (
  <div className="p-6 max-w-4xl mx-auto">
    <h1 className="text-2xl font-display font-bold mb-1">Chat History</h1>
    <p className="text-sm text-muted-foreground mb-6">Your previous transcript summaries</p>

    <div className="space-y-3">
      {historyItems.map((item, i) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <Link
            to="/chat"
            className="group flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-all duration-300 hover:glow-red"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium truncate">{item.title}</h3>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {item.date}
                </span>
                <span className="text-xs text-muted-foreground">{item.messages} messages</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </Link>
        </motion.div>
      ))}
    </div>
  </div>
);

export default History;
