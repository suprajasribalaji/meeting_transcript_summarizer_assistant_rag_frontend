import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, Eye, EyeOff, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { authService } from "../services/authService";

type AvailabilityState = "idle" | "checking" | "available" | "taken";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [nameState, setNameState] = useState<AvailabilityState>("idle");
  const [emailState, setEmailState] = useState<AvailabilityState>("idle");
  const [nameHint, setNameHint] = useState("");
  const [emailHint, setEmailHint] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameState("idle");
      setNameHint("");
      return;
    }

    setNameState("checking");
    setNameHint("Checking username...");

    const timer = window.setTimeout(async () => {
      const result = await authService.checkSignupAvailability(undefined, trimmedName);
      if (cancelled) return;

      if (!result.success) {
        setNameState("idle");
        setNameHint("");
        return;
      }

      if (result.username_available) {
        setNameState("available");
        setNameHint("Username is available");
      } else {
        setNameState("taken");
        setNameHint("Username is already taken");
      }
    }, 450);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [name]);

  useEffect(() => {
    let cancelled = false;
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setEmailState("idle");
      setEmailHint("");
      return;
    }

    setEmailState("checking");
    setEmailHint("Checking email...");

    const timer = window.setTimeout(async () => {
      const result = await authService.checkSignupAvailability(trimmedEmail, undefined);
      if (cancelled) return;

      if (!result.success) {
        setEmailState("idle");
        setEmailHint("");
        return;
      }

      if (result.email_available) {
        setEmailState("available");
        setEmailHint("Email is available");
      } else {
        setEmailState("taken");
        setEmailHint("Email is already registered");
      }
    }, 450);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [email]);

  const canSubmit =
    !loading &&
    name.trim().length > 0 &&
    email.trim().length > 0 &&
    password.length > 0 &&
    nameState !== "checking" &&
    emailState !== "checking" &&
    nameState !== "taken" &&
    emailState !== "taken";

  const renderStatusIcon = (state: AvailabilityState) => {
    if (state === "checking") {
      return <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />;
    }
    if (state === "available") {
      return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    }
    if (state === "taken") {
      return <XCircle className="w-4 h-4 text-red-500" />;
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError("");

    const result = await authService.signup(email, password, name);

    if (result.success) {
      navigate("/login");
    } else {
      setError(result.message || "Signup failed");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center glow-red">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <span className="font-display font-bold text-xl">Meeting Summarizer Assistant</span>
        </div>

        <div className="glass rounded-2xl p-8">
          <h1 className="text-2xl font-display font-bold mb-1">Create account</h1>
          <p className="text-sm text-muted-foreground mb-6">Get started with AI Transcript Summarizer</p>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-500">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-muted/50 border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all pr-10"
                  placeholder="username"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {renderStatusIcon(nameState)}
                </div>
              </div>
              {nameHint && (
                <p
                  className={`mt-1 text-xs ${
                    nameState === "taken"
                      ? "text-red-500"
                      : nameState === "available"
                      ? "text-emerald-500"
                      : "text-muted-foreground"
                  }`}
                >
                  {nameHint}
                </p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-muted/50 border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all pr-10"
                  placeholder="you@example.com"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {renderStatusIcon(emailState)}
                </div>
              </div>
              {emailHint && (
                <p
                  className={`mt-1 text-xs ${
                    emailState === "taken"
                      ? "text-red-500"
                      : emailState === "available"
                      ? "text-emerald-500"
                      : "text-muted-foreground"
                  }`}
                >
                  {emailHint}
                </p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-muted/50 border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all pr-10"
                  placeholder="Pwd@#123"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full bg-primary hover:bg-accent text-primary-foreground font-medium py-2.5 rounded-lg transition-all duration-200 glow-red hover:glow-red-strong disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="text-sm text-muted-foreground mt-6 text-center">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Login
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
