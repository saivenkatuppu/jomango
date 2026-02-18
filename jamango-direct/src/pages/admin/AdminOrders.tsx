import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import client from "@/api/client";
import { RefreshCw } from "lucide-react";

interface OrderItem {
  name: string;
  variant: string;
  price: number;
  quantity: number;
}

interface Order {
  _id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: { address: string; city: string; zip: string };
  items: OrderItem[];
  totalAmount: number;
  paymentMode: "online" | "cod";
  paymentStatus: "pending" | "paid" | "failed";
  status: string;
  createdAt: string;
}

const statuses = ["All", "Pending", "Confirmed", "Out for delivery", "Delivered", "Cancelled"];

const statusColors: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-700",
  Confirmed: "bg-blue-100 text-blue-700",
  "Out for delivery": "bg-orange-100 text-orange-700",
  Delivered: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
};

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await client.get("/orders/admin");
      setOrders(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const { data } = await client.put(`/orders/admin/${orderId}/status`, { status: newStatus });
      setOrders((prev) => prev.map((o) => (o._id === data._id ? data : o)));
    } catch (err: any) {
      alert(err.response?.data?.message || "Status update failed");
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = orders.filter((o) => {
    if (filter !== "All" && o.status !== filter) return false;
    if (
      search &&
      !o.customerName.toLowerCase().includes(search.toLowerCase()) &&
      !o._id.toLowerCase().includes(search.toLowerCase()) &&
      !o.customerPhone.includes(search)
    )
      return false;
    return true;
  });

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">Orders</h1>
          <p className="font-body text-muted-foreground mt-1">
            {loading ? "Loading..." : `${orders.length} total orders`}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchOrders} disabled={loading} className="flex items-center gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 font-body text-sm">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Input
          placeholder="Search by name, phone, or order ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex gap-2 flex-wrap">
          {statuses.map((s) => (
            <Button
              key={s}
              variant={filter === s ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(s)}
              className="font-body text-xs"
            >
              {s}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {["Order ID", "Customer", "Phone", "Items", "Payment", "Status", "Amount", "Date", "Update Status"].map((h) => (
                <th key={h} className="text-left p-4 font-body text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((order) => (
              <tr key={order._id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                <td className="p-4 font-body text-xs font-mono text-muted-foreground">{order._id.slice(-8).toUpperCase()}</td>
                <td className="p-4 font-body text-sm font-medium text-foreground whitespace-nowrap">{order.customerName}</td>
                <td className="p-4 font-body text-sm text-muted-foreground">{order.customerPhone}</td>
                <td className="p-4 font-body text-xs text-muted-foreground max-w-[160px]">
                  {order.items.map((i) => `${i.name}${i.variant ? ` (${i.variant})` : ""} ×${i.quantity}`).join(", ")}
                </td>
                <td className="p-4">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${order.paymentMode === "cod" ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"}`}>
                    {order.paymentMode.toUpperCase()}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || "bg-gray-100 text-gray-600"}`}>
                    {order.status}
                  </span>
                </td>
                <td className="p-4 font-body text-sm font-medium text-foreground whitespace-nowrap">₹{order.totalAmount.toLocaleString()}</td>
                <td className="p-4 font-body text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                </td>
                <td className="p-4">
                  <select
                    value={order.status}
                    disabled={updatingId === order._id}
                    onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                    className="text-xs border border-border rounded-lg px-2 py-1.5 bg-background text-foreground font-body focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 cursor-pointer"
                  >
                    {["Pending", "Confirmed", "Out for delivery", "Delivered", "Cancelled"].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!loading && filtered.length === 0 && (
          <div className="p-12 text-center font-body text-muted-foreground">
            {orders.length === 0 ? "No orders yet. Orders will appear here once customers place them." : "No orders match your filter."}
          </div>
        )}

        {loading && (
          <div className="p-12 text-center font-body text-muted-foreground animate-pulse">
            Loading orders...
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
