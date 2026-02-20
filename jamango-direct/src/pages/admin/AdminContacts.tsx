import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Mail, Phone, RefreshCw, Check, X } from "lucide-react";
import client from "@/api/client";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";

interface Subscriber {
    _id: string;
    email?: string;
    phone?: string;
    source: string;
    createdAt: string;
}

const AdminContacts = () => {
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");
    const [tab, setTab] = useState("email"); // email | mobile
    const [showForm, setShowForm] = useState(false);
    const [newContact, setNewContact] = useState({ email: "", phone: "" });
    const [saving, setSaving] = useState(false);

    const fetchSubscribers = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await client.get("/subscribers", {
                params: { type: tab, query }
            });
            setSubscribers(data);
        } catch (err) {
            console.error("Failed to fetch subscribers", err);
        } finally {
            setLoading(false);
        }
    }, [tab, query]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchSubscribers();
        }, 500);
        return () => clearTimeout(timer);
    }, [fetchSubscribers]);

    const handleAddContact = async () => {
        if (!newContact.email && !newContact.phone) {
            alert("Please enter details");
            return;
        }
        setSaving(true);
        try {
            await client.post("/subscribers/add", newContact);
            setShowForm(false);
            setNewContact({ email: "", phone: "" });
            fetchSubscribers();
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to add contact");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-display text-3xl font-semibold text-foreground">User Contacts</h1>
                    <p className="font-body text-muted-foreground mt-1">Manage your subscribers and leads</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={fetchSubscribers} className="gap-2">
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                    <Button size="sm" onClick={() => setShowForm(true)} className="gap-2">
                        <Plus className="h-4 w-4" /> Add Contact
                    </Button>
                </div>
            </div>

            {/* Add Form */}
            {showForm && (
                <div className="bg-card p-6 border border-border rounded-xl shadow-sm mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-lg">Add New Contact</h3>
                        <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-1">
                            <label className="text-xs font-medium uppercase text-muted-foreground">Email Address</label>
                            <Input
                                placeholder="name@example.com"
                                value={newContact.email}
                                onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium uppercase text-muted-foreground">Mobile Number</label>
                            <Input
                                placeholder="+91 99999 99999"
                                value={newContact.phone}
                                onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                        <Button onClick={handleAddContact} disabled={saving}>
                            {saving ? 'Saving...' : 'Save Contact'}
                        </Button>
                    </div>
                </div>
            )}

            <Tabs defaultValue="email" className="w-full" onValueChange={setTab}>
                <TabsList className="mb-4">
                    <TabsTrigger value="email" className="gap-2">
                        <Mail className="h-4 w-4" /> Email List
                    </TabsTrigger>
                    <TabsTrigger value="mobile" className="gap-2">
                        <Phone className="h-4 w-4" /> Mobile Numbers
                    </TabsTrigger>
                </TabsList>

                <div className="flex items-center gap-4 mb-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search contacts..."
                            className="pl-9"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>
                </div>

                <TabsContent value="email" className="mt-0">
                    <div className="bg-card border border-border rounded-xl overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-muted/50 border-b border-border">
                                <tr>
                                    <th className="text-left p-4 font-medium text-xs text-muted-foreground uppercase">Email Address</th>
                                    <th className="text-left p-4 font-medium text-xs text-muted-foreground uppercase">Source</th>
                                    <th className="text-left p-4 font-medium text-xs text-muted-foreground uppercase">Date Added</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {subscribers.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="p-8 text-center text-muted-foreground">No subscribers found.</td>
                                    </tr>
                                ) : (
                                    subscribers.map((sub) => (
                                        <tr key={sub._id} className="hover:bg-muted/30">
                                            <td className="p-4 text-sm font-medium">{sub.email}</td>
                                            <td className="p-4 text-xs text-muted-foreground capitalize">{sub.source}</td>
                                            <td className="p-4 text-xs text-muted-foreground">
                                                {new Date(sub.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </TabsContent>

                <TabsContent value="mobile" className="mt-0">
                    <div className="bg-card border border-border rounded-xl overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-muted/50 border-b border-border">
                                <tr>
                                    <th className="text-left p-4 font-medium text-xs text-muted-foreground uppercase">Mobile Number</th>
                                    <th className="text-left p-4 font-medium text-xs text-muted-foreground uppercase">Source</th>
                                    <th className="text-left p-4 font-medium text-xs text-muted-foreground uppercase">Date Added</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {subscribers.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="p-8 text-center text-muted-foreground">No mobile numbers found.</td>
                                    </tr>
                                ) : (
                                    subscribers.map((sub) => (
                                        <tr key={sub._id} className="hover:bg-muted/30">
                                            <td className="p-4 text-sm font-medium">{sub.phone}</td>
                                            <td className="p-4 text-xs text-muted-foreground capitalize">{sub.source}</td>
                                            <td className="p-4 text-xs text-muted-foreground">
                                                {new Date(sub.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AdminContacts;
