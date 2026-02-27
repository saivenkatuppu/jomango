import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import client from "@/api/client";
import { User, KeyRound, Shield } from "lucide-react";

const AdminProfile = () => {
    const { user, login } = useAuth();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: user?.name || "",
        email: user?.email || "",
        phone: user?.phone || "",
        newPassword: "",
        confirmPassword: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
            toast({
                title: "Passwords do not match",
                description: "New password and confirmation must match.",
                variant: "destructive"
            });
            return;
        }

        setIsLoading(true);

        try {
            const updateData: any = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
            };

            if (formData.newPassword) {
                updateData.password = formData.newPassword;
            }

            const { data } = await client.put('/users/profile', updateData);

            // Update local storage and context if credentials changed
            const activeRole = sessionStorage.getItem('active_role');
            if (activeRole === 'admin') {
                localStorage.setItem('adminToken', data.token);
                localStorage.setItem('adminInfo', JSON.stringify(data));
            } else if (activeRole === 'staff') {
                localStorage.setItem('staffToken', data.token);
                localStorage.setItem('staffInfo', JSON.stringify(data));
            } else if (activeRole === 'stall') {
                localStorage.setItem('stallToken', data.token);
                localStorage.setItem('stallInfo', JSON.stringify(data));
            }

            toast({
                title: "Profile Updated",
                description: "Your profile has been updated successfully.",
            });

            // Clear password fields
            setFormData(prev => ({
                ...prev,
                newPassword: "",
                confirmPassword: ""
            }));

            // We force a page reload to rehydrate the context with the new data
            // or we can call some refresh function if available
            setTimeout(() => window.location.reload(), 1000);

        } catch (error: any) {
            toast({
                title: "Update Failed",
                description: error.response?.data?.message || "Failed to update profile",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-display font-bold text-charcoal flex items-center gap-3">
                    <User className="h-8 w-8 text-[hsl(44,80%,46%)]" />
                    Profile Settings
                </h1>
                <p className="text-muted-foreground mt-2 font-body">
                    Update your account details and password.
                </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-8 relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[hsl(44,80%,46%)]/10 rounded-bl-full -z-0"></div>

                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Account Details */}
                        <div className="space-y-5">
                            <h3 className="font-display font-bold text-lg text-charcoal border-b border-black/10 pb-2 mb-4">
                                Account Details
                            </h3>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full p-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-[hsl(44,80%,46%)] transition-shadow"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full p-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-[hsl(44,80%,46%)] transition-shadow"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    className="w-full p-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-[hsl(44,80%,46%)] transition-shadow bg-gray-50"
                                    readOnly={user?.role === 'staff' || user?.role === 'stall_owner'} // Prevent some roles from changing their phone number if it's their main identity
                                    title={user?.role !== 'admin' ? "Contact admin to change phone number" : ""}
                                />
                            </div>
                        </div>

                        {/* Password Change */}
                        <div className="space-y-5">
                            <h3 className="font-display font-bold text-lg text-charcoal border-b border-black/10 pb-2 mb-4 flex items-center gap-2">
                                <KeyRound className="h-5 w-5 text-gray-400" />
                                Change Password
                            </h3>
                            <p className="text-xs text-gray-500 mb-2">Leave blank if you don't want to change your password.</p>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">New Password</label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    className="w-full p-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-[hsl(44,80%,46%)] transition-shadow"
                                    placeholder="Enter new password"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Confirm New Password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full p-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-[hsl(44,80%,46%)] transition-shadow"
                                    placeholder="Confirm new password"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-black/10 mt-8 flex justify-end">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-[hsl(44,80%,46%)] text-white px-8 py-3 rounded-xl font-bold hover:bg-[hsl(44,90%,40%)] transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                        >
                            {isLoading ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminProfile;
