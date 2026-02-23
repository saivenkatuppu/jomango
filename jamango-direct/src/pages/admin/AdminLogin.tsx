import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, User, Leaf } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import client from "@/api/client";

// Simple SVG for a Mango shape
const MangoIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12.5 2C12.5 2 11.5 5 8.5 6C5.5 7 2 9 2 13.5C2 18.2 5.8 22 10.5 22C15.2 22 19 19.5 20.5 15.5C22 11.5 21 6.5 17 4.5C14.5 3.2 12.5 2 12.5 2Z" />
    <path d="M12.5 2C13 1 14.5 0.5 15.5 1.5C14 2 13 3 12.5 2Z" fill="#4A5D23" />
  </svg>
);

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "staff" | "stall">("admin");
  const navigate = useNavigate();
  const [animateBg, setAnimateBg] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setAnimateBg(true);
  }, []);

  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      setLoading(true);
      setError("");
      try {
        const { data } = await client.post('/users/login', { email, password });

        const isUserAdmin = data.isAdmin || data.role === "admin";
        const isUserStaff = data.role === "staff";

        if (role === "admin" && isUserAdmin) {
          await login({ email, password });
          navigate("/admin/dashboard");
        } else if (role === "staff" && isUserStaff) {
          await login({ email, password });
          navigate("/admin/dashboard");
        } else if (role === "stall" && data.role === "stall_owner") {
          await login({ email, password });
          navigate("/admin/dashboard");
        } else {
          setError(`Not authorized as ${role}. Please check your credentials.`);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "Invalid credentials. Check server connection.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF7F0] relative overflow-hidden flex items-center justify-center p-6">

      {/* Animated Background - Floating Mangoes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            initial={{
              opacity: 0,
              y: Math.random() * 100 + 100,
              x: Math.random() * window.innerWidth
            }}
            animate={{
              opacity: [0.1, 0.3, 0.1],
              y: [0, -1000],
              rotate: [0, 360]
            }}
            transition={{
              duration: Math.random() * 20 + 15, // Slow float
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 10
            }}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
            }}
          >
            <div style={{ width: Math.random() * 40 + 20, height: Math.random() * 40 + 20, color: "hsl(44,80%,46%)", opacity: 0.2 }}>
              <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.5 2C12.5 2 11.5 5 8.5 6C5.5 7 2 9 2 13.5C2 18.2 5.8 22 10.5 22C15.2 22 19 19.5 20.5 15.5C22 11.5 21 6.5 17 4.5C14.5 3.2 12.5 2 12.5 2Z" />
                <path d="M12.5 2C13 1 14.5 0.5 15.5 1.5C14 2 13 3 12.5 2Z" opacity="0.5" />
              </svg>
            </div>
          </motion.div>
        ))}

        {/* Floating Leaves for contrast */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`leaf-${i}`}
            initial={{
              opacity: 0,
              y: 800,
            }}
            animate={{
              opacity: [0, 0.4, 0],
              y: -100,
              rotate: [0, 180]
            }}
            transition={{
              duration: Math.random() * 20 + 10,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 5
            }}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
            }}
          >
            <Leaf
              style={{ width: Math.random() * 30 + 15, height: Math.random() * 30 + 15 }}
              className="text-[#4A5D23] opacity-20"
            />
          </motion.div>
        ))}
      </div>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-[hsl(44,80%,46%)]/30 shadow-2xl rounded-3xl p-8 relative z-10"
      >
        <div className="text-center mb-8 relative">
          <div className="inline-block p-4 rounded-full bg-[hsl(44,80%,46%)]/10 mb-4 animate-pulse">
            <img
              src="/logo.jpeg"
              alt="JAMANGO"
              className="w-16 h-16 object-contain drop-shadow-md rounded-full"
            />
          </div>

          <h1 className="font-display text-4xl font-bold text-charcoal mb-1 tracking-tight">
            JAMANGO
          </h1>
          <div className="flex items-center justify-center gap-2 opacity-70">
            <div className="h-px w-8 bg-charcoal/20"></div>
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-charcoal">Admin Portal</p>
            <div className="h-px w-8 bg-charcoal/20"></div>
          </div>
          {error && <div className="mt-4 text-red-500 text-sm font-medium bg-red-50 p-2 rounded">{error}</div>}
        </div>

        <form onSubmit={handleLogin} className="space-y-6">

          <div className="flex gap-6 justify-center mb-6 bg-white/50 p-3 rounded-xl border border-charcoal/10">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="role"
                value="admin"
                checked={role === "admin"}
                onChange={() => setRole("admin")}
                className="w-4 h-4 text-[hsl(44,80%,46%)] border-charcoal/20 focus:ring-[hsl(44,80%,46%)] cursor-pointer"
              />
              <span className={`font-medium text-sm transition-colors ${role === "admin" ? "text-[hsl(44,80%,46%)]" : "text-charcoal/60 group-hover:text-charcoal"}`}>Admin</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="role"
                value="staff"
                checked={role === "staff"}
                onChange={() => setRole("staff")}
                className="w-4 h-4 text-[hsl(44,80%,46%)] border-charcoal/20 focus:ring-[hsl(44,80%,46%)] cursor-pointer"
              />
              <span className={`font-medium text-sm transition-colors ${role === "staff" ? "text-[hsl(44,80%,46%)]" : "text-charcoal/60 group-hover:text-charcoal"}`}>Staff</span>
            </label>
            <div className="w-px h-5 bg-charcoal/10" />
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="role"
                value="stall"
                checked={role === "stall"}
                onChange={() => setRole("stall")}
                className="w-4 h-4 text-[hsl(44,80%,46%)] border-charcoal/20 focus:ring-[hsl(44,80%,46%)] cursor-pointer"
              />
              <span className={`font-medium text-sm transition-colors ${role === "stall" ? "text-[hsl(44,80%,46%)]" : "text-charcoal/60 group-hover:text-charcoal"}`}>Stall</span>
            </label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-charcoal/80 font-medium">Dashboard Access ID</Label>
            <div className="relative group">
              <User className="absolute left-3 top-3 h-5 w-5 text-charcoal/40 group-focus-within:text-[hsl(44,80%,46%)] transition-colors" />
              <Input
                id="email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={role === 'stall' ? "Mobile Number" : "admin@jamango.in"}
                required
                className="pl-10 h-12 rounded-xl border-charcoal/10 bg-white/50 focus:border-[hsl(44,80%,46%)] focus:ring-[hsl(44,80%,46%)]/20 transition-all font-body text-base"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="password" className="text-charcoal/80 font-medium">Secure Passkey</Label>
            </div>
            <div className="relative group">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-charcoal/40 group-focus-within:text-[hsl(44,80%,46%)] transition-colors" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="pl-10 h-12 rounded-xl border-charcoal/10 bg-white/50 focus:border-[hsl(44,80%,46%)] focus:ring-[hsl(44,80%,46%)]/20 transition-all font-body text-base"
              />
            </div>
          </div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="pt-2">
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-[hsl(44,80%,46%)] to-[hsl(38,90%,55%)] hover:from-[hsl(44,90%,40%)] hover:to-[hsl(38,100%,50%)] text-white font-bold text-lg shadow-lg shadow-[hsl(44,80%,46%)]/30 transition-all"
            >
              {loading ? "Verifying..." : "Enter Orchard"}
            </Button>
          </motion.div>
        </form>

        <div className="mt-8 text-center text-xs text-charcoal/40 font-medium space-y-2">
          <p>Restricted Access · Authorized Personnel Only</p>
          <p>© 2026 House of Munagala</p>
          <div className="pt-2">
            <a href="/" className="text-charcoal/40 hover:text-[hsl(44,80%,46%)] transition-colors underline">Back to Store</a>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
