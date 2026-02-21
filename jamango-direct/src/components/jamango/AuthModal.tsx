import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { X, Phone, Lock, User, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const AuthModal = ({ isOpen, onClose, onSuccess }: AuthModalProps) => {
    const { login, register } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);

    // Form fields
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isLogin) {
                await login({ phone, password });
                toast.success("Welcome back!");
            } else {
                if (!phone || !password || !name) {
                    toast.error("Please fill in all mandatory fields");
                    setLoading(false);
                    return;
                }
                await register({ name, phone, password, email });
                toast.success("Account created successfully!");
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Auth error:", error);
            toast.error(error.response?.data?.message || "Authentication failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-white rounded-[32px] p-0 overflow-hidden border-none shadow-2xl">
                <div className="p-8 pt-10">
                    <div className="text-center mb-8">
                        <DialogTitle className="text-3xl font-display font-bold text-charcoal mb-2">
                            {isLogin ? "Welcome Back" : "Create Account"}
                        </DialogTitle>
                        <DialogDescription className="text-charcoal/60">
                            {isLogin
                                ? "Enter your details to continue your order"
                                : "Join Jamango for exclusive access to the harvest"}
                        </DialogDescription>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/40" />
                                <Input
                                    placeholder="Your full name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="pl-12 py-6 rounded-2xl border-stone-200 focus:ring-primary/20 focus:border-primary"
                                    required={!isLogin}
                                />
                            </div>
                        )}

                        <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/40" />
                            <Input
                                placeholder="Mobile Number"
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="pl-12 py-6 rounded-2xl border-stone-200 focus:ring-primary/20 focus:border-primary"
                                required
                            />
                        </div>

                        {!isLogin && (
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/40" />
                                <Input
                                    placeholder="Email Address (Optional)"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-12 py-6 rounded-2xl border-stone-200 focus:ring-primary/20 focus:border-primary"
                                />
                            </div>
                        )}

                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/40" />
                            <Input
                                placeholder="Password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pl-12 py-6 rounded-2xl border-stone-200 focus:ring-primary/20 focus:border-primary"
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-lg shadow-primary/20 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 mt-2"
                        >
                            {loading ? "Processing..." : (
                                <>
                                    {isLogin ? "Login to Order" : "Sign Up & Order"}
                                    <ArrowRight className="h-5 w-5" />
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-stone-100 text-center">
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-stone-500 hover:text-primary font-medium transition-colors"
                        >
                            {isLogin
                                ? "Don't have an account? Create one"
                                : "Already have an account? Sign in"}
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default AuthModal;
