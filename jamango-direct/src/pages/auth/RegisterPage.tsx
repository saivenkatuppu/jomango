import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion } from "framer-motion";

const RegisterPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const { register } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await register({ name, email, password, phone });
            toast.success("Welcome!", {
                description: "Your account has been created successfully.",
            });
            navigate("/");
        } catch (error: any) {
            toast.error("Registration failed", {
                description: error.response?.data?.message || "Invalid registration data",
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
                    <p className="text-charcoal/60">Join the mango family</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-charcoal/80 mb-1">Full Name</label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your Name"
                            required
                            className="rounded-xl border-stone-200 focus:border-[hsl(44,90%,40%)] focus:ring-[hsl(44,90%,40%)]"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-charcoal/80 mb-1">Email</label>
                        <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="hello@example.com"
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
                    <div>
                        <label className="block text-sm font-medium text-charcoal/80 mb-1">Phone (Optional)</label>
                        <Input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+91..."
                            className="rounded-xl border-stone-200 focus:border-[hsl(44,90%,40%)] focus:ring-[hsl(44,90%,40%)]"
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-[hsl(44,90%,45%)] hover:bg-[hsl(44,90%,40%)] text-white rounded-xl py-6 text-lg font-medium transition-all duration-300 shadow-md hover:shadow-lg mt-4"
                        disabled={loading}
                    >
                        {loading ? "Creating Account..." : "Create Account"}
                    </Button>
                </form>

                <div className="mt-6 text-center text-sm text-charcoal/60">
                    Already have an account?{" "}
                    <Link to="/login" className="text-[hsl(44,90%,40%)] font-semibold hover:underline">
                        Sign in
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default RegisterPage;
