import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion } from "framer-motion";

const LoginPage = () => {
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/";
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login({ phone, password });
            toast.success("Welcome back!", {
                description: "You have successfully logged in.",
            });
            navigate(from, { replace: true });
        } catch (error: any) {
            toast.error("Login failed", {
                description: error.response?.data?.message || "Invalid mobile number or password",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-white p-8 rounded-[32px] shadow-xl border border-[hsl(44,30%,90%)]"
            >
                <div className="text-center mb-8">
                    <h1 className="font-display text-4xl text-[hsl(44,90%,40%)] mb-2">Jamango</h1>
                    <p className="text-charcoal/60">Welcome back to the mango family</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-charcoal/80 mb-1">Mobile Number</label>
                        <Input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Enter mobile number"
                            required
                            className="rounded-xl border-stone-200 focus:border-[hsl(44,90%,40%)] focus:ring-[hsl(44,90%,40%)]"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-charcoal/80 mb-1">Password</label>
                        <Input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="rounded-xl border-stone-200 focus:border-[hsl(44,90%,40%)] focus:ring-[hsl(44,90%,40%)]"
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-[hsl(44,90%,45%)] hover:bg-[hsl(44,90%,40%)] text-white rounded-xl py-6 text-lg font-medium transition-all duration-300 shadow-md hover:shadow-lg mt-4"
                        disabled={loading}
                    >
                        {loading ? "Signing in..." : "Sign In"}
                    </Button>
                </form>

                <div className="mt-6 text-center text-sm text-charcoal/60">
                    Don't have an account?{" "}
                    <Link to="/register" className="text-[hsl(44,90%,40%)] font-semibold hover:underline">
                        Register for free
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;
