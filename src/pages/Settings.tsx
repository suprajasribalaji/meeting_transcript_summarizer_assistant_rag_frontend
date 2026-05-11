import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Mail, LogOut, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";

interface UserProfile {
  id: string
  email: string
  username?: string
  created_at?: string
  updated_at?: string
}

const Settings = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoadingProfile(true);
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        navigate("/login");
        return;
      }

      const userProfile = await authService.getUserProfile(currentUser.user_id);
      if (userProfile) {
        setProfile(userProfile);
        setFormData({
          username: userProfile.username || "",
          email: userProfile.email,
        });
      } else {
        setFormData({
          username: currentUser.username || "",
          email: currentUser.email,
        });
      }
      setLoadingProfile(false);
    };

    fetchUserProfile();
  }, [navigate]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    setMessage("");

    const currentUser = authService.getCurrentUser();
    if (!currentUser) return;

    const result = await authService.updateUserProfile(currentUser.user_id, {
      username: formData.username,
    });

    if (result.success) {
      setProfile((prev) => ({
        id: prev?.id || currentUser.user_id,
        email: prev?.email || currentUser.email,
        username: formData.username,
        created_at: prev?.created_at,
        updated_at: prev?.updated_at,
      }));
      setMessage("Profile updated successfully!");
      setTimeout(() => setMessage(""), 3000);
    } else {
      setMessage(result.message);
    }
    setSaving(false);
  };

  const handleLogout = () => {
    authService.signout();
    navigate("/login");
  }



  return (
    <div className="p-6 w-full mx-auto">
      <h1 className="text-2xl font-display font-bold mb-1">Settings</h1>
      <p className="text-sm text-muted-foreground mb-4">Manage your profile</p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-8 space-y-8"
      >
        {loadingProfile ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="w-7 h-7 animate-spin text-primary" />
            <p className="text-sm">Loading profile details...</p>
          </div>
        ) : (
          <>
        {/* User Profile Summary */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
            <User className="w-6 h-6 text-muted-foreground" />
          </div>
          <div>
            <h2 className="font-medium">{profile?.username || "User"}</h2>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Mail className="w-3.5 h-3.5" /> {profile?.email}
            </p>
          </div>
        </div>

        {/* Edit Profile Form */}
        <div className="border-t border-border pt-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Display Name</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className="w-full bg-muted/50 border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              disabled
              className="w-full bg-muted/50 border border-border rounded-lg px-4 py-2.5 text-sm text-foreground/50 cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
          </div>

          {/* Message Display */}
          {message && (
            <div className={`p-3 rounded-lg text-sm ${message.includes("successfully")
              ? "bg-green-500/10 border border-green-500/30 text-green-500"
              : "bg-red-500/10 border border-red-500/30 text-red-500"
              }`}>
              {message}
            </div>
          )}

          <button
            onClick={handleSaveChanges}
            disabled={saving}
            className="bg-primary hover:bg-accent text-primary-foreground font-medium px-6 py-2.5 rounded-lg transition-all duration-200 glow-red hover:glow-red-strong text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {/* Logout Section */}
        <div className="border-t border-border pt-6">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-destructive hover:text-destructive/80 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
          </>
        )}

      </motion.div>
    </div>
  );
};

export default Settings;
