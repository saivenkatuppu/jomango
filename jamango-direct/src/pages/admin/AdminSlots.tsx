import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Clock, Plus, X, RefreshCw } from "lucide-react";
import client from "@/api/client";

interface Slot {
  _id: string;
  label: string;
  startTime: string;
  endTime: string;
  maxOrders: number;
  currentOrders: number;
  enabled: boolean;
}

const emptyForm = { label: "", startTime: "", endTime: "", maxOrders: "20" };

const AdminSlots = () => {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchSlots = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await client.get("/slots");
      setSlots(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load slots");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  const handleCreate = async () => {
    if (!form.label || !form.startTime || !form.endTime) {
      alert("Label, start time, and end time are required.");
      return;
    }
    setSaving(true);
    try {
      const { data } = await client.post("/slots", {
        label: form.label,
        startTime: form.startTime,
        endTime: form.endTime,
        maxOrders: Number(form.maxOrders) || 20,
      });
      setSlots((prev) => [...prev, data].sort((a, b) => a.startTime.localeCompare(b.startTime)));
      setShowForm(false);
      setForm(emptyForm);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to create slot");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (slot: Slot) => {
    setTogglingId(slot._id);
    try {
      const { data } = await client.put(`/slots/${slot._id}`, { enabled: !slot.enabled });
      setSlots((prev) => prev.map((s) => (s._id === data._id ? data : s)));
    } catch {
      alert("Toggle failed");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this slot?")) return;
    try {
      await client.delete(`/slots/${id}`);
      setSlots((prev) => prev.filter((s) => s._id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  const handleMaxOrdersUpdate = async (slot: Slot, newMax: number) => {
    try {
      const { data } = await client.put(`/slots/${slot._id}`, { maxOrders: newMax });
      setSlots((prev) => prev.map((s) => (s._id === data._id ? data : s)));
    } catch {
      alert("Update failed");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">Delivery Slots</h1>
          <p className="font-body text-muted-foreground mt-1">
            {loading ? "Loading..." : `${slots.length} slots configured`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchSlots} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button size="sm" onClick={() => setShowForm(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add Slot
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 font-body text-sm">{error}</div>
      )}

      {/* Create Form */}
      {showForm && (
        <div className="mb-8 bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold">New Slot</h2>
            <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Label</label>
              <Input
                placeholder="e.g. 10:00 AM – 12:00 PM"
                value={form.label}
                onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                className="h-10 rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Start Time</label>
              <Input
                type="time"
                value={form.startTime}
                onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                className="h-10 rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">End Time</label>
              <Input
                type="time"
                value={form.endTime}
                onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
                className="h-10 rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Max Orders</label>
              <Input
                type="number"
                placeholder="20"
                value={form.maxOrders}
                onChange={(e) => setForm((f) => ({ ...f, maxOrders: e.target.value }))}
                className="h-10 rounded-xl"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <Button onClick={handleCreate} disabled={saving}>
              {saving ? "Creating..." : "Create Slot"}
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Slots List */}
      <div className="space-y-4">
        {loading && (
          <div className="p-12 text-center font-body text-muted-foreground animate-pulse">Loading slots...</div>
        )}
        {!loading && slots.length === 0 && (
          <div className="p-12 text-center font-body text-muted-foreground">
            No slots configured yet. Click "Add Slot" to create your first delivery window.
          </div>
        )}
        {slots.map((slot) => {
          const isFull = slot.currentOrders >= slot.maxOrders;
          const pct = Math.min((slot.currentOrders / slot.maxOrders) * 100, 100);

          return (
            <div key={slot._id} className={`bg-card rounded-xl border p-6 flex items-center justify-between gap-4 transition-colors ${!slot.enabled ? "opacity-60" : ""} ${isFull ? "border-red-200" : "border-border"}`}>
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Clock className="h-5 w-5 text-mango-deep" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-body font-semibold text-foreground">{slot.label}</h3>
                  <p className="font-body text-sm text-muted-foreground">
                    {slot.currentOrders} / {slot.maxOrders} orders
                    {isFull && <span className="ml-2 text-red-600 font-medium">• Full</span>}
                  </p>
                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-secondary rounded-full mt-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${isFull ? "bg-red-500" : "bg-primary"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {/* Inline max orders edit */}
                <div className="hidden sm:flex items-center gap-1">
                  <span className="font-body text-xs text-muted-foreground">Max:</span>
                  <input
                    type="number"
                    defaultValue={slot.maxOrders}
                    onBlur={(e) => {
                      const val = Number(e.target.value);
                      if (val > 0 && val !== slot.maxOrders) handleMaxOrdersUpdate(slot, val);
                    }}
                    className="w-14 text-center text-sm border border-border rounded-lg px-1 py-1 bg-background font-body focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <Switch
                  checked={slot.enabled}
                  disabled={togglingId === slot._id}
                  onCheckedChange={() => handleToggle(slot)}
                />
                <button
                  onClick={() => handleDelete(slot._id)}
                  className="text-muted-foreground hover:text-red-500 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminSlots;
